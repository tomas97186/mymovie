import { CommonModule } from '@angular/common';
import { Component, effect, inject, input } from '@angular/core';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { IonButton, IonButtons, IonHeader, IonInput, IonItem, IonTitle, IonToolbar, ModalController } from "@ionic/angular/standalone";

@Component({
  selector: 'app-username-dialog',
  imports: [IonInput, IonToolbar, IonItem, IonButtons, IonHeader, IonTitle, IonButton,
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './username-dialog.component.html',
  styleUrl: './username-dialog.component.scss',
})
export class UsernameDialogComponent {
  readonly dialogRef = inject(ModalController);
  private fb = inject(FormBuilder);
  currentUsername = input<string>();
  readonly setUsername = effect(() => {
    this.form.get('name')?.setValue(this.currentUsername() || '');
    this.form.markAsPristine();
  })

  readonly form = this.fb.group({
    name: [
      '',
      [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(15),
        Validators.pattern('^[A-Za-z0-9_]+$'),
      ],
    ],
  });

  close(): void {
    this.dialogRef.dismiss(this.form.get('name')!.value);
  }
}
