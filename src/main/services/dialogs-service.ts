import { WebContentsView, app, ipcMain, BrowserWindow } from 'electron';
import { join } from 'path';
import { SearchDialog } from '../dialogs/search';
import { PreviewDialog } from '../dialogs/preview';
import { PersistentDialog } from '../dialogs/dialog';
import { Application } from '../application';
import { IRectangle } from '~/interfaces';
import { pathToFileURL } from 'url';

interface IDialogTabAssociation {
  tabId?: number;
  getTabInfo?: (tabId: number) => any;
  setTabInfo?: (tabId: number, ...args: any[]) => void;
}

type BoundsDisposition = 'move' | 'resize';

interface IDialogShowOptions {
  name: string;
  browserWindow: Electron.BrowserWindow;
  hideTimeout?: number;
  devtools?: boolean;
  tabAssociation?: IDialogTabAssociation;
  onWindowBoundsUpdate?: (disposition: BoundsDisposition) => void;
  onHide?: (dialog: IDialog) => void;
  getBounds: () => IRectangle;
}

export interface IDialog {
  name: string;
  webContentsView: WebContentsView;
  id: number;
  tabIds: number[];
  _sendTabInfo: (tabId: number) => void;
  hide: (tabId?: number) => void;
  handle: (name: string, cb: (...args: any[]) => any) => void;
  on: (name: string, cb: (...args: any[]) => any) => void;
  rearrange: (bounds?: IRectangle) => void;
}

export const roundifyRectangle = (rect: IRectangle): IRectangle => {
  const newRect: any = { ...rect };
  Object.keys(newRect).forEach((key) => {
    if (!isNaN(newRect[key])) newRect[key] = Math.round(newRect[key]);
  });
  return newRect;
};

export class DialogsService {
  public childViews: WebContentsView[] = [];
  public childViewDetails = new Map<number, boolean>();
  public dialogs: IDialog[] = [];
  public persistentDialogs: PersistentDialog[] = [];

  public run() {
    this.createChildView();
    this.persistentDialogs.push(new SearchDialog());
    this.persistentDialogs.push(new PreviewDialog());
  }

  private createChildView() {
    const view = new WebContentsView({
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        webviewTag: true,
        backgroundThrottling: false,
        // Transparent to enable window-level transparency
        transparent: true,
      },
    });

    require('@electron/remote/main').enable(view.webContents);

