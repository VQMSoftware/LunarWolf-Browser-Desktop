import { observer } from 'mobx-react-lite';
import * as React from 'react';
import { ipcRenderer } from 'electron';

import { ToolbarButton } from '../ToolbarButton';
import { BrowserAction } from '../BrowserAction';
import {
  ICON_SHIELD,
  ICON_DOWNLOAD,
  ICON_INCOGNITO,
  ICON_MORE,
} from '~/renderer/constants/icons';
import { Buttons, Separator } from './style';
import store from '../../store';
import { SiteButtons } from '../SiteButtons';

let menuRef: HTMLDivElement = null;

const onDownloadsClick = async (e: React.MouseEvent<HTMLDivElement>) => {
  const { right, bottom } = e.currentTarget.getBoundingClientRect();
  store.downloadNotification = false;
  ipcRenderer.send(`show-downloads-dialog-${store.windowId}`, right, bottom);
};

const showMenuDialog = async () => {
  const { right, bottom } = menuRef.getBoundingClientRect();
  ipcRenderer.send(`show-menu-dialog-${store.windowId}`, right, bottom);
};

ipcRenderer.on('show-menu-dialog', () => {
  showMenuDialog();
});

const onMenuClick = async () => {
  showMenuDialog();
};

const BrowserActions = observer(() => {
  const { selectedTabId } = store.tabs;

  return (
    <>
      {selectedTabId &&
        store.extensions.browserActions.map((item) => {
          if (item.tabId === selectedTabId) {
            return <BrowserAction data={item} key={item.extensionId} />;
          }
          return null;
        })}
    </>
  );
});

export const RightButtons = observer(() => {
  return (
    <Buttons>
      <BrowserActions />
      {store.extensions.browserActions.length > 0 && <Separator />}
      {store.isCompact && (
        <>
          <SiteButtons />
          <Separator />
        </>
      )}

      {store.downloadsButtonVisible && (
        <ToolbarButton
          size={18}
          badge={store.downloadNotification}
          onMouseDown={onDownloadsClick}
          toggled={store.dialogsVisibility['downloads-dialog']}
          icon={ICON_DOWNLOAD}
          badgeTop={9}
          badgeRight={9}
          preloader
          value={store.downloadProgress}
        ></ToolbarButton>
      )}
      {store.isIncognito && <ToolbarButton icon={ICON_INCOGNITO} size={18} />}
      <ToolbarButton
        divRef={(r) => (menuRef = r)}
        toggled={store.dialogsVisibility['menu']}
        badge={store.updateAvailable}
        badgeRight={10}
        badgeTop={6}
        onMouseDown={onMenuClick}
        icon={ICON_MORE}
        size={18}
      />
    </Buttons>
  );
});
