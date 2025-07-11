import { ipcMain, shell } from 'electron';
const defaultBrowser = require('x-default-browser');
const os = require('os');

export const runDefaultBrowserService = (app: any) => {
  ipcMain.on('open-settings-default', () => {
    if (os.platform().indexOf('win') !== -1)
      shell.openExternal('ms-settings:defaultapps');
  });

  let isDefault = true;

  ipcMain.handle('is-default-browser', () => {
    return isDefault;
  });

  const _get_default = () => {
    return defaultBrowser((err: any, res: any) => {
      if (!err) {
        if (res.identity.toLowerCase().startsWith(app.name.toLowerCase())) {
          isDefault = true;
          return true;
        }

        isDefault = false;
        return false;
      }

      isDefault = false;
      return false;
    });
  };

  _get_default();
};
