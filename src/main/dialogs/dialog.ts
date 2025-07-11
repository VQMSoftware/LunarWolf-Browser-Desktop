import { WebContentsView, app, ipcMain, BrowserWindow } from 'electron';
import { join } from 'path';
import { roundifyRectangle } from '../services/dialogs-service';
import { pathToFileURL } from 'url';

interface IOptions {
  name: string;
  devtools?: boolean;
  bounds?: IRectangle;
  hideTimeout?: number;
  customHide?: boolean;
  webPreferences?: Electron.WebPreferences;
}

interface IRectangle {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export class PersistentDialog {
  public browserWindow: BrowserWindow;
  public webContentsView: WebContentsView;

  public visible = false;

  public bounds: IRectangle = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  };

  public name: string;

  private timeout: any;
  private readonly hideTimeout: number;

  private loaded = false;
  private showCallback: any = null;

  public constructor({ bounds, name, hideTimeout, webPreferences }: IOptions) {
    this.webContentsView = new WebContentsView({
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        webviewTag: true,
        transparent: true, // Enable transparency
        ...webPreferences,
      },
    });

    require('@electron/remote/main').enable(this.webContentsView.webContents);

    this.bounds = { ...this.bounds, ...bounds };
    this.hideTimeout = hideTimeout;
    this.name = name;

    const { webContents } = this.webContentsView;

    ipcMain.on(`hide-${webContents.id}`, () => {
      this.hide(false, false);
    });

    webContents.once('dom-ready', () => {
      this.loaded = true;

      // Inject transparency styles
      webContents.executeJavaScript(`
        document.documentElement.style.backgroundColor = 'transparent';
        document.body.style.backgroundColor = 'transparent';
        document.body.style.margin = '0';
      `).catch(console.error);

      if (this.showCallback) {
        this.showCallback();
        this.showCallback = null;
      }
    });

    this.loadURL().catch(error => {
      console.error(`Failed to load dialog ${name}:`, error);
    });
  }

  private async loadURL() {
    if (process.env.NODE_ENV === 'development') {
      await this.webContents.loadURL(`http://localhost:4444/${this.name}.html`);
    } else {
      const filePath = join(app.getAppPath(), 'build', `${this.name}.html`);
      const fileURL = pathToFileURL(filePath).toString();
      await this.webContents.loadURL(fileURL);
    }
  }

  public get webContents() {
    return this.webContentsView.webContents;
  }

  public get id() {
    return this.webContents.id;
  }

  public rearrange(rect: IRectangle = {}) {
    this.bounds = roundifyRectangle({
      height: rect.height || this.bounds.height || 0,
      width: rect.width || this.bounds.width || 0,
      x: rect.x || this.bounds.x || 0,
      y: rect.y || this.bounds.y || 0,
    });

    if (this.visible) {
      this.webContentsView.setBounds(this.bounds as any);
    }
  }

  public show(browserWindow: BrowserWindow, focus = true, waitForLoad = true) {
    return new Promise((resolve) => {
      this.browserWindow = browserWindow;

      clearTimeout(this.timeout);

      browserWindow.webContents.send(
        'dialog-visibility-change',
        this.name,
        true,
      );

      const callback = () => {
        if (this.visible) {
          if (focus) this.webContents.focus();
          return;
        }

        this.visible = true;

        browserWindow.contentView.addChildView(this.webContentsView);
        this.rearrange();

        if (focus) this.webContents.focus();

        resolve(undefined);
      };

      if (!this.loaded && waitForLoad) {
        this.showCallback = callback;
        return;
      }

      callback();
    });
  }

  public hideVisually() {
    this.send('visible', false);
  }

  public send(channel: string, ...args: any[]) {
    this.webContents.send(channel, ...args);
  }

  public hide(bringToTop = false, hideVisually = true) {
    if (!this.browserWindow) return;

    if (hideVisually) this.hideVisually();

    if (!this.visible) return;

    this.browserWindow.webContents.send(
      'dialog-visibility-change',
      this.name,
      false,
    );

    if (bringToTop) {
      this.bringToTop();
    }

    clearTimeout(this.timeout);

    if (this.hideTimeout) {
      this.timeout = setTimeout(() => {
        this.browserWindow.contentView.removeChildView(this.webContentsView);
      }, this.hideTimeout);
    } else {
      this.browserWindow.contentView.removeChildView(this.webContentsView);
    }

    this.visible = false;
  }

  public bringToTop() {
    this.browserWindow.contentView.removeChildView(this.webContentsView);
    this.browserWindow.contentView.addChildView(this.webContentsView);
  }

  public destroy() {
    if (this.webContentsView) {
      if (this.webContentsView.webContents && !this.webContentsView.webContents.isDestroyed()) {
        this.webContentsView.webContents.close();
      }
      this.webContentsView = null;
    }
  }
}
