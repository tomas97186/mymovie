import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

@Injectable({ providedIn: 'root' })
export class StorageService {
  async setSetting(key: string, value: any) {
    console.log(`Setting ${key} to value ${value}`);
    await Preferences.set({ key, value });
  }

  async getSetting(key: string) {
    console.log(`Getting ${key}`);
    return (await Preferences.get({ key })).value;
  }
}
