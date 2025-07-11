export interface IStartupTab {
  id?: number;
  windowId?: number;
  groupId?: number;
  title?: string;
  url?: string;
  color?: string;
  favicon?: string;
  order?: number;
  pinned?: boolean;
  isUserDefined?: boolean;
}
