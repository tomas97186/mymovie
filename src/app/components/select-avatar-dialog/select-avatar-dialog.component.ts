import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { IonContent, IonButton, IonFab, ModalController, IonHeader, IonTitle, IonToolbar } from "@ionic/angular/standalone";
import { TranslateModule } from '@ngx-translate/core';
import { AVATAR_COLORS } from 'src/app/variables';

@Component({
  selector: 'app-select-avatar-dialog',
  templateUrl: './select-avatar-dialog.component.html',
  styleUrls: ['./select-avatar-dialog.component.scss'],
  imports: [IonToolbar, IonTitle, IonHeader, IonFab, TranslateModule, IonButton, CommonModule, IonContent],
})
export class SelectAvatarDialogComponent implements OnInit {
  private http = inject(HttpClient);
  avatars!: { name: string, url: string }[];
  selectedAvatar?: string;
  dialogRef = inject(ModalController);
  colors = AVATAR_COLORS;
  selectedColor = this.colors[0];


  constructor() { }

  selectAvatar(url: string) {
    this.selectedAvatar = url;
  }

  selectColor(color: string) {
    this.selectedColor = color;
    const tmp = this.avatars.map(a => {
      const u = new URL(a.url);
      u.searchParams.set('backgroundColor', color.replace('#', ''));
      return { ...a, url: u.toString() }
    });
    this.avatars = [];
    this.avatars = tmp;
  }

  ngOnInit() {
    this.http.get<any[]>('assets/data/avatars.json').subscribe(data => {
      this.avatars = data;
    });
  }

}
