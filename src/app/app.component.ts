import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { EdgeToEdge } from '@capawesome/capacitor-android-edge-to-edge-support';
import { Platform } from '@ionic/angular';
import {
  AlertController,
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  ModalController,
  NavController
} from '@ionic/angular/standalone';
import { TranslateService } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import {
  add,
  addCircle,
  arrowUpOutline,
  calendarOutline,
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
  settingsOutline,
  shareSocialOutline,
  sparklesOutline,
  star,
  starOutline,
  trash
} from 'ionicons/icons';
import { AuthService } from './services/auth.service';
import { SettingsService } from './services/settings.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrl: 'app.component.scss',
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
  private dialog = inject(ModalController);
  private alert = inject(AlertController);
  title = 'MoviesMates';
  isDev = !environment.production;

  ngOnInit() {
    console.log('Using language: ', this.settings.language.value);
    this.translate.use(this.settings.language.value);
  }

  constructor() {
    this.platform.backButton.subscribeWithPriority(999, async () => {
      // var currentUrl = window.location.href;
      const a = await this.alert.getTop();
      if (a) {
        a.dismiss();
        return;
      }

      const d = await this.dialog.getTop();
      d ? d.dismiss() : this.location.back();
      // var toLoginPages = ['reset-password/step-1', 'forgot-username'];

      // if (toLoginPages.some((x) => currentUrl.indexOf(x) > -1)) {
      //   this.nav.navigateRoot('/login');
      // }
    });
    EdgeToEdge.setBackgroundColor({ color: '#0d0d0d' });
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
      calendarOutline,
      sparklesOutline
    });
  }
}
