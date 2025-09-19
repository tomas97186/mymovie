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
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addCircle,
  add,
  eye,
  home,
  list,
  person,
  search,
  trash,
  chevronBack,
  pencil,
  logOut,
  ellipsisHorizontalOutline,
  chevronForward,
  personAddOutline,
  starOutline,
  clipboardOutline,
  filmOutline,
  image,
  filterOutline,
  arrowUpOutline,
  star,
  checkmark,
  close,
  peopleOutline,
  shareOutline,
  shareSocialOutline,
} from 'ionicons/icons';
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';

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
  title = 'MoviesMates';

  constructor() {
    EdgeToEdge.disable();
    // StatusBar.setStyle({ style: Style.Dark }); // o Dark
    // StatusBar.setOverlaysWebView({ overlay: false });
    addIcons({
      add,
      shareSocialOutline,
      chevronBack,
      checkmark,
      close,
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
      home,
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
