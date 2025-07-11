import { ipcRenderer } from 'electron';
import { toJS } from 'mobx';

interface IAction<T> {
  item?: Partial<T>;
  query?: Partial<T>;
  multi?: boolean;
  value?: Partial<T>;
}

type DBOperation = 'get' | 'get-one' | 'update' | 'insert' | 'remove';

export class Database<T> {
  private readonly scope: string;

  public constructor(scope: string) {
    if (!/^[a-zA-Z0-9-_]+$/.test(scope)) {
      throw new Error(`Invalid database scope: ${scope}`);
    }

    this.scope = scope;
  }

  private async performOperation(
    operation: DBOperation,
    data: IAction<T>,
  ): Promise<any> {
    // Deep copy and sanitize payload
    const payload = {
      scope: this.scope,
      ...toJS(data),
    };

    return await ipcRenderer.invoke(`storage-${operation}`, payload);
  }

  public async insert(item: T): Promise<T> {
    if (!item || typeof item !== 'object') {
      throw new Error('Invalid item for insert');
    }

    return await this.performOperation('insert', { item });
  }

  public async get(query: Partial<T>): Promise<T[]> {
    return await this.performOperation('get', { query });
  }

  public async getOne(query: Partial<T>): Promise<T | null> {
    return await this.performOperation('get-one', { query });
  }

  public async update(query: Partial<T>, newValue: Partial<T>, multi = false): Promise<number> {
    return await this.performOperation('update', {
      query,
      value: newValue,
      multi,
    });
  }

  public async remove(query: Partial<T>, multi = false): Promise<number> {
    return await this.performOperation('remove', { query, multi });
  }
}
