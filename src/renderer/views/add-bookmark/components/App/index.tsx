import * as React from 'react';
import { observer } from 'mobx-react-lite';
import { ThemeProvider, DefaultTheme } from 'styled-components';

import { StyledApp, Title, Row, Label, Buttons, Dropdown } from './style'; // <- USE Dropdown from ./style
import store from '../../store';
import { Input } from '~/renderer/components/Input'; // <- Only Input from Input file
import { Button } from '~/renderer/components/Button';
import { ipcRenderer } from 'electron';
import { getBookmarkTitle } from '~/renderer/views/bookmarks/utils';
import { UIStyle } from '~/renderer/mixins/default-styles';

const onDone = () => {
  store.hide();
};

const updateBookmark = () => {
  if (!store.bookmark) return;
  ipcRenderer.send('bookmarks-update', store.bookmark._id, store.bookmark);
};

const onChange = () => {
  store.bookmark.title = store.titleRef.current.value;
  updateBookmark();
};

const onDropdownClick = (e: React.MouseEvent<HTMLDivElement>) => {
  const { left, top, height } = e.currentTarget.getBoundingClientRect();
  const { Menu, BrowserWindow } = window.require('@electron/remote');

  const menu = Menu.buildFromTemplate(
    store.folders.map((folder) => ({
      label: getBookmarkTitle(folder),
      click: () => {
        store.currentFolder = folder;
        store.bookmark.parent = folder._id;
        updateBookmark();
      },
    }))
  );

  const currentWindow = BrowserWindow.getFocusedWindow();
  const [x, y] = currentWindow.getPosition();

  menu.popup({
    x: Math.round(x + left),
    y: Math.round(y + top + height),
  });
};

const onRemove = () => {
  if (!store.bookmark) return;
  ipcRenderer.send('bookmarks-remove', [store.bookmark._id]);
  store.hide();
};

export const App = observer(() => {
  const theme: DefaultTheme = store.theme;

  return (
    <ThemeProvider theme={theme}>
      <StyledApp $visible={store.visible}>
        <UIStyle />
        <Title>{store.dialogTitle}</Title>
        <Row>
          <Label>Name</Label>
          <Input
            tabIndex={0}
            className="textfield"
            ref={store.titleRef}
            onChange={onChange}
          />
        </Row>
        <Row>
          <Label>Folder</Label>
          <Dropdown
            $dark={store.theme['dialog.lightForeground']}
            tabIndex={1}
            className="dropdown"
            onMouseDown={onDropdownClick}
          >
            {store.currentFolder && getBookmarkTitle(store.currentFolder)}
          </Dropdown>
        </Row>
        <Buttons>
          <Button onClick={onDone}>Done</Button>
          <Button
            onClick={onRemove}
            background={
              store.theme['dialog.lightForeground']
                ? 'rgba(255, 255, 255, 0.08)'
                : 'rgba(0, 0, 0, 0.08)'
            }
            foreground={store.theme['dialog.lightForeground'] ? 'white' : 'black'}
          >
            Remove
          </Button>
        </Buttons>
      </StyledApp>
    </ThemeProvider>
  );
});