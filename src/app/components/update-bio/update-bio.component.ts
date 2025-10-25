import { Location } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { updateProfile } from '@firebase/auth';
import { ModalController, IonContent, IonHeader, IonInput, IonTitle, IonToolbar, IonButton, IonButtons, IonIcon } from "@ionic/angular/standalone";
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { filter, first, tap } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { ToastService } from 'src/app/services/toast.service';
import { UserService } from 'src/app/services/user.service';
import { INPUTS } from 'src/app/variables';

@Component({
  selector: 'app-update-bio',
  templateUrl: './update-bio.component.html',
  styleUrls: ['./update-bio.component.scss'],
  imports: [IonIcon, IonButtons, IonButton, ReactiveFormsModule, IonInput, IonContent, TranslateModule, IonTitle, IonToolbar, IonHeader],
})
export class UpdateUsernameComponent {
  private readonly MESSAGE_LABELS = 'pages.profile.messages.';
  private readonly DIALOG_LABELS = 'pages.profile.dialogs.';

  private authService = inject(AuthService);
  private snackBar = inject(ToastService);
  private translate = inject(TranslateService);

  location = inject(Location);
  INPUTS = INPUTS;
  userService = inject(UserService);
  currentBio = this.userService.userInfo?.bio;
  dialog = inject(ModalController);
  form = new FormGroup({
    'bio': new FormControl(this.currentBio, [Validators.required, Validators.maxLength(40), Validators.minLength(3), Validators.pattern('^[a-zA-Z0-9_]*$')])
  })

  submit() {
    const bio = this.form.get('bio')?.value;
    if (bio) {
      this.userService
        .setBio(bio)
        .then(() => {
          this.dialog.dismiss();
          this.snackBar.open(
            this.MESSAGE_LABELS + 'bio.successo'
          );
        })
        .catch((e) => {
          console.error(e);
          this.snackBar.open(
            this.translate.instant(
              this.MESSAGE_LABELS + 'bio.errore.generico'
            ),
            {
              duration: 3000,
            }
          );
        });
    }

  }

}
