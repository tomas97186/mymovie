import { inject, Injectable } from '@angular/core';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private storage = inject(StorageService);

  public openFilmOnClick = new Setting<boolean>('openFilmOnClick', false, this.storage, (v) => v === 'true');
  public language = new Setting('language', 'it', this.storage);

  constructor() { }

  async init() {
    await this.language.init();
    await this.openFilmOnClick.init();
  }
}

class Setting<T> {
  private __value!: T;

  constructor(
    private key: string,
    private defaultValue: T,
    private storage: StorageService,
    private transform?: (value: string) => T,
  ) { }

  async init() {
    const value = await this.storage.getSetting(this.key) as T;
    this.__value = value ?? this.defaultValue;
  }

  get value(): T {
    return this.transform? this.transform(this.__value as string) : this.__value;
  }

  set value(newValue: any) {
    this.__value = newValue;
    this.storage.setSetting(this.key, this.__value);
  }
}
