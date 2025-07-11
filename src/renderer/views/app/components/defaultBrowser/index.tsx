import * as React from 'react';
import { observer } from 'mobx-react-lite';
import {
  StyledDefaultBrowser,
  StyledDefaultBrowserSection,
  Line,
  ButtonPredeterminado,
  Close,
  HiddenDiv,
} from './style';
import * as os from 'os';
import { ipcRenderer } from 'electron';
import { ICON_CLOSE } from '~/renderer/constants/icons';
import store from '../../store';

function getOS() {
  if (window.navigator.appVersion.indexOf('Win') !== -1) {
    return true;
  } else if (window.navigator.appVersion.indexOf('Linux') !== -1) {
    return true;
  }
  return false;
}

const isDefaultOrShowBanner = (isDefault: any) => {
  if (localStorage.getItem('hide-banner') == '1') return false;
  if (!getOS()) return false;
  return !isDefault;
};

const onButtonClick = () => {
  onCloseClick();
  ipcRenderer.send('open-settings-default');
};

const onCloseClick = () => {
  localStorage.setItem('hide-banner', '1');
  document.getElementById('default').style.display = 'none';
  document.getElementById('Line').style.display = 'none';
};

const getAppIcon = async () => {
  try {
    // Get the native image (icon) of the app
    const nativeImage = await ipcRenderer.invoke('get-app-icon');
    return nativeImage.toDataURL();
  } catch (error) {
    console.error('Failed to get app icon:', error);
    // Fallback to a default icon if available
    return 'icons/icon.png';
  }
};

export const DefaultBrowser = observer(() => {
  const [iconUrl, setIconUrl] = React.useState('');

  React.useEffect(() => {
    const loadIcon = async () => {
      const url = await getAppIcon();
      setIconUrl(url);
    };
    loadIcon();
  }, []);

  return isDefaultOrShowBanner(store.isDefaultBrowser) ? (
    <>
      <Line id="Line" />
      <StyledDefaultBrowser id="default">
        <StyledDefaultBrowserSection>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              overflow: 'hidden',
            }}
          >
            {iconUrl && (
              <div
                style={{
                  background: `url(${iconUrl})`,
                  width: '21px',
                  height: '21px',
                  backgroundSize: 'cover',
                  margin: '0 20px 0 15px',
                  minWidth: '21px',
                }}
              ></div>
            )}
            <HiddenDiv>
              LunarWolf is not your default browser, for maximum security and
              privacy, we recommend you to use the LunarWolf Web Browser!
            </HiddenDiv>
            <ButtonPredeterminado onClick={onButtonClick}>
              Set as default!
            </ButtonPredeterminado>
          </div>
          <Close
            icon={ICON_CLOSE}
            title="Don't ask again."
            onClick={onCloseClick}
          />
        </StyledDefaultBrowserSection>
      </StyledDefaultBrowser>
    </>
  ) : null;
});