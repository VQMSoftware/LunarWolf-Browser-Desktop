import * as React from 'react';

import { Header, Row, Title, Control } from '../App/style';
import store from '../../store';
import { BLUE_500, RED_500 } from '~/renderer/constants';
import { observer } from 'mobx-react-lite';
import { alertSwitchChange } from '../../utils';
import { Switch } from '~/renderer/components/Switch';

const HWAToggle = observer(() => {
  const { hardwareacceleration } = store.settings;

  return (
    <Row onClick={alertSwitchChange('hardwareacceleration')}>
      <Title>Enable hardware acceleration</Title>
      <Control>
        <Switch value={hardwareacceleration} />
      </Control>
    </Row>
  );
});

export const Performance = () => {
  return (
    <>
      <Header>Performance Settings</Header>
      <span>
        implamentations to improve your usage 
      </span>
      <br></br>
      <HWAToggle />
    </>
  );
};
