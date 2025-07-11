import styled, { css } from 'styled-components';
import { ITheme } from '~/interfaces';
import { BLUE_300 } from '~/renderer/constants';

interface StyledAddressBarProps {
  focus: boolean;
  color: string;
  theme: ITheme;
}

export const StyledAddressBar = styled.div<StyledAddressBarProps>`
  height: 30px;
  flex: 1;
  border-radius: 10px;
  margin: 0 7px;
  display: flex;
  align-items: center;
  position: relative;
  transition: background-color 0.4s, color 0.4s;
  transition-timing-function: ease-out;
  font-size: 15px;
  overflow: hidden;

  ${({ theme, focus }) => css`
    background-color: ${theme['addressbar.backgroundColor']};
    border: 1px solid
      ${theme.isCompact
        ? theme['toolbar.lightForeground']
          ? 'rgba(255, 255, 255, 0.12)'
          : 'transparent'
        : focus
        ? `${BLUE_300} !important`
        : 'transparent'};
    color: ${theme['addressbar.textColor']};
    box-shadow: ${focus && !theme.isCompact
      ? `0 0 0 1px ${BLUE_300}`
      : `0px 0px 5px 0px rgba(0,0,0,0.1)`};

    ${!theme.isCompact &&
    css`
      &:hover {
        border: ${theme['toolbar.lightForeground']
          ? '1px solid rgba(255, 255, 255, 0.12)'
          : '1px solid rgba(0, 0, 0, 0.12)'};
      }
    `}
  `};
  transition: background-color 0.25s, color 0.25s;
`;

export const InputContainer = styled.div`
  flex: 1;
  position: relative;
  height: 100%;
  margin-left: 2px;
  overflow: hidden;
`;

interface VisibleProps {
  visible: boolean;
  theme: ITheme;
}

export const Text = styled.div<VisibleProps>`
  pointer-events: none;
  position: absolute;
  top: 50%;
  transform: translateY(calc(-50%));
  flex: 1;
  color: inherit;
  margin-top: -1px;
  flex-wrap: nowrap;
  white-space: nowrap;
  overflow: hidden;
  font-size: 14px;

  ${({ visible }) => css`
    display: ${visible ? 'flex' : 'none'};
  `};
`;

export const Input = styled.input<VisibleProps>`
  outline: none;
  min-width: 0;
  width: 100%;
  height: 100%;
  background-color: transparent;
  border: none;
  padding: 0;
  margin: 0;
  color: black;
  font-family: inherit;
  word-spacing: inherit;
  font-size: 14px;

  ${({ visible, theme }) => css`
    color: ${visible ? 'inherit' : 'transparent'};

    &::placeholder {
      color: ${theme['searchBox.lightForeground']
        ? 'rgba(255, 255, 255, 0.54)'
        : 'rgba(0, 0, 0, 0.54)'};
    }

    ${theme['searchBox.lightForeground'] &&
    css`
      ::selection {
        background: rgba(145, 185, 230, 0.99);
        color: black;
        height: 100px;
      }
    `}
  `};
`;
