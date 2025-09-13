import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-username-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatDialogModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './username-dialog.component.html',
  styleUrl: './username-dialog.component.scss',
})
export class UsernameDialogComponent {
  readonly dialogRef = inject(MatDialogRef<UsernameDialogComponent>);
  private fb = inject(FormBuilder);
  readonly data = inject<{
    value?: string;
  }>(MAT_DIALOG_DATA);

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

  initialValue?: string;

  ngOnInit() {
    this.initialValue = this.data.value;
    this.form.get('name')?.setValue(this.initialValue || '');
    this.form.markAsPristine();
  }

  close(): void {
    this.dialogRef.close();
  }
}
