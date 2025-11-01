import { inject, Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { AppSettingsModel } from '../models/app-settings.model';
import { doc, Firestore, getDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class AppSettingsService {
  private readonly firestore = inject(Firestore);
  private __settings?: AppSettingsModel;

  constructor() {
    getDoc(doc(this.firestore, 'appSettings/config')).then(docSnap => {
      if (docSnap.exists()) {
        this.__settings = docSnap.data() as AppSettingsModel;
      } else {
        throw new Error('No app settings found!');
      }
    });
  }

  public get settings() {
    return this.__settings;
  }
}
