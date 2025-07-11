import { observable, computed, action, toJS, makeObservable } from 'mobx';
import { ISettings, IFavicon, ITheme, IBookmark } from '~/interfaces';
import { getTheme } from '~/utils/themes';
import { PreloadDatabase } from '~/preloads/models/database';
import * as React from 'react';
import { Textfield } from '~/renderer/components/Textfield';

export class Store {
  public faviconsDb = new PreloadDatabase<IFavicon>('favicons');
  public nameInputRef = React.createRef<Textfield>();
  public urlInputRef = React.createRef<Textfield>();

  @observable public settings: ISettings = { ...(window as any).settings };
  @observable public list: IBookmark[] = [];
  @observable public itemsLoaded = this.getDefaultLoaded();
  @observable public menuLeft = 0;
  @observable public menuTop = 0;
  @observable public menuVisible = false;
  @observable public searched = '';
  @observable public selectedItems: string[] = [];
  @observable public favicons: Map<string, string> = new Map();
  @observable public currentFolder: string = null;
  @observable private _dialogVisible = false;
  @observable public dialogContent: 'edit' | 'new-folder' | 'rename-folder' = 'new-folder';
  @observable public currentBookmark: IBookmark = null;

  constructor() {
    makeObservable(this);

    (window as any).updateSettings = (settings: ISettings) => {
      this.settings = { ...this.settings, ...settings };
    };

    this.waitForInvokeAPI().then(() => {
      this.load();
      this.loadFavicons();
    });

    window.addEventListener('resize', () => {
      const loaded = this.getDefaultLoaded();
      if (loaded > this.itemsLoaded) {
        this.itemsLoaded = loaded;
      }
    });

    window.addEventListener('mousedown', this.handleGlobalMouseDown);
  }

  private handleGlobalMouseDown = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('[data-bookmark-id]')) {
      this.selectedItems = [];
    }
    this.menuVisible = false;
  };

  private waitForInvokeAPI(): Promise<void> {
    const intervalMs = 50;
    return new Promise((resolve) => {
      const check = () => {
        const invokeAPI = (window as any).invokeAPI;
        if (invokeAPI && typeof invokeAPI.invoke === 'function' && typeof invokeAPI.send === 'function') {
          resolve();
        } else {
          setTimeout(check, intervalMs);
        }
      };
      check();
    });
  }

  private safeInvoke(channel: string, ...args: any[]) {
    const invokeAPI = (window as any).invokeAPI;
    if (!invokeAPI || typeof invokeAPI.invoke !== 'function') {
      throw new Error('invokeAPI.invoke is not available yet');
    }
    return invokeAPI.invoke(channel, ...args);
  }

  private safeSend(channel: string, ...args: any[]) {
    const invokeAPI = (window as any).invokeAPI;
    if (!invokeAPI || typeof invokeAPI.send !== 'function') {
      throw new Error('invokeAPI.send is not available yet');
    }
    invokeAPI.send(channel, ...args);
  }

  public showDialog(content: 'edit' | 'new-folder' | 'rename-folder') {
    this.dialogContent = content;
    this.dialogVisible = true;

    if (content === 'edit' || content === 'rename-folder') {
      if (this.nameInputRef.current?.inputRef?.current) {
        this.nameInputRef.current.value = this.currentBookmark?.title || '';
        this.nameInputRef.current.inputRef.current.focus();
        this.nameInputRef.current.inputRef.current.select();
      }

      if (content === 'edit' && this.urlInputRef.current?.inputRef?.current) {
        this.urlInputRef.current.value = this.currentBookmark?.url || '';
      }
    }
  }

  @computed public get visibleItems() {
    return this.list
      .filter((x) =>
        (this.searched !== '' &&
          ((x.url && x.url.toLowerCase().includes(this.searched.toLowerCase())) ||
            (x.title && x.title.toLowerCase().includes(this.searched.toLowerCase())))) ||
        (this.searched === '' && x.parent === this.currentFolder)
      )
      .slice()
      .sort((a, b) => a.order - b.order);
  }

  @computed public get dialogVisible() {
    return this._dialogVisible;
  }

  public set dialogVisible(value: boolean) {
    if (!value) {
      if (this.nameInputRef.current) this.nameInputRef.current.value = '';
      this.selectedItems = [];
    }
    this.menuVisible = false;
    this._dialogVisible = value;
  }

  @computed public get theme(): ITheme {
    return getTheme(this.settings.theme);
  }

  @computed public get path() {
    return this.getFolderPath(this.currentFolder);
  }

  @computed public get folders() {
    return this.list.filter((x) => x.isFolder);
  }

  public resetLoadedItems(): void {
    this.itemsLoaded = this.getDefaultLoaded();
  }

  public getById(id: string) {
    return this.list.find((x) => x._id === id);
  }

  public async load() {
    const items: IBookmark[] = await this.safeInvoke('bookmarks-get');
    this.list = items.map((x) => ({ ...x }));
    this.currentFolder = this.list.find((x) => x.static === 'main')?._id ?? null;
  }

  public async loadFavicons() {
    (await this.faviconsDb.get({})).forEach((favicon) => {
      const { data } = favicon;
      if (this.favicons.get(favicon.url) == null) {
        this.favicons.set(favicon.url, data);
      }
    });
  }

  public removeItems(ids: string[]) {
    for (const id of ids) {
      const item = this.list.find((x) => x._id === id);
      const parent = this.list.find((x) => x._id === item?.parent);
      if (parent) {
        parent.children = parent.children.filter((x) => x !== id);
      }
    }

    this.list = this.list.filter((x) => !ids.includes(x._id));
    this.safeSend('bookmarks-remove', toJS(ids));
  }

  public async addItem(item: IBookmark) {
    const i = await this.safeInvoke('bookmarks-add', item);
    this.list.push({ ...i });

    const parent = this.list.find((x) => x._id === i.parent);
    if (parent) {
      parent.children.push(i._id);
    }

    return i;
  }

  public async updateItem(id: string, change: IBookmark) {
    const index = this.list.indexOf(this.list.find((x) => x._id === id));
    this.list[index] = { ...this.list[index], ...change };
    this.safeSend('bookmarks-update', id, toJS(change));
  }

  @action
  public search(str: string) {
    this.searched = str.toLowerCase();
    this.itemsLoaded = this.getDefaultLoaded();
  }

  public getDefaultLoaded() {
    return Math.floor(window.innerHeight / 48);
  }

  @action
  public deleteSelected() {
    this.removeItems(this.selectedItems);
    this.selectedItems = [];
  }

  private getFolderPath(parent: string): IBookmark[] {
    const parentFolder = this.list.find((x) => x._id === parent);
    let path: IBookmark[] = [];

    if (parentFolder == null) return [];

    if (parentFolder.parent != null) {
      path = path.concat(this.getFolderPath(parentFolder.parent));
    }

    path.push(parentFolder);
    return path;
  }
}

export default new Store();
