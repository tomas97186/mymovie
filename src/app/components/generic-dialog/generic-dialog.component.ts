import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validator, ValidatorFn } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { IonButton, ModalController, IonHeader, IonItem, IonTitle, IonToolbar, IonButtons, IonInput } from "@ionic/angular/standalone";

@Component({
  selector: 'app-generic-dialog',
  imports: [IonInput, IonButtons, IonToolbar, IonTitle, IonItem, IonHeader, IonButton,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatDialogModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './generic-dialog.component.html',
  styleUrl: './generic-dialog.component.scss',
})
export class GenericDialogComponent {
  readonly dialogRef = inject(ModalController);
  private fb = inject(FormBuilder);
  readonly data = inject<{
    title: string;
    description: string;
    field: string;
    value?: string;
    validators?: ValidatorFn[];
  }>(MAT_DIALOG_DATA);

  readonly form = this.fb.group({
    name: [''],
  });

  ngOnInit() {
    this.form.get('name')?.setValue(this.data.value || '');
    if (this.data.validators) {
      this.form.get('name')?.addValidators(this.data.validators!);
    }
  }

  close(): void {
    this.dialogRef.dismiss(this.form.get('name')!.value);
  }
}
