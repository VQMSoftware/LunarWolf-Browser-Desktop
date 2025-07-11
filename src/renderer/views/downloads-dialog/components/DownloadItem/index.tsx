import * as React from 'react';
import { observer } from 'mobx-react-lite';
import {
  StyledDownloadItem,
  Title,
  Progress,
  ProgressBackground,
  Info,
  Icon,
  MoreButton,
  Separator,
  SecondaryText,
} from './style';
import { IDownloadItem } from '~/interfaces';
import prettyBytes from 'pretty-bytes';
import { shell } from 'electron';

const onClick = (item: IDownloadItem) => () => {
  if (item.completed) {
    shell.openPath(item.savePath);
  }
};

const onMoreClick = (item: IDownloadItem) => (
  e: React.MouseEvent<HTMLDivElement>,
) => {
  e.stopPropagation();
};

export const DownloadItem = observer(({ item }: { item: IDownloadItem }) => {
  let received = prettyBytes(item.receivedBytes);
  const total = prettyBytes(item.totalBytes);

  const receivedSplit = received.split(' ');

  if (receivedSplit[1] === total.split(' ')[1]) {
    received = receivedSplit[0];
  }

  return (
    <StyledDownloadItem onClick={onClick(item)}>
      <Icon />
      <Info>
        <Title>{item.fileName}</Title>
        {!item.completed && (
          <>
            <ProgressBackground>
              <Progress
                style={{
                  width: `calc((${item.receivedBytes} / ${item.totalBytes}) * 100%)`,
                }}
              />
            </ProgressBackground>
            <SecondaryText>{`${received}/${total}`}</SecondaryText>
          </>
        )}
      </Info>
      <Separator />
      <MoreButton onClick={onMoreClick(item)} />
    </StyledDownloadItem>
  );
});
