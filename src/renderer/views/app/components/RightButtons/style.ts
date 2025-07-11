import styled, { css } from 'styled-components';
import { ITheme } from '~/interfaces';

export const Buttons = styled.div`
  display: flex;
  align-items: center;
  margin-right: 4px;
`;

interface SeparatorProps {
  theme: ITheme;
}

export const Separator = styled.div<SeparatorProps>`
  height: 16px;
  width: 1px;
  margin-left: 4px;
  margin-right: 4px;
  background-color: ${({ theme }) => theme['toolbar.separator.color']};
`;