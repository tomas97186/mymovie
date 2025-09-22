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
import { IonIcon } from '@ionic/angular/standalone';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { interval, Subscription } from 'rxjs';
import { ToastService } from 'src/app/services/toast.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './email-verification-page.component.html',
  styleUrls: ['./email-verification-page.component.scss'],
  imports: [
    CommonModule,
    TranslateModule,
    RouterModule,
    IonIcon,
    ReactiveFormsModule,
  ],
})
export class EmailVerificationPage {
  private readonly MESSAGE_LABELS = 'pages.emailVerification.messages.';

  private translate = inject(TranslateService);

  hidePassword = signal(true);
  loading = signal(false);
  authSub: Subscription;
  checkSub: Subscription;

  form: FormGroup;

  constructor(
    public auth: AuthService,
    private fb: FormBuilder,
    private router: Router,
    private snack: ToastService
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(30),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/),
        ],
      ],
      repeatPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(30),
        ],
      ],
      remember: [true],
    });
    this.authSub = this.auth.currentUser$.subscribe((user) => {
      if (user?.emailVerified) {
        this.router.navigateByUrl('/');
      }
    });

    this.checkSub = interval(5000).subscribe(async () => {
      const user = this.auth.currentUser$;
      if (user) {
        await auth.userReload();
      }
    });
  }

  ngOnDestroy() {
    this.authSub?.unsubscribe();
    this.checkSub.unsubscribe();
  }

  async returnToLogin() {
    await this.auth.logout();
    this.router.navigate(['/login']);
  }

  async sendEmail() {
    try {
      await this.auth.sendEmailVerification();
      this.snack.open(
        this.translate.instant(this.MESSAGE_LABELS + 'email.successo'),
        {
          duration: 2500,
        }
      );
    } catch (err: any) {
      console.log(err.code);
      this.snack.open(
        this.translate.instant(this.MESSAGE_LABELS + 'email.errore'),
        {
          duration: 3500,
        }
      );
    } finally {
      this.loading.set(false);
    }
  }
}
