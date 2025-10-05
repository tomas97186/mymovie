import { CommonModule, Location } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonItemDivider,
  IonLabel,
  IonList,
  IonNote,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToggle,
  IonToolbar
} from '@ionic/angular/standalone';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from 'src/app/services/auth.service';
import { SettingsService } from 'src/app/services/settings.service';
import { UserService } from 'src/app/services/user.service';
import packageJson from '../../../../package.json';
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings-page',
  templateUrl: './settings-page.component.html',
  styleUrls: ['./settings-page.component.scss'],
  imports: [
    CommonModule,
    IonNote, IonItemDivider, 
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
  authService = inject(AuthService);
  account = this.authService.currentUser$;
  userService = inject(UserService);
  userInfo$ = this.userService.getUserInfo();
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);
  languages = this.translate.getLangs();
  public version: string = packageJson.version;
  constructor() {}

  changeLanguage(event: Event) {
    const value = (event.target! as HTMLIonSelectElement).value;
    this.settings.language.value = value;
    this.translate.use(this.settings.language.value);
  }

  signout() {
    this.authService.signOut().then(() => this.router.navigate(['/']));
  }
}
