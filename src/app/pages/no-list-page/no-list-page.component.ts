import { CommonModule } from '@angular/common';
import { Component, inject, output } from '@angular/core';
import {
  ReactiveFormsModule
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MovieListService } from '../../services/movie-list.service';
import { IonButton, IonIcon } from "@ionic/angular/standalone";

@Component({
  selector: 'app-no-list-page',
  imports: [IonIcon, IonButton, 
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './no-list-page.component.html',
  styleUrl: './no-list-page.component.scss',
})
export class NoListPageComponent {
  private listService = inject(MovieListService);
  private snackBar = inject(MatSnackBar);
  readonly dialog = inject(MatDialog);
  joinList = output<void>(); 
  createList = output<void>(); 
}
