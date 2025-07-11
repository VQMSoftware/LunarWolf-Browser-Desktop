import * as React from 'react';
import { observer } from 'mobx-react-lite';

import { SettingsSection } from '../../store';
import { Appearance } from '../Appearance';
import { AddressBar } from '../AddressBar';
import { Privacy } from '../Privacy';
import { About } from '../About';
import { Performance } from '../Performance';
import { Other } from '../Other';
import store from '../../store';
import { NavigationDrawer } from '~/renderer/components/NavigationDrawer';
import { Button } from '~/renderer/components/Button';
import { ThemeProvider } from 'styled-components';
import { Autofill } from '../Autofill';
import { OnStartup } from '../Startup';
import { Content, LeftContent, Container } from '~/renderer/components/Pages';
import { GlobalNavigationDrawer } from '~/renderer/components/GlobalNavigationDrawer';
import { Downloads } from '../Downloads';
import {
  ICON_PALETTE,
  ICON_AUTOFILL,
  ICON_POWER,
  ICON_SEARCH,
  ICON_DOWNLOAD,
  ICON_SHIELD,
  ICON_FIRE,
  ICON_TRASH,
  ICON_EDIT,
  ICON_ADD,
  ICON_DASHBOARD,
  ICON_TUNE,
} from '~/renderer/constants';
import {
  ContextMenuItem,
  ContextMenu,
} from '~/renderer/components/ContextMenu';
import {
  Dialog,
  DialogTitle,
  DialogButtons,
} from '~/renderer/views/bookmarks/components/App/style';
import { Textfield } from '~/renderer/components/Textfield';
import { WebUIStyle } from '~/renderer/mixins/default-styles';

export const NormalButton = ({
  children,
  onClick,
}: {
  children?: any;
  onClick?: any;
}) => {
  return (
    <Button
      background={
        store.theme['dialog.lightForeground']
          ? 'rgba(255, 255, 255, 0.08)'
          : 'rgba(0, 0, 0, 0.08)'
      }
      onClick={onClick}
      foreground={store.theme['dialog.lightForeground'] ? 'white' : 'black'}
    >
      {children}
    </Button>
  );
};

type ExtendedSettingsSection = SettingsSection | 'performance' | 'about' | 'other' | 'search-engines';

const isExtendedSettingsSection = (section: any): section is ExtendedSettingsSection => {
  return [
    'appearance',
    'autofill',
    'address-bar',
    'startup',
    'downloads',
    'privacy',
    'performance',
    'about',
    'other',
    'search-engines'
  ].includes(section);
};

const MenuItem = observer(
  ({
    section,
    subSections,
    children,
    icon,
  }: {
    section: ExtendedSettingsSection;
    subSections?: ExtendedSettingsSection[];
    children: any;
    icon?: string;
  }) => {
    const currentSection = isExtendedSettingsSection(store.selectedSection)
      ? store.selectedSection
      : undefined;

    return (
      <NavigationDrawer.Item
        onClick={() => (store.selectedSection = section as SettingsSection)}
        selected={
          currentSection === section ||
          (subSections && currentSection && subSections.includes(currentSection))
        }
        icon={icon}
      >
        {children}
      </NavigationDrawer.Item>
    );
  }
);

const onBlur = () => {
  store.menuVisible = false;
};

const onMakeDefaultClick = () => {
  store.settings.searchEngine = store.settings.searchEngines.findIndex(
    (x) => x.keyword === store.editedSearchEngine.keyword,
  );
  store.menuVisible = false;
};

const onRemoveClick = () => {
  store.settings.searchEngines = store.settings.searchEngines.filter(
    (x) => x.keyword !== store.editedSearchEngine.keyword,
  );
  store.save();
  store.menuVisible = false;
};

const onEditClick = () => {
  store.menuVisible = false;
  store.dialogVisible = true;
  store.dialogContent = 'edit-search-engine';
  store.searchEngineInputRef.current.value = store.editedSearchEngine.name;
  store.searchEngineKeywordInputRef.current.value =
    store.editedSearchEngine.keyword;
  store.searchEngineUrlInputRef.current.value = store.editedSearchEngine.url;
};

const onSaveClick = () => {
  const name = store.searchEngineInputRef.current.value.trim();
  const keyword = store.searchEngineKeywordInputRef.current.value.trim();
  const url = store.searchEngineUrlInputRef.current.value.trim();

  const item = store.settings.searchEngines.find((x) => x.keyword === keyword);

  if (keyword !== '' && name !== '' && url !== '') {
    if (store.dialogContent === 'edit-search-engine') {
      item.name = name;
      item.keyword = keyword;
      item.url = url;
      store.dialogVisible = false;
    } else if (store.dialogContent === 'add-search-engine') {
      if (!item) {
        store.settings.searchEngines.push({
          name,
          keyword,
          url,
        });
        store.dialogVisible = false;
      }
    }
    store.save();
  }
};

