import { Location } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import packageJson from '../../../../package.json';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonHeader,
  IonIcon,
  IonTitle,
  IonToolbar,
  IonContent,
  IonList,
  IonItem,
  IonToggle,
  IonSelect,
  IonSelectOption,
  IonLabel,
} from '@ionic/angular/standalone';
import { SettingsService } from 'src/app/services/settings.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-settings-page',
  templateUrl: './settings-page.component.html',
  styleUrls: ['./settings-page.component.scss'],
  imports: [
    TranslateModule,
    IonLabel,
    IonToggle,
    IonItem,
    IonList,
    IonContent,
    IonIcon,
    IonTitle,
    IonBackButton,
    IonButtons,
    IonHeader,
    IonToolbar,
    IonButton,
    IonSelect,
    IonSelectOption,
  ],
})
export class SettingsPageComponent {
  location = inject(Location);
  settings = inject(SettingsService);
  private readonly translate = inject(TranslateService);
  languages = this.translate.getLangs();
  public version: string = packageJson.version;
  constructor() {}

  changeLanguage(event: Event) {
    const value = (event.target! as HTMLIonSelectElement).value;
    this.settings.language.value = value;
    console.log(value);
    this.translate.use(this.settings.language.value);
  }
}
