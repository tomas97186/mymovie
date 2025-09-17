import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { IonButton } from "@ionic/angular/standalone";

@Component({
  selector: 'app-join-list-dialog',
  imports: [IonButton, CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatButtonModule, MatInputModule],
  templateUrl: './join-list-dialog.component.html',
  styleUrl: './join-list-dialog.component.scss'
})
export class JoinListDialogComponent {

  readonly dialogRef = inject(MatDialogRef<JoinListDialogComponent>)
  private: boolean = true;
  form: FormGroup;

  constructor(private fb: FormBuilder) {

    this.form = this.fb.group({
      code: ['', [Validators.required]],
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}
