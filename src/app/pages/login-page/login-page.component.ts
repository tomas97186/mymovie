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
  IonInput,
  IonInputPasswordToggle,
  IonSpinner
} from '@ionic/angular/standalone';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ToastService } from 'src/app/services/toast.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    IonSpinner,
    IonInput,
    IonButton,
    ReactiveFormsModule,
    IonInputPasswordToggle,
  ],
})
export class LoginPage {
  private readonly MESSAGE_LABELS = 'pages.login.messages.';

  private readonly translate = inject(TranslateService);
  
  hidePassword = signal(true);
  loading = signal(false);
  authSub: Subscription;

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private snack: ToastService
  ) {
    this.form = this.fb.group({
      email: [
        '',
        [Validators.required, Validators.email, Validators.maxLength(320)],
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(35),
        ],
      ],
      remember: [true],
    });
    this.authSub = this.auth.currentUser$.subscribe((user) => {
      if (user) {
        this.router.navigateByUrl('/');
      }
    });
  }

  ngOnDestroy() {
    this.authSub?.unsubscribe();
  }

  async loginWithGoogle() {
    return this.auth.loginWithGoogle();
  }

  async submit() {
    if (this.form.invalid || this.loading()) return;
    this.loading.set(true);
    const { email, password } = this.form.getRawValue();

    try {
      await this.auth.login(String(email), String(password));
      this.snack.open(this.translate.instant(this.MESSAGE_LABELS + 'login.success'), { duration: 2500 });
      // Reindirizza dove preferisci
    } catch (err: any) {
      this.snack.open(this.translate.instant(this.MESSAGE_LABELS + 'login.errore'), { duration: 3500 });
    } finally {
      this.loading.set(false);
    }
  }
}
