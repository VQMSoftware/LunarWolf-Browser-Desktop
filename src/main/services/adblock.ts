import { promises as fs, existsSync } from 'fs';
import { join } from 'path';
import { app, ipcMain, session, Session } from 'electron';
import fetch from 'node-fetch';
import { ElectronBlocker, Request } from '@cliqz/adblocker-electron';

import { Application } from '../application';

export let adblockEngine: ElectronBlocker;

const PRELOAD_PATH = join(__dirname, 'preload.js');
const CACHE_PATH = join(app.getPath('userData'), 'adblock-cache.dat');

const FILTER_LIST_URLS = [
  'https://easylist.to/easylist/easylist.txt',
  'https://pgl.yoyo.org/adservers/serverlist.php?hostformat=adblockplus&showintro=1&mimetype=plaintext',
  'https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/resource-abuse.txt',
  'https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/badware.txt',
  'https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/filters.txt',
  'https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/unbreak.txt',
  'https://easylist.to/easylist/easyprivacy.txt',
  'https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/privacy.txt',
];

const loadAdblockEngine = async (): Promise<ElectronBlocker> => {
  const downloadAndSave = async () => {
    try {
      const blocker = await ElectronBlocker.fromLists(fetch, FILTER_LIST_URLS, {
        enableCompression: true,
      });

      try {
        await fs.writeFile(CACHE_PATH, blocker.serialize());
      } catch (err) {
        console.error('Error writing adblock cache:', err);
      }

      return blocker;
    } catch (err) {
      console.error('Error downloading adblock lists:', err);
      throw err; // Re-throw after logging
    }
  };

  if (existsSync(CACHE_PATH)) {
    try {
      const raw = await fs.readFile(CACHE_PATH);
      return await ElectronBlocker.deserialize(raw);
    } catch (err) {
      console.warn('Failed to deserialize adblock cache, redownloading...');
      return downloadAndSave();
    }
  }

  return downloadAndSave();
};

const emitBlocked = (req: Request) => {
  try {
    const win = Application.instance.windows.findByContentView(req.tabId);
    if (!win) return;

    const view = win.viewManager.views.get(req.tabId);
    view?.emitEvent?.('blocked-ad');
  } catch (err) {
    console.error('Error emitting blocked ad event:', err);
  }
};

interface AdblockHooks {
  onBeforeRequest?: Parameters<Session['webRequest']['onBeforeRequest']>[0];
  onHeadersReceived?: Parameters<Session['webRequest']['onHeadersReceived']>[0];
}

const sessionMap = new WeakMap<Session, AdblockHooks>();
let initialized = false;
let ipcHandlersRegistered = false;

export const runAdblockService = async (ses: Session): Promise<void> => {
  try {
    if (!initialized) {
      try {
        adblockEngine = await loadAdblockEngine();
        initialized = true;
      } catch (err) {
        console.error('Failed to initialize adblock engine:', err);
        return;
      }
    }

    if (!adblockEngine || sessionMap.has(ses)) return;

    const hooks: AdblockHooks = {
      onBeforeRequest: adblockEngine.onBeforeRequest.bind(adblockEngine),
      onHeadersReceived: adblockEngine.onHeadersReceived.bind(adblockEngine),
    };

    ses.webRequest.onBeforeRequest({ urls: ['<all_urls>'] }, hooks.onBeforeRequest!);
    ses.webRequest.onHeadersReceived({ urls: ['<all_urls>'] }, hooks.onHeadersReceived!);

    try {
      if (typeof (ses as any).registerPreloadScript === 'function') {
        (ses as any).registerPreloadScript({ path: PRELOAD_PATH });
      } else {
        const legacySession = ses as unknown as { getPreloads: () => string[]; setPreloads: (preloads: string[]) => void };
        legacySession.setPreloads([...legacySession.getPreloads(), PRELOAD_PATH]);
      }
    } catch (err) {
      console.error('Error setting up preload scripts:', err);
    }

    if (!ipcHandlersRegistered) {
      try {
        ipcMain.handle('get-cosmetic-filters', async (_, details) => {
          try {
            return await adblockEngine.getCosmeticsFilters(details);
          } catch (err) {
            console.error('Error getting cosmetic filters:', err);
            return { styles: '', scripts: '' };
          }
        });

        ipcMain.handle('is-mutation-observer-enabled', async () => {
          try {
            return adblockEngine.onIsMutationObserverEnabled;
          } catch (err) {
            console.error('Error checking mutation observer:', err);
            return false;
          }
        });

        ipcHandlersRegistered = true;
      } catch (err) {
        console.error('Error registering IPC handlers:', err);
      }
    }

    adblockEngine.on('request-blocked', emitBlocked);
    adblockEngine.on('request-redirected', emitBlocked);

    sessionMap.set(ses, hooks);
  } catch (err) {
    console.error('Error in runAdblockService:', err);
  }
};

export const stopAdblockService = (ses: Session): void => {
  try {
    const hooks = sessionMap.get(ses);
    if (!hooks) return;

    if (hooks.onBeforeRequest) {
      ses.webRequest.onBeforeRequest(null, hooks.onBeforeRequest);
    }

    if (hooks.onHeadersReceived) {
      ses.webRequest.onHeadersReceived(null, hooks.onHeadersReceived);
    }

    try {
      if (typeof (ses as any).removePreloadScript === 'function') {
        (ses as any).removePreloadScript(PRELOAD_PATH);
      } else {
        const legacySession = ses as unknown as { getPreloads: () => string[]; setPreloads: (preloads: string[]) => void };
        const newPreloads = legacySession.getPreloads().filter(p => p !== PRELOAD_PATH);
        legacySession.setPreloads(newPreloads);
      }
    } catch (err) {
      console.error('Error removing preload script:', err);
    }

    sessionMap.delete(ses);
  } catch (err) {
    console.error('Error in stopAdblockService:', err);
  }
};