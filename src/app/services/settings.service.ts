import { inject, Injectable } from '@angular/core';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private storage = inject(StorageService);

  public openFilmOnClick = new Setting('openFilmOnClick', false, this.storage);
  public language = new Setting('language', 'it', this.storage);

  constructor() {}

  async init() {
    await this.language.init();
    await this.openFilmOnClick.init();
  }
}

class Setting {
  private __value!: any;

  constructor(
    private key: string,
    private defaultValue: any,
    private storage: StorageService
  ) {}

  async init() {
    const value = await this.storage.getSetting(this.key);
    this.__value = value ?? this.defaultValue;
  }

  get value() {
    return this.__value;
  }

  set value(newValue: any) {
    this.__value = newValue;
    this.storage.setSetting(this.key, this.__value);
  }
}