    view.webContents.loadURL('about:blank');
    this.childViews.push(view);
    this.childViewDetails.set(view.webContents.id, false);
    return view;
  }

  private async loadDialogURL(webContentsView: WebContentsView, name: string) {
    try {
      if (process.env.NODE_ENV === 'development') {
        await webContentsView.webContents.loadURL(`http://localhost:4444/${name}.html`);
      } else {
        const filePath = join(app.getAppPath(), 'build', `${name}.html`);
        const fileURL = pathToFileURL(filePath).toString();
        await webContentsView.webContents.loadURL(fileURL);
      }

      // Inject transparency CSS
      webContentsView.webContents.executeJavaScript(`
        document.documentElement.style.backgroundColor = 'transparent';
        document.body.style.backgroundColor = 'transparent';
        document.body.style.margin = '0';
      `).catch(console.error);
    } catch (error) {
      console.error(`Failed to load dialog ${name}:`, error);
      throw error;
    }
  }

  public show(options: IDialogShowOptions): IDialog {
    const {
      name,
      browserWindow,
      getBounds,
      devtools,
      onHide,
      hideTimeout,
      onWindowBoundsUpdate,
      tabAssociation,
    } = options;

    const foundDialog = this.getDynamic(name);
    let webContentsView = foundDialog?.webContentsView ||
      this.childViews.find(x => !this.childViewDetails.get(x.webContents.id));

    if (!webContentsView) {
      webContentsView = this.createChildView();
    }

    const appWindow = Application.instance.windows.fromBrowserWindow(browserWindow);

    if (foundDialog && tabAssociation) {
      foundDialog.tabIds.push(tabAssociation.tabId);
      foundDialog._sendTabInfo(tabAssociation.tabId);
    }

    browserWindow.webContents.send('dialog-visibility-change', name, true);
    this.childViewDetails.set(webContentsView.webContents.id, true);

    if (foundDialog) {
      browserWindow.contentView.addChildView(webContentsView);
      foundDialog.rearrange();
      return null;
    }

    browserWindow.contentView.addChildView(webContentsView);
    webContentsView.setBounds({ x: 0, y: 0, width: 1, height: 1 });

    if (devtools) {
      webContentsView.webContents.openDevTools({ mode: 'detach' });
    }

    const tabsEvents = {
      activate: (id: number) => {
        const visible = dialog.tabIds.includes(id);
        browserWindow.webContents.send('dialog-visibility-change', name, visible);
        if (visible) {
          dialog._sendTabInfo(id);
          browserWindow.contentView.removeChildView(webContentsView);
          browserWindow.contentView.addChildView(webContentsView);
        } else {
          browserWindow.contentView.removeChildView(webContentsView);
        }
      },
      remove: (id: number) => dialog.hide(id),
    };

    const windowEvents = {
      resize: () => emitWindowBoundsUpdate('resize'),
      move: () => emitWindowBoundsUpdate('move'),
    };

    const channels: string[] = [];
    const dialog: IDialog = {
      webContentsView,
      id: webContentsView.webContents.id,
      name,
      tabIds: tabAssociation?.tabId ? [tabAssociation.tabId] : [],
      _sendTabInfo: (tabId) => {
        if (tabAssociation?.getTabInfo) {
          const data = tabAssociation.getTabInfo(tabId);
          webContentsView.webContents.send('update-tab-info', tabId, data);
        }
      },
      hide: (tabId) => {
        const { selectedId } = appWindow.viewManager;
        dialog.tabIds = dialog.tabIds.filter(x => x !== (tabId || selectedId));

        if (tabId && tabId !== selectedId) return;

        browserWindow.webContents.send('dialog-visibility-change', name, false);
        browserWindow.contentView.removeChildView(webContentsView);

        if (tabAssociation && dialog.tabIds.length > 0) return;

        this.cleanupDialogResources(webContentsView, dialog, channels, tabsEvents, windowEvents, browserWindow, onHide);
      },
      handle: (name, cb) => {
        const channel = `${name}-${webContentsView.webContents.id}`;
        ipcMain.handle(channel, (...args) => cb(...args));
        channels.push(channel);
      },
      on: (name, cb) => {
        const channel = `${name}-${webContentsView.webContents.id}`;
        ipcMain.on(channel, (...args) => cb(...args));
        channels.push(channel);
      },
      rearrange: (rect = {}) => {
        webContentsView.setBounds({
          x: 0, y: 0, width: 0, height: 0,
          ...roundifyRectangle(getBounds()),
          ...roundifyRectangle(rect),
        });
      },
    };

    const emitWindowBoundsUpdate = (type: BoundsDisposition) => {
      if (tabAssociation && !dialog.tabIds.includes(appWindow.viewManager.selectedId)) {
        onWindowBoundsUpdate?.(type);
      }
    };

    if (tabAssociation) {
      appWindow.viewManager.on('removed', tabsEvents.remove);
      appWindow.viewManager.on('activated', tabsEvents.activate);
    }

    if (onWindowBoundsUpdate) {
      browserWindow.on('resize', windowEvents.resize);
      browserWindow.on('move', windowEvents.move);
    }

    webContentsView.webContents.once('dom-ready', () => {
      dialog.rearrange();
      webContentsView.webContents.focus();
    });

    this.loadDialogURL(webContentsView, name).catch(console.error);

    ipcMain.on(`hide-${webContentsView.webContents.id}`, () => dialog.hide());

    if (tabAssociation) {
      dialog.on('loaded', () => {
        if (tabAssociation.tabId) {
          dialog._sendTabInfo(tabAssociation.tabId);
        }
      });

      if (tabAssociation.setTabInfo) {
        dialog.on('update-tab-info', (e, tabId, ...args) => {
          tabAssociation.setTabInfo(tabId, ...args);
        });
      }
    }

    this.dialogs.push(dialog);
    return dialog;
  }

  private cleanupDialogResources(
    webContentsView: WebContentsView,
    dialog: IDialog,
    channels: string[],
    tabsEvents: { activate?: (id: number) => void; remove?: (id: number) => void },
    windowEvents: { resize?: () => void; move?: () => void },
    browserWindow: BrowserWindow,
    onHide?: (dialog: IDialog) => void
  ) {
    ipcMain.removeAllListeners(`hide-${webContentsView.webContents.id}`);
    channels.forEach(x => {
      ipcMain.removeHandler(x);
      ipcMain.removeAllListeners(x);
    });

    this.dialogs = this.dialogs.filter(x => x.id !== dialog.id);
    this.childViewDetails.set(webContentsView.webContents.id, false);

    if (this.childViews.length > 1) {
      // Optional cleanup logic
    } else {
      webContentsView.webContents.loadURL('about:blank');
    }

    if (tabsEvents.activate) {
      Application.instance.windows.fromBrowserWindow(browserWindow).viewManager.off('activated', tabsEvents.activate);
    }
    if (tabsEvents.remove) {
      Application.instance.windows.fromBrowserWindow(browserWindow).viewManager.off('removed', tabsEvents.remove);
    }

    browserWindow.removeListener('resize', windowEvents.resize);
    browserWindow.removeListener('move', windowEvents.move);

    if (onHide) onHide(dialog);
  }

  public getChildViews() {
    return [
      ...this.childViews,
      ...this.persistentDialogs.map(x => x.webContentsView).filter(Boolean),
    ];
  }

  public destroy() {
    this.getChildViews().forEach(x => {
      if (!x.webContents.isDestroyed()) {
        // Optional cleanup
      }
    });
  }

  public sendToAll(channel: string, ...args: any[]) {
    this.getChildViews().forEach(x => {
      if (!x.webContents.isDestroyed()) {
        x.webContents.send(channel, ...args);
      }
    });
  }

  public get(name: string) {
    return this.getDynamic(name) || this.getPersistent(name);
  }

  public getDynamic(name: string) {
    return this.dialogs.find(x => x.name === name);
  }

  public getPersistent(name: string) {
    return this.persistentDialogs.find(x => x.name === name);
  }

  public isVisible(name: string) {
    return !!this.getDynamic(name) || this.getPersistent(name)?.visible;
  }
}
