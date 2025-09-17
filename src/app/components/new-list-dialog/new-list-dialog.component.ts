import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { IonButton, IonButtons, IonCheckbox, IonContent, IonHeader, IonInput, IonItem, IonModal, IonTitle, IonToolbar, ModalController, IonList } from "@ionic/angular/standalone";

@Component({
  selector: 'app-new-list-dialog',
  imports: [IonList, IonInput, IonCheckbox, IonItem, IonContent, IonButton, IonButtons, IonTitle, IonToolbar, IonModal, IonHeader,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './new-list-dialog.component.html',
  styleUrl: './new-list-dialog.component.scss',
})
export class NewListDialogComponent {
  readonly dialogRef = inject(ModalController);
  name: string = '';
  private: boolean = true;
  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(15),
        ],
      ],
    });
  }

  close(): void {
    this.dialogRef.dismiss(this.form.get('name')?.value);
  }
}
