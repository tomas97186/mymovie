import { CommonModule, Location } from '@angular/common';
import { Component, inject } from '@angular/core';
import { EdgeToEdge } from '@capawesome/capacitor-android-edge-to-edge-support';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  NavController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  add,
  addCircle,
  arrowUpOutline,
  checkmark,
  chevronBack,
  chevronForward,
  clipboardOutline,
  close,
  ellipsisHorizontalOutline,
  eye,
  filmOutline,
  filterOutline,
  homeOutline,
  image,
  informationCircleOutline,
  list,
  logoGoogle,
  logOut,
  pencil,
  peopleOutline,
  person,
  personAddOutline,
  returnUpBackOutline,
  search,
  settings,
  settingsOutline,
  shareSocialOutline,
  star,
  starOutline,
  trash,
} from 'ionicons/icons';
import { AuthService } from './services/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { SettingsService } from './services/settings.service';
import { Preferences } from '@capacitor/preferences';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [
    CommonModule,
    IonApp,
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel,
    IonRouterOutlet,
  ],
})
export class AppComponent {
  currentUser$ = inject(AuthService).currentUser$;
  private translate = inject(TranslateService);
  private settings = inject(SettingsService);
  private platform = inject(Platform);
  private location = inject(NavController);
  title = 'MoviesMates';

  ngOnInit() {
    console.log('Using language: ', this.settings.language.value);
    this.translate.use(this.settings.language.value);
  }

  constructor() {
    this.platform.backButton.subscribeWithPriority(999, () => {
      // var currentUrl = window.location.href;
      this.location.back();
      // var toLoginPages = ['reset-password/step-1', 'forgot-username'];

      // if (toLoginPages.some((x) => currentUrl.indexOf(x) > -1)) {
      //   this.nav.navigateRoot('/login');
      // }
    });
    EdgeToEdge.disable();
    addIcons({
      add,
      settingsOutline,
      shareSocialOutline,
      chevronBack,
      checkmark,
      informationCircleOutline,
      close,
      logoGoogle,
      returnUpBackOutline,
      personAddOutline,
      peopleOutline,
      image,
      filterOutline,
      arrowUpOutline,
      filmOutline,
      star,
      starOutline,
      clipboardOutline,
      chevronForward,
      homeOutline,
      search,
      list,
      person,
      eye,
      trash,
      addCircle,
      pencil,
      logOut,
      ellipsisHorizontalOutline,
    });
  }
}
