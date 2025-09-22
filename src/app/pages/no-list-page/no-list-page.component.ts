import { CommonModule } from '@angular/common';
import { Component, inject, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { ToastService } from 'src/app/services/toast.service';
import { MovieListService } from '../../services/movie-list.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-no-list-page',
  imports: [
    IonIcon,
    IonButton,
    TranslateModule,
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './no-list-page.component.html',
  styleUrl: './no-list-page.component.scss',
})
export class NoListPageComponent {
  joinList = output<void>();
  createList = output<void>();
}
