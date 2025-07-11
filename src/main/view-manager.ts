import { dialog, ipcMain } from 'electron';
import { View } from './view';
import { AppWindow } from './windows';
import { WEBUI_BASE_URL } from '~/constants/files';

import {
  ZOOM_FACTOR_MIN,
  ZOOM_FACTOR_MAX,
  ZOOM_FACTOR_INCREMENT,
} from '~/constants/web-contents';
import { EventEmitter } from 'events';
import { Application } from './application';
import { extname } from 'path';

export class ViewManager extends EventEmitter {
  public views = new Map<number, View>();
  public selectedId = 0;
  public _fullscreen = false;
  private selectionQueue: number[] = [];
  private isProcessingQueue = false;

  public incognito: boolean;

  private readonly window: AppWindow;

  public get fullscreen() {
    return this._fullscreen;
  }

  public set fullscreen(val: boolean) {
    this._fullscreen = val;
    this.fixBounds();
  }

  public constructor(window: AppWindow, incognito: boolean) {
    super();

    this.window = window;
    this.incognito = incognito;

    const { id } = window.win;
    ipcMain.handle(`view-create-${id}`, (e, details) => {
      return this.create(details, false, false).id;
    });

    ipcMain.handle(`views-create-${id}`, (e, options) => {
      return options.map((option: any) => {
        return this.create(option, false, false).id;
      });
    });

    ipcMain.on(`add-tab-${id}`, (e, details) => {
      const view = this.create(details);
      if (details.active) {
        this.enqueueSelection(view.id);
      }
    });

    ipcMain.on('create-tab-menu-extra', (e, details: any) => {
      const view = this.create(details);
      if (details.active) {
        this.enqueueSelection(view.id);
      }
    });

    ipcMain.on('save-as-menu-extra', async (e) => {
      const view = this.selected;
      if (!view) return;

      const { title, webContents } = view;

      const { canceled, filePath } = await dialog.showSaveDialog({
        defaultPath: title,
        filters: [
          { name: 'Webpage, Complete', extensions: ['html', 'htm'] },
          { name: 'Webpage, HTML Only', extensions: ['htm', 'html'] },
        ],
      });

      if (canceled || !filePath) return;

      const ext = extname(filePath);

      await webContents.savePage(
        filePath,
        ext === '.htm' ? 'HTMLOnly' : 'HTMLComplete',
      );
    });

    ipcMain.on('Print', () => {
      this.selected?.webContents.print();
    });

    ipcMain.handle(
      `view-select-${id}`,
      async (e, id: number, focus: boolean) => {
        await this.enqueueSelection(id, focus);
      },
    );

    ipcMain.removeHandler('get-tab-zoom');
    ipcMain.handle('get-tab-zoom', (e: any, tabId: number) => {
      return this.selected?.webContents.zoomFactor ?? 1;
    });

    ipcMain.on(`view-destroy-${id}`, (e, id: number) => {
      this.destroy(id);
    });

    ipcMain.on(`mute-view-${id}`, (e, tabId: number) => {
      const view = this.views.get(tabId);
      view?.webContents.setAudioMuted(true);
    });

    ipcMain.on(`unmute-view-${id}`, (e, tabId: number) => {
      const view = this.views.get(tabId);
      view?.webContents.setAudioMuted(false);
    });

    ipcMain.on(`web-contents-view-clear-${id}`, () => {
      this.clear();
    });

    ipcMain.on('change-zoom', (e, zoomDirection) => {
      const view = this.selected;
      if (!view) return;

      const newZoomFactor =
        view.webContents.zoomFactor +
        (zoomDirection === 'in'
          ? ZOOM_FACTOR_INCREMENT
          : -ZOOM_FACTOR_INCREMENT);

      if (
        newZoomFactor <= ZOOM_FACTOR_MAX &&
        newZoomFactor >= ZOOM_FACTOR_MIN
      ) {
        view.webContents.zoomFactor = newZoomFactor;
        view.emitEvent('zoom-updated', view.webContents.zoomFactor);
      } else {
        e.preventDefault();
      }
      this.emitZoomUpdate();
    });

    ipcMain.on('change-zoom-menu', (e, zoomDirection) => {
      const view = this.selected;
      if (!view) return;

      const newZoomFactor =
        view.webContents.zoomFactor +
        (zoomDirection === 'in'
          ? ZOOM_FACTOR_INCREMENT
          : -ZOOM_FACTOR_INCREMENT);

      if (
        newZoomFactor <= ZOOM_FACTOR_MAX &&
        newZoomFactor >= ZOOM_FACTOR_MIN
      ) {
        view.webContents.zoomFactor = newZoomFactor;
        view.emitEvent('zoom-updated', view.webContents.zoomFactor);
      } else {
        e.preventDefault();
      }
      this.emitZoomUpdate(false);
    });

    ipcMain.on('reset-zoom', (e) => {
      const view = this.selected;
      if (!view) return;

      view.webContents.zoomFactor = 1;
      view.emitEvent('zoom-updated', view.webContents.zoomFactor);
      this.emitZoomUpdate();
    });

    this.setBoundsListener();
  }

  private enqueueSelection(id: number, focus = true) {
    if (this.selectedId === id) return;

    // Clear the queue if we're selecting a new tab directly
    this.selectionQueue = [id];
    
    if (!this.isProcessingQueue) {
      this.processSelectionQueue(focus);
    }
  }

