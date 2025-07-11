import styled, { css } from 'styled-components';
import { ITheme } from '~/interfaces';
import { hexToRgb } from '~/utils';

interface AddressBarContainerProps {
  visible: boolean;
  theme: ITheme;
}

export const StyledAddressBarContainer = styled.div<AddressBarContainerProps>`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  border-radius: 10px;
  will-change: transform, opacity;
  z-index: 999;
  align-items: center;
  padding-left: 72px;
  padding-right: 40px;
  transition: 0.1s transform, 0.1s opacity;
  -webkit-app-region: no-drag;

  ${({ visible, theme }) => {
    const { r, g, b } = hexToRgb(theme['titlebar.backgroundColor']);
    return css`
      display: ${visible ? 'flex' : 'table'};
      opacity: ${visible ? 1 : 0};
      transform: scale(${visible ? 1 : 1.05});
      pointer-events: ${visible ? 'inherit' : 'none'};
      background-color: rgba(${r}, ${g}, ${b}, 0.75);
    `;
  }}
`;
