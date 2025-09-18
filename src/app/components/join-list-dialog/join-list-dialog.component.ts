import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { IonInput, IonButton, IonButtons, IonHeader, IonItem, IonTitle, IonToolbar, ModalController } from "@ionic/angular/standalone";

@Component({
  selector: 'app-join-list-dialog',
  imports: [IonItem, IonInput, IonTitle, IonButtons, IonToolbar, IonHeader, IonButton, CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatButtonModule, MatInputModule],
  templateUrl: './join-list-dialog.component.html',
  styleUrl: './join-list-dialog.component.scss'
})
export class JoinListDialogComponent {

  readonly dialogRef = inject(ModalController)
  private: boolean = true;
  form: FormGroup;

  constructor(private fb: FormBuilder) {

    this.form = this.fb.group({
      code: [undefined, [Validators.required]],
    });
  }

  close(): void {
    this.dialogRef.dismiss(this.form.value);
  }
}
