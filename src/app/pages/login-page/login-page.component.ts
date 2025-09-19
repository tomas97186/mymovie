import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

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
  IonInputPasswordToggle, IonSpinner } from '@ionic/angular/standalone';
import { Subscription } from 'rxjs';
import { ToastService } from 'src/app/services/toast.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
  imports: [IonSpinner, 
    IonItem,
    IonIcon,
    IonInput,
    IonButton,
    CommonModule,
    ReactiveFormsModule,
    // Material
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    IonInputPasswordToggle,
  ],
})
export class LoginPage {
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
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
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
    this.loading.set(true);
    const { email, password } = this.form.getRawValue();

    try {
      await this.auth.login(String(email), String(password));
      this.snack.open('Accesso eseguito!', { duration: 2500 });
      // Reindirizza dove preferisci
    } catch (err: any) {
      this.snack.open(err?.message || 'Accesso fallito', { duration: 3500 });
    } finally {
      this.loading.set(false);
    }
  }
}
