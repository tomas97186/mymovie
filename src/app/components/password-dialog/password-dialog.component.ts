import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-password-dialog',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatDialogModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './password-dialog.component.html',
  styleUrl: './password-dialog.component.scss'
})
export class PasswordDialogComponent {
  readonly dialogRef = inject(MatDialogRef<PasswordDialogComponent>)
  hideOldPassword = signal(true);
  hideNewPassword = signal(true);
  form: FormGroup;
  // readonly data = inject<{title: string}>(MAT_DIALOG_DATA);
  constructor(
    private fb: FormBuilder) {

    this.form = this.fb.group({
      oldPassword: ['', [Validators.required, Validators.minLength(8)]],
      newPassword: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)]],
    });
  }

  oldPassword: string = '';
  newPassword: string = '';

  close(): void {
    this.dialogRef.close();
  }

}
