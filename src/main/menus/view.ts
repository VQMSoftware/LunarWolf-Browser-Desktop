import { AppWindow } from '../windows';
import { clipboard, Menu } from 'electron';
import { isURL, prefixHttp } from '~/utils';
import { saveAs, viewSource, printPage } from './common-actions';

export const getViewMenu = (
  appWindow: AppWindow,
  params: Electron.ContextMenuParams,
  webContents: Electron.WebContents,
) => {
  let menuItems: Electron.MenuItemConstructorOptions[] = [];

  if (params.linkURL !== '') {
    menuItems = menuItems.concat([
      {
        label: 'Open link in new tab',
        click: () => {
          appWindow.viewManager.create(
            {
              url: params.linkURL,
              active: true,
            },
            true,
          );
        },
      },
      {
        label: 'Open link in new tab',
        click: () => {
          appWindow.viewManager.create(
            {
              url: params.linkURL,
              active: false,
            },
            true,
          );
        },
      },
      {
        type: 'separator',
      },
      {
        label: 'Copy link address',
        click: () => {
          clipboard.clear();
          clipboard.writeText(params.linkURL);
        },
      },
      {
        type: 'separator',
      },
    ]);
  }

  if (params.mediaFlags.canShowPictureInPicture) {
    menuItems = menuItems.concat([
      {
        type: 'checkbox',
        label: 'Picture in Picture',
        checked: params.mediaFlags.isShowingPictureInPicture,
        click: () => {
          webContents.executeJavaScript(
            params.mediaFlags.isShowingPictureInPicture
              ? `document.exitPictureInPicture()`
              : `document.elementFromPoint(${params.x}, ${params.y}).requestPictureInPicture()`,
          );
        },
      },
      {
        type: 'separator',
      },
    ]);
  }

  if (params.hasImageContents) {
    menuItems = menuItems.concat([
      {
        label: 'Open image in new tab',
        click: () => {
          appWindow.viewManager.create(
            {
              url: params.srcURL,
              active: true,
            },
            true,
          );
        },
      },
      {
        label: 'Copy image',
        click: () => webContents.copyImageAt(params.x, params.y),
      },
      {
        label: 'Copy image address',
        click: () => {
          clipboard.clear();
          clipboard.writeText(params.srcURL);
        },
      },
      {
        label: 'Save image as...',
        click: () => {
          appWindow.webContents.downloadURL(params.srcURL);
        },
      },
      {
        type: 'separator',
      },
    ]);
  }

  if (params.mediaFlags.canShowPictureInPicture) {
    menuItems = menuItems.concat([
      {
        type: 'checkbox',
        label: 'Picture in Picture',
        checked: params.mediaFlags.isShowingPictureInPicture,
        click: () => {
          webContents.executeJavaScript(
            params.mediaFlags.isShowingPictureInPicture
              ? `document.exitPictureInPicture()`
              : `document.elementFromPoint(${params.x}, ${params.y}).requestPictureInPicture()`,
          );
        },
      },
      {
        type: 'separator',
      },
    ]);
  }

  if (params.isEditable) {
    menuItems = menuItems.concat([
      {
        role: 'undo',
        accelerator: 'CmdOrCtrl+Z',
      },
      {
        role: 'redo',
        accelerator: 'CmdOrCtrl+Shift+Z',
      },
      {
        type: 'separator',
      },
      {
        role: 'cut',
        accelerator: 'CmdOrCtrl+X',
      },
      {
        role: 'copy',
        accelerator: 'CmdOrCtrl+C',
      },
      {
        role: 'pasteAndMatchStyle',
        accelerator: 'CmdOrCtrl+V',
        label: 'Paste',
      },
      {
        role: 'paste',
        accelerator: 'CmdOrCtrl+Shift+V',
        label: 'Paste as plain text',
      },
      {
        role: 'selectAll',
        accelerator: 'CmdOrCtrl+A',
      },
      {
        type: 'separator',
      },
    ]);
  }

  if (!params.isEditable && params.selectionText !== '') {
    menuItems = menuItems.concat([
      {
        role: 'copy',
        accelerator: 'CmdOrCtrl+C',
      },
      {
        type: 'separator',
      },
    ]);
  }

  if (params.selectionText !== '') {
    const trimmedText = params.selectionText.trim();

    if (isURL(trimmedText)) {
      menuItems = menuItems.concat([
        {
          label: 'Go to ' + trimmedText,
          click: () => {
            appWindow.viewManager.create(
              {
                url: prefixHttp(trimmedText),
                active: true,
              },
              true,
            );
          },
        },
        {
          type: 'separator',
        },
      ]);
    }
  }

  if (
    !params.hasImageContents &&
    params.linkURL === '' &&
    params.selectionText === '' &&
    !params.isEditable
  ) {
    menuItems = menuItems.concat([
      {
        label: 'Go back',
        accelerator: 'Alt+Left',
        enabled: webContents.navigationHistory.canGoBack(),
        click: () => {
          webContents.navigationHistory.goBack();
        },
      },
      {
        label: 'Go forward',
        accelerator: 'Alt+Right',
        enabled: webContents.navigationHistory.canGoForward(),
        click: () => {
          webContents.navigationHistory.goForward();
        },
      },
      {
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click: () => {
          webContents.reload();
        },
      },
      {
        label: 'Zoom',
        submenu: [
          { role: 'resetZoom', label: 'Reset' },
          {
            label: 'Zoom In',
            accelerator: 'CmdOrCtrl+=',
            role: 'zoomIn',
          },
          {
            label: 'Zoom Out',
            accelerator: 'CmdOrCtrl+-',
            role: 'zoomOut',
          },
        ],
      },
      {
        type: 'separator',
      },
      {
        label: 'Save as...',
        accelerator: 'CmdOrCtrl+S',
        click: async () => {
          await saveAs();
        },
      },
      {
        label: 'Print',
        accelerator: 'CmdOrCtrl+P',
        click: async () => {
          printPage();
        },
      },
      {
        type: 'separator',
      },
      {
        label: 'View page source',
        accelerator: 'CmdOrCtrl+U',
        click: async () => {
          await viewSource();
        },
      },
    ]);
  }

  menuItems.push({
    label: 'Inspect Element',
    accelerator: 'CmdOrCtrl+Shift+I',
    click: () => {
      webContents.inspectElement(params.x, params.y);

      if (webContents.isDevToolsOpened()) {
        webContents.devToolsWebContents.focus();
      }
    },
  });

  return Menu.buildFromTemplate(menuItems);
};
