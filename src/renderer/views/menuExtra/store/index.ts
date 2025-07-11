import { ipcRenderer } from 'electron';
import { makeObservable } from 'mobx';
import { DialogStore } from '~/models/dialog-store';

export class Store extends DialogStore {
  public data = {};

  public constructor() {
    super();

    makeObservable(this); // no second arg since decorators used in DialogStore

    ipcRenderer.on('data', (e: any, _data: any) => {
      const { url, title, bookmark, favicon, browserWindow } = _data;
      this.data = {
        url,
        title,
        bookmark,
        favicon,
      };
    });
  }

  // Capture page via IPC request to main process
  public async capturePage(): Promise<string> {
    return await ipcRenderer.invoke('capture-page');
  }

  // public async init() {  }

  public async save() {
    ipcRenderer.send('save-settings', {
      settings: JSON.stringify(this.settings),
    });
  }
}

export default new Store();
