import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {
  IonButton,
  IonIcon,
  IonItem,
  IonInput,
  IonInputPasswordToggle,
  IonSpinner,
} from '@ionic/angular/standalone';
import { Subscription } from 'rxjs';
import { ToastService } from 'src/app/services/toast.service';
import { AuthService } from '../../services/auth.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './signup-page.component.html',
  styleUrls: ['./signup-page.component.scss'],
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
    // Material
    IonInputPasswordToggle,
  ],
})
export class SignupPage {
  hidePassword = signal(true);
  loading = signal(false);
  authSub: Subscription;

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
      if (user) {
        this.router.navigateByUrl('/');
      }
    });
  }

  ngOnDestroy() {
    this.authSub?.unsubscribe();
  }

  async submit() {
    if (this.form.invalid || this.loading()) return;
    const { email, password, repeatPassword } = this.form.getRawValue();
    if (password != repeatPassword) {
      this.snack.open('Le password inserite non corrispondono.', {
        color: 'danger',
        duration: 3000,
      });
      return;
    }

    this.loading.set(true);

    try {
      await this.auth.registerUser(String(email), String(password));
      this.snack.open('Registrazione completata con successo!', {
        duration: 2500,
      });
    } catch (err: any) {
      console.log(err.code);
      this.snack.open('Registrazione fallita', {
        duration: 3500,
      });
    } finally {
      this.loading.set(false);
    }
  }
}
