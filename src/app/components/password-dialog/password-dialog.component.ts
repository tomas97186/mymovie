import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonButton, IonButtons, IonHeader, IonIcon, IonItem, IonTitle, IonToolbar, IonInput, ModalController, IonInputPasswordToggle } from "@ionic/angular/standalone";

@Component({
  selector: 'app-password-dialog',
  imports: [IonHeader, IonToolbar, IonButtons, IonItem, IonTitle, IonButton, IonIcon, IonInput, CommonModule, ReactiveFormsModule, IonInputPasswordToggle],
  templateUrl: './password-dialog.component.html',
  styleUrl: './password-dialog.component.scss'
})
export class PasswordDialogComponent {
  readonly dialogRef = inject(ModalController)
  form: FormGroup = inject(FormBuilder).group({
    oldPassword: ['', [Validators.required, Validators.minLength(8)]],
    newPassword: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)]],
  });

  close(): void {
    this.dialogRef.dismiss(this.form.value);
  }

}
