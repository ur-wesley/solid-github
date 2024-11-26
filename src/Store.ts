import { load, Store } from '@tauri-apps/plugin-store';

export default class AppStore {
  public static instance: AppStore;
  private store!: Store;

  private async init() {
    this.store = await load("app.json");
  }

  private constructor() {
    AppStore.instance = this;
    this.init();
  }

  public static getInstance() {
    if (!AppStore.instance) {
      return new AppStore();
    }
    return AppStore.instance;
  }

  public async get<T>(key: string) {
    if (!this.store) return;
    return await this.store.get<T>(key);
  }

  public async set<T>(key: string, value: T extends any ? T : any) {
    if (!this.store) return;
    return await this.store.set(key, value);
  }

  public async delete(key: string) {
    if (!this.store) return;
    return await this.store.delete(key);
  }

  public async clear() {
    if (!this.store) return;
    return await this.store.clear();
  }

  public async length() {
    if (!this.store) return;
    return await this.store.length();
  }

  public async keys() {
    if (!this.store) return;
    return await this.store.keys();
  }

  public async values() {
    if (!this.store) return;
    return await this.store.values();
  }

  public async entries() {
    if (!this.store) return;
    return await this.store.entries();
  }

  public async listen(key: string, callback: (value: any) => void) {
    if (!this.store) return;
    return await this.store.onKeyChange(key, callback);
  }
}