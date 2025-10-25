import { Location, NgClass } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword, updateProfile } from '@firebase/auth';
import { ModalController, IonContent, IonHeader, IonInput, IonTitle, IonToolbar, IonButton, IonButtons, IonIcon, IonInputPasswordToggle, IonSpinner } from "@ionic/angular/standalone";
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { catchError, filter, first, from, map, switchMap, tap } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { ToastService } from 'src/app/services/toast.service';
import { UserService } from 'src/app/services/user.service';
import { INPUTS } from 'src/app/variables';

@Component({
  selector: 'app-update-password',
  templateUrl: './update-password.component.html',
  styleUrls: ['./update-password.component.scss'],
  imports: [IonSpinner, IonIcon, IonInputPasswordToggle, IonButtons, IonButton, ReactiveFormsModule, IonInput, IonContent, TranslateModule, IonTitle, IonToolbar, IonHeader, NgClass],
})
export class UpdatePasswordComponent {
  private readonly MESSAGE_LABELS = 'pages.profile.messages.';
  private readonly DIALOG_LABELS = 'pages.profile.dialogs.';

  private authService = inject(AuthService);
  private snackBar = inject(ToastService);
  private translate = inject(TranslateService);

  location = inject(Location);
  INPUTS = INPUTS;
  userService = inject(UserService);
  dialog = inject(ModalController);
  loading = false;
  form = new FormGroup({
    'oldPassword': new FormControl(undefined, [Validators.required, Validators.maxLength(60)]),
    'newPassword': new FormControl(null, [Validators.required, Validators.pattern('^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])\\S{6,}$'), Validators.maxLength(60)]),
    'ripetiPassword': new FormControl(null, [Validators.required, Validators.maxLength(60)])
  },
    {
      validators: this.passwordMatchValidator('newPassword', 'ripetiPassword')
    });

  get hasMinuscola() {
    return !!this.form.get('newPassword')?.value && /[a-z]/.test(this.form.get('newPassword')?.value!)
  }

  get hasMaiuscola() {
    return !!this.form.get('newPassword')?.value && /[A-Z]/.test(this.form.get('newPassword')?.value!)
  }

  get hasNumero() {
    return !!this.form.get('newPassword')?.value && /[0-9]/.test(this.form.get('newPassword')?.value!)
  }


  submit() {
    const data = this.form.value;
    if (data && data.newPassword && data.oldPassword) {
      this.loading = true;
      this.authService.currentUser$
        .pipe(
          filter((user) => !!user),
          first(),
          switchMap((user) =>
            from(
              reauthenticateWithCredential(
                user!,
                EmailAuthProvider.credential(user!.email!, data.oldPassword!)
              )
            ).pipe(map(() => user!))
          ),
          switchMap((user) => updatePassword(user!, (data.newPassword! as string).trim())),
          tap(() => {
            this.snackBar.open(
              this.translate.instant(this.MESSAGE_LABELS + 'password.successo'),
              { duration: 3000 }
            );
            this.loading = false;
            this.dialog.dismiss();
          }
          ),
          catchError((err) => {
            console.error('Error updating password:', err);
            this.snackBar.open(
              this.translate.instant(
                this.MESSAGE_LABELS + 'password.errore.generico'
              ),
              { duration: 3000 }
            );
            this.loading = false;
            throw err;
          })
        )
        .subscribe(
      );
    }

  }


  private passwordMatchValidator(passwordField: string, confirmField: string): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const password = formGroup.get(passwordField)?.value;
      const confirmPassword = formGroup.get(confirmField)?.value;

      if (password !== confirmPassword && !formGroup.get(passwordField)?.pristine && !formGroup.get(confirmField)?.pristine) {
        console.log('NON UGUALI')
        formGroup.get(confirmField)?.setErrors({ passwordMismatch: true });
        return { passwordMismatch: true };
      } else {
        // se erano presenti errori precedenti li rimuove
        const errors = formGroup.get(confirmField)?.errors;
        if (errors) {
          delete errors['passwordMismatch'];
          if (!Object.keys(errors).length) {
            formGroup.get(confirmField)?.setErrors(null);
          } else {
            formGroup.get(confirmField)?.setErrors(errors);
          }
        }
        return null;
      }
    };
  }
}
