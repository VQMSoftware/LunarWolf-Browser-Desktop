import styled, { css } from 'styled-components';
import { platform } from 'os';

import { ToolbarButton } from '../ToolbarButton';
import {
  TOOLBAR_BUTTON_WIDTH,
  ADD_TAB_BUTTON_WIDTH,
  ADD_TAB_BUTTON_HEIGHT,
} from '~/constants/design';
import { ITheme } from '~/interfaces';

export const StyledTabbar = styled.div`
  height: 100%;
  width: 100%;
  position: relative;
  overflow: hidden;
  align-items: center;
  margin-right: 32px;
  display: flex;
  margin-left: 4px;
`;

export const TabsContainer = styled.div`
  height: 100%;
  width: calc(100% - ${TOOLBAR_BUTTON_WIDTH}px);
  position: relative;
  overflow: hidden;
  overflow-x: overlay;
  white-space: nowrap;

  &::-webkit-scrollbar {
    height: 0px;
    display: none;
    background-color: transparent;
    opacity: 0;
  }
`;

interface AddTabProps {
  theme: ITheme;
}

export const AddTab = styled(ToolbarButton)<AddTabProps>`
  position: absolute;
  left: 0;
  min-width: ${ADD_TAB_BUTTON_WIDTH}px;
  height: ${ADD_TAB_BUTTON_HEIGHT}px;
  top: ${({ theme }) => (theme.isCompact ? 'auto' : theme.tabMarginTop + 2)}px;
`;