  private async processSelectionQueue(focus: boolean) {
    if (this.selectionQueue.length === 0 || this.isProcessingQueue) return;
    
    this.isProcessingQueue = true;
    const id = this.selectionQueue[0];

    try {
      await this.internalSelect(id, focus);
      this.selectionQueue.shift();
      
      if (this.selectionQueue.length > 0) {
        setImmediate(() => this.processSelectionQueue(focus));
      }
    } catch (error) {
      console.error('Error in processSelectionQueue:', error);
    } finally {
      this.isProcessingQueue = false;
    }
  }

  public get selected(): View | undefined {
    return this.views.get(this.selectedId);
  }

  public get settingsView() {
    return Object.values(this.views).find((r) =>
      r.url.startsWith(`${WEBUI_BASE_URL}settings`),
    );
  }

  public create(
    details: chrome.tabs.CreateProperties,
    isNext = false,
    sendMessage = true,
  ) {
    const view = new View(this.window, details.url, this.incognito);

    const { webContents } = view.webContentsView;
    const { id } = view;

    this.views.set(id, view);

    if (process.env.ENABLE_EXTENSIONS) {
      Application.instance.sessions.chromeExtensions.addTab(
        webContents,
        this.window.win,
      );

      if (details.active) {
        Application.instance.sessions.chromeExtensions.selectTab(webContents);
      }
    }

    webContents.once('destroyed', () => {
      this.views.delete(id);
    });

    if (sendMessage) {
      this.window.send('create-tab', { ...details }, isNext, id);
    }
    return view;
  }

  public clear() {
    this.window.win.setContentView(null);
    this.views.forEach((x) => x.destroy());
    this.views.clear();
  }

  public async select(id: number, focus = true) {
    await this.enqueueSelection(id, focus);
  }

  private async internalSelect(id: number, focus = true) {
    const { selected } = this;
    const view = this.views.get(id);
    
    if (!view) {
      return;
    }

    this.selectedId = id;

    if (selected) {
      this.window.win.contentView.removeChildView(selected.webContentsView);
    }

    this.window.win.contentView.addChildView(view.webContentsView);

    if (focus) {
      view.webContents.focus();
    } else {
      this.window.webContents.focus();
    }

    this.window.updateTitle();
    view.updateBookmark();

    await this.fixBounds();

    view.updateNavigationState();

    if (process.env.ENABLE_EXTENSIONS) {
      Application.instance.sessions.chromeExtensions.selectTab(view.webContents);
    }
    
    this.emit('activated', id);
  }

  public changeZoom(zoomDirection: 'in' | 'out', e?: any) {
    const view = this.selected;
    if (!view) return;

    const newZoomFactor =
      view.webContents.zoomFactor +
      (zoomDirection === 'in' ? ZOOM_FACTOR_INCREMENT : -ZOOM_FACTOR_INCREMENT);

    if (newZoomFactor <= ZOOM_FACTOR_MAX && newZoomFactor >= ZOOM_FACTOR_MIN) {
      view.webContents.zoomFactor = newZoomFactor;
      view.emitEvent('zoom-updated', view.webContents.zoomFactor);
    } else {
      e?.preventDefault();
    }
    this.emitZoomUpdate();
  }

  public async fixBounds() {
    const view = this.selected;
    if (!view || !this.window.win) return;

    try {
      const { width, height } = this.window.win.getContentBounds();

      const toolbarContentHeight = await this.window.win.webContents
        .executeJavaScript(`
          document.getElementById('app')?.offsetHeight || 0
        `);

      const newBounds = {
        x: 0,
        y: this.fullscreen ? 0 : toolbarContentHeight,
        width,
        height: this.fullscreen ? height : height - toolbarContentHeight,
      };

      if (JSON.stringify(newBounds) !== JSON.stringify(view.bounds)) {
        view.webContentsView.setBounds(newBounds);
        view.bounds = newBounds;
      }
    } catch (error) {
      console.error('Error in fixBounds:', error);
    }
  }

  private async setBoundsListener() {
    try {
      await this.window.webContents.executeJavaScript(`
          const {ipcRenderer} = require('electron');
          const resizeObserver = new ResizeObserver(([{ contentRect }]) => {
            ipcRenderer.send('resize-height');
          });
          const app = document.getElementById('app');
          if (app) {
            resizeObserver.observe(app);
          }
        `);

      this.window.webContents.on('ipc-message', (e, message) => {
        if (message === 'resize-height') {
          this.fixBounds();
        }
      });
    } catch (error) {
      console.error('Error in setBoundsListener:', error);
    }
  }

  public destroy(id: number) {
    const view = this.views.get(id);
    if (!view) return;

    this.views.delete(id);

    if (!view.webContentsView.webContents.isDestroyed()) {
      this.window.win.contentView.removeChildView(view.webContentsView);
      view.destroy();
      this.emit('removed', id);
    }

    // If we're destroying the currently selected tab, select another one
    if (this.selectedId === id && this.views.size > 0) {
      const lastView = Array.from(this.views.values()).pop();
      if (lastView) {
        this.enqueueSelection(lastView.id);
      }
    }
  }

  public emitZoomUpdate(showDialog = true) {
    const view = this.selected;
    if (!view) return;

    Application.instance.dialogs
      .getDynamic('zoom')
      ?.webContentsView?.webContents?.send(
        'zoom-factor-updated',
        view.webContents.zoomFactor,
      );

    this.window.webContents.send(
      'zoom-factor-updated',
      view.webContents.zoomFactor,
      showDialog,
    );
  }
}