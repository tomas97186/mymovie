import { Component } from '@angular/core';
import { EdgeToEdge } from '@capawesome/capacitor-android-edge-to-edge-support';
import { IonApp, IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addCircle, add, eye, home, list, person, search, trash, chevronBack, pencil, logOut, ellipsisHorizontalOutline, chevronForward, personAddOutline, starOutline, clipboardOutline, filmOutline, image, filterOutline, arrowUpOutline, star, checkmark, close, peopleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonRouterOutlet],
})
export class AppComponent {
  title = 'movie-angular';
  constructor() {
    EdgeToEdge.disable();
    // StatusBar.setStyle({ style: Style.Dark }); // o Dark
    // StatusBar.setOverlaysWebView({ overlay: false });
    addIcons({ add, chevronBack, checkmark, close, personAddOutline, peopleOutline, image, filterOutline, arrowUpOutline, filmOutline, star, starOutline, clipboardOutline, chevronForward, home, search, list, person, eye, trash, addCircle, pencil, logOut, ellipsisHorizontalOutline });
  }
}
