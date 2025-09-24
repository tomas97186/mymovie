import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

// Angular Material
import {
  IonButton,
  IonIcon,
  IonInput,
  IonInputPasswordToggle,
  IonItem,
  IonSpinner,
} from '@ionic/angular/standalone';
import { Subscription } from 'rxjs';
import { ToastService } from 'src/app/services/toast.service';
import { AuthService } from '../../services/auth.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { INPUTS } from 'src/app/variables';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './password-reset-page.component.html',
  styleUrls: ['./password-reset-page.component.scss'],
  imports: [
    CommonModule,
    TranslateModule,
    RouterModule,
    IonSpinner,
    IonItem,
    IonIcon,
    IonInput,
    IonButton,
    ReactiveFormsModule,
    IonInputPasswordToggle,
  ],
})
export class PasswordResetPage {
  private readonly MESSAGE_LABELS = 'pages.passwordReset.messages.';
  EMAIL = INPUTS.EMAIL;

  private readonly translate = inject(TranslateService);

  hidePassword = signal(true);
  loading = signal(false);

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private snack: ToastService
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  async submit() {
    if (this.form.invalid || this.loading()) return;
    this.loading.set(true);
    const { email, password } = this.form.getRawValue();

    try {
      await this.auth.resetPassword(String(email));
      this.snack.open(
        this.translate.instant(this.MESSAGE_LABELS + 'reset.successo'),
        { duration: 2500 }
      );
      // Reindirizza dove preferisci
    } catch (err: any) {
      this.snack.open(
        this.translate.instant(this.MESSAGE_LABELS + 'reset.errore'),
        {
          duration: 3500,
        }
      );
    } finally {
      this.loading.set(false);
    }
  }
}
