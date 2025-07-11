import * as React from 'react';
import { observer } from 'mobx-react-lite';

import {
  AboutContainer,
  AppHeader,
  AppName,
  AppInfoRow,
  InfoText,
  Contributors,
  LegalNoticeBox,
} from './style';

export const About = observer(() => {
  const [chromeVersion, setChromeVersion] = React.useState('');

  React.useEffect(() => {
    setChromeVersion(process.versions['chrome']);
  }, []);

  return (
    <AboutContainer>
      <AppHeader>
        <AppName>LunarWolf Browser</AppName>
      </AppHeader>

      <AppInfoRow>
        <InfoText>App Version: v0.0.5</InfoText>
        <InfoText>Chromium Version: {chromeVersion}</InfoText>
      </AppInfoRow>

      <Contributors>
        LunarWolf is a privacy-oriented browser with features like built-in ad-blocking.
        Made with ❤️ and a passion for legacy software.
        <p />
        <strong>vqmsoftware</strong> – orginization
        <br />
        <strong>Wexond</strong> – Original project
      </Contributors>

      <LegalNoticeBox>
        This copy of LunarWolf Browser was legally compiled and is based on the Wexond project (prior to its transition to closed-source), as well as components from a forked codebase available at: https://github.com/snaildos/Fifo-Browser.
        All reused code adheres to the licensing terms of Wexond version 5.2.0.
      </LegalNoticeBox>
    </AboutContainer>
  );
});
