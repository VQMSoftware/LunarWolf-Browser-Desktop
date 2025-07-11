import styled, { css } from 'styled-components';

import { robotoRegular } from '~/renderer/mixins';
import { ITheme } from '~/interfaces';
import { DialogStyle } from '~/renderer/mixins/dialogs';

// StyledApp with $visible prop and theme-based coloring
export const StyledApp = styled(DialogStyle)<{ $visible: boolean }>`
  display: ${({ $visible }) => ($visible ? 'block' : 'none')};
  padding: 16px;
  background: ${({ theme }) => theme['dialog.backgroundColor']};

  & .textfield,
  .dropdown {
    width: 255px;
    margin-left: auto;
  }

  ${({ theme }: { theme?: ITheme }) => css`
    color: ${theme?.['dialog.lightForeground'] ? '#fff' : '#000'};
  `}
`;

export const Title = styled.div`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 12px;
  ${robotoRegular()};
`;

export const Subtitle = styled.div`
  font-size: 13px;
  opacity: 0.54;
  margin-top: 8px;
`;

export const Row = styled.div`
  width: 100%;
  height: 48px;
  align-items: center;
  display: flex;
  margin-bottom: 12px;
`;

export const Label = styled.label`
  display: block;
  font-size: 14px;
  margin-bottom: 4px;
`;

export const Buttons = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 16px;
  gap: 8px;

  & .button:not(:last-child) {
    margin-right: 8px;
  }
`;

export const Dropdown = styled.div<{ $dark?: boolean }>`
  padding: 8px;
  background: ${({ $dark }) => ($dark ? '#333' : '#eee')};
  color: ${({ $dark }) => ($dark ? '#fff' : '#000')};
  border-radius: 4px;
  cursor: pointer;
`;
