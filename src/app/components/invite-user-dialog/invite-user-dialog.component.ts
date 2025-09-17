import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { IonButton, IonButtons, IonHeader, IonItem, IonTitle, IonToolbar, ModalController, IonInput } from "@ionic/angular/standalone";

@Component({
  selector: 'app-invite-user-dialog',
  imports: [IonInput, IonItem, IonButton, IonTitle, IonToolbar, IonButtons, IonHeader,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './invite-user-dialog.component.html',
  styleUrl: './invite-user-dialog.component.scss',
})
export class InviteUserDialogComponent {
  readonly dialogRef = inject(ModalController);
  private: boolean = true;
  usernameControl = new FormControl('', [Validators.required, Validators.pattern('^[A-Za-z0-9_]+$')]);

  close(): void {
    this.dialogRef.dismiss(this.usernameControl.value);
  }
}
