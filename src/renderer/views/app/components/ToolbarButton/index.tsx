import { observer } from 'mobx-react-lite';
import * as React from 'react';

import { transparency } from '~/renderer/constants/transparency';
import { Button, Icon, Badge, PreloaderBg } from './style';
import { BLUE_500 } from '~/renderer/constants';
import { Preloader } from '~/renderer/components/Preloader';

interface Props {
  onClick?: (e?: React.MouseEvent<HTMLDivElement>) => void;
  onMouseDown?: (e?: React.MouseEvent<HTMLDivElement>) => void;
  onMouseUp?: (e?: React.MouseEvent<HTMLDivElement>) => void;
  onContextMenu?: (e?: React.MouseEvent<HTMLDivElement>) => void;
  size?: number;
  style?: React.CSSProperties;
  icon: string;
  divRef?: React.Ref<HTMLDivElement>;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
  opacity?: number;
  autoInvert?: boolean;
  badgeBackground?: string;
  badge?: boolean;
  badgeTextColor?: string;
  badgeText?: string;
  badgeTop?: number;
  badgeRight?: number;
  preloader?: boolean;
  value?: number;
  toggled?: boolean;
  dense?: boolean;
  iconStyle?: React.CSSProperties;
  id?: string;
  title?: string;
}

export const ToolbarButton = observer(
  ({
    icon,
    onClick,
    onMouseDown,
    size = 20,
    disabled = false,
    className,
    divRef,
    children,
    opacity = transparency.icons.active,
    autoInvert = true,
    style,
    badgeText,
    badgeBackground = BLUE_500,
    badge = false,
    badgeTextColor = 'white',
    badgeTop = 4,
    badgeRight = 4,
    value = 0,
    preloader = false,
    onContextMenu,
    onMouseUp,
    toggled = false,
    dense = false,
    iconStyle,
    id,
    title,
  }: Props) => {
    const buttonStyle = { ...style };

    return (
      <Button
        id={id}
        onClick={onClick}
        onContextMenu={onContextMenu}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        className={className}
        style={buttonStyle}
        toggled={toggled}
        dense={dense}
        ref={divRef}
        disabled={disabled}
        title={title}
      >
        <Icon
          style={{ backgroundImage: `url(${icon})`, ...iconStyle }}
          size={size}
          dense={dense}
          disabled={disabled}
          opacity={opacity}
          autoInvert={autoInvert}
        />
        {badge && (
          <Badge
            right={badgeRight}
            top={badgeTop}
            background={badgeBackground}
            color={badgeTextColor}
          >
            {badgeText}
          </Badge>
        )}
        {preloader && value > 0 && (
          <>
            <PreloaderBg />
            <Preloader
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
              }}
              thickness={3}
              size={36}
              value={value}
            />
          </>
        )}
        {children}
      </Button>
    );
  }
);

(ToolbarButton as any).defaultProps = {
  size: 20,
  opacity: transparency.icons.active,
  autoInvert: true,
  badgeBackground: BLUE_500,
  badgeTextColor: 'white',
  badgeTop: 4,
  badgeRight: 4,
};