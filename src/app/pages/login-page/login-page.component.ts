import { Component, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';


// Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { IonButton, IonIcon } from "@ionic/angular/standalone";

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
  imports: [IonIcon, IonButton, 
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
    private snack: MatSnackBar
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      remember: [true]
    });
    this.authSub = this.auth.currentUser$.subscribe(user => {
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
      this.snack.open('Accesso eseguito!', 'OK', { duration: 2500 });
      // Reindirizza dove preferisci
    } catch (err: any) {
      this.snack.open(err?.message || 'Accesso fallito', 'CHIUDI', { duration: 3500 });
    } finally {
      this.loading.set(false);
    }
  }
}