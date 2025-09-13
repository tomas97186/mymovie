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

@Component({
  selector: 'app-generic-dialog',
  imports: [
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
  readonly dialogRef = inject(MatDialogRef<GenericDialogComponent>);
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
    if(this.data.validators) {
      this.form.get('name')?.addValidators(this.data.validators!);
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}