export default observer(() => {
  const selectedSection = isExtendedSettingsSection(store.selectedSection)
    ? store.selectedSection
    : undefined;

  let dialogTitle = '';

  if (store.dialogContent === 'edit-search-engine') {
    dialogTitle = 'Edit search engine';
  } else if (store.dialogContent === 'add-search-engine') {
    dialogTitle = 'Add search engine';
  }

  return (
    <ThemeProvider
      theme={{ ...store.theme, dark: store.theme['pages.lightForeground'] }}
    >
      <Container
        onMouseDown={(e) => (store.dialogVisible = false)}
        style={{ opacity: store.dialogVisible ? 0.7 : 1 }}
      >
        <WebUIStyle />
        <GlobalNavigationDrawer />
        <ContextMenu
          tabIndex={1}
          ref={store.menuRef}
          onBlur={onBlur}
          style={{
            top: store.menuInfo.top,
            left: store.menuInfo.left,
            display: store.menuVisible ? 'block' : 'none',
          }}
        >
          {store.editedSearchEngine &&
            store.editedSearchEngine.keyword !== store.searchEngine.keyword && (
              <>
                <ContextMenuItem onClick={onMakeDefaultClick}>
                  <span data-icon=" ">Make default</span>
                </ContextMenuItem>
                <ContextMenuItem onClick={onRemoveClick}>
                  <span data-icon={ICON_TRASH}>Remove</span>
                </ContextMenuItem>
              </>
            )}
          {store.editedSearchEngine && (
            <ContextMenuItem onClick={onEditClick}>
              <span data-icon={ICON_EDIT}>Edit</span>
            </ContextMenuItem>
          )}
        </ContextMenu>
        <Dialog
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            width: 350,
            display: store.dialogVisible ? 'block' : 'none',
          }}
          ref={store.dialogRef}
        >
          <DialogTitle>{dialogTitle}</DialogTitle>
          <Textfield
            style={{ width: '100%' }}
            dark={store.theme['dialog.lightForeground']}
            ref={store.searchEngineInputRef}
            label="Search engine"
          />
          <Textfield
            style={{
              width: '100%',
              marginTop: 16,
            }}
            dark={store.theme['dialog.lightForeground']}
            ref={store.searchEngineKeywordInputRef}
            label="Keyword"
          />
          <Textfield
            style={{
              width: '100%',
              marginTop: 16,
            }}
            dark={store.theme['dialog.lightForeground']}
            ref={store.searchEngineUrlInputRef}
            label="URL with %s in place of query"
          />
          <DialogButtons>
            <NormalButton onClick={() => (store.dialogVisible = false)}>
              Cancel
            </NormalButton>
            <Button onClick={onSaveClick} style={{ marginLeft: 8 }}>
              Save
            </Button>
          </DialogButtons>
          <div style={{ clear: 'both' }} />
        </Dialog>
        <NavigationDrawer title="Settings" search>
          <MenuItem icon={ICON_PALETTE} section="appearance">
            Appearance
          </MenuItem>
          {process.env.ENABLE_AUTOFILL && (
            <MenuItem icon={ICON_AUTOFILL} section="autofill">
              Autofill
            </MenuItem>
          )}
          <MenuItem icon={ICON_POWER} section="startup">
            On startup
          </MenuItem>
          <MenuItem
            icon={ICON_SEARCH}
            section="address-bar"
            subSections={['search-engines']}
          >
            Address bar
          </MenuItem>
          <MenuItem icon={ICON_DOWNLOAD} section="downloads">
            Downloads
          </MenuItem>
          <MenuItem icon={ICON_TUNE} section="performance">
            Performance
          </MenuItem>
          <MenuItem icon={ICON_SHIELD} section="privacy">
            Privacy
          </MenuItem>
          <MenuItem icon={ICON_FIRE} section="about">
            About
          </MenuItem>
        </NavigationDrawer>
        <Content>
          <LeftContent style={{ maxWidth: 800, marginTop: 56 }}>
            {selectedSection === 'appearance' && <Appearance />}
            {selectedSection === 'autofill' && process.env.ENABLE_AUTOFILL && <Autofill />}
            {selectedSection === 'address-bar' && <AddressBar />}
            {selectedSection === 'startup' && <OnStartup />}
            {selectedSection === 'search-engines' && <div>Search Engines</div>}
            {selectedSection === 'downloads' && <Downloads />}
            {(selectedSection as ExtendedSettingsSection) === 'performance' && <Performance />}
            {selectedSection === 'privacy' && <Privacy />}
            {(selectedSection as ExtendedSettingsSection) === 'about' && <About />}
            {(selectedSection as ExtendedSettingsSection) === 'other' && <Other />}
          </LeftContent>
        </Content>
      </Container>
    </ThemeProvider>
  );
});