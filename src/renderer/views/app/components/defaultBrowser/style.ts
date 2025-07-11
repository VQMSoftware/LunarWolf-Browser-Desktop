import styled, { css } from 'styled-components';
import { Button } from '../ToolbarButton/style';
import { ITheme } from '~/interfaces';
import {
  robotoRegular,
  centerVertical,
  robotoMedium,
  centerIcon,
  coloredCursor,
} from '~/renderer/mixins';
import {
  transparency,
  EASING_FUNCTION,
  BLUE_500,
  LIGHT_BLUE_500,
} from '~/renderer/constants';

interface StyledDefaultBrowserProps {
  theme: ITheme;
}

export const StyledDefaultBrowser = styled.div<StyledDefaultBrowserProps>`
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  flex-flow: row;
  width: 100%;
  min-height: 50px;
  padding: 2px 8px 0;
  padding-top: 0px;
  padding-right: 4px;
  margin-top: ${({ theme }) => (theme.isCompact ? 0 : -1)}px;
  background-color: ${({ theme }) =>
    theme.isCompact
      ? theme['titlebar.backgroundColor']
      : theme['toolbar.backgroundColor']};
  border-bottom: 1px solid
    ${({ theme }) =>
      theme.isCompact
        ? 'transparent'
        : theme['toolbar.bottomLine.backgroundColor']};
  color: ${({ theme }) => theme['addressbar.textColor']};
`;

interface LineProps {
  theme: ITheme;
}

export const Line = styled.div<LineProps>`
  height: 1px;
  width: 100%;
  background-color: ${({ theme }) => theme['dialog.separator.color']};
`;

export const StyledDefaultBrowserSection = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-flow: row;
  overflow: hidden;
  height: 100%;
  justify-content: space-between;
  width: 100%;
  font-size: 14px;
`;

export const HiddenDiv = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background: transparent;
`;

interface ButtonPredeterminadoProps {
  theme: ITheme;
}

export const ButtonPredeterminado = styled.div<ButtonPredeterminadoProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 15px;
  border-radius: 5px;
  cursor: pointer;
  transition: 0.2s;
  margin-left: 25px;
  font-size: 12px;
  font-weight: 500;
  width: auto;
  min-width: 200px;
  background: ${({ theme }) =>
    theme['addressbar.textColor'] == '#fff' ? '#8ab4f8' : '#267ae9'};
  color: ${({ theme }) =>
    theme['addressbar.textColor'] == '#fff' ? 'black' : 'white'};

  &:hover {
    background: ${({ theme }) =>
      theme['addressbar.textColor'] == '#fff' ? '#8fb7f8' : '#267adf'};
  }
`;

interface CloseProps {
  icon: string;
  theme: ITheme;
}

export const Close = styled.div<CloseProps>`
  width: 18px;
  height: 18px;
  opacity: ${transparency.icons.inactive};
  margin-left: 16px;
  cursor: pointer;
  padding: 10px;
  margin-right: 1.5%;
  ${centerIcon('contain')};
  background-image: url(${({ icon }) => icon});
  filter: ${({ theme }) =>
    theme['pages.lightForeground'] ? 'invert(100%)' : 'none'};

  &:hover {
    background-color: rgba(0, 0, 0, 0.12);
  }
`;