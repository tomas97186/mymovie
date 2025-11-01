import { CommonModule, Location } from '@angular/common';
import { Component, inject, Injector } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonTitle,
  IonToolbar,
  ModalController,
} from '@ionic/angular/standalone';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UserModel } from 'src/app/models/user.model';
import { AppSettingsService } from 'src/app/services/app-settings.service';
import { ToastService } from 'src/app/services/toast.service';
import { UserService } from 'src/app/services/user.service';
import { INPUTS } from 'src/app/variables';

@Component({
  selector: 'app-update-username',
  templateUrl: './update-username.component.html',
  styleUrls: ['./update-username.component.scss'],
  imports: [
    CommonModule,
    IonIcon,
    IonButtons,
    IonButton,
    ReactiveFormsModule,
    IonInput,
    IonContent,
    TranslateModule,
    IonTitle,
    IonToolbar,
    IonHeader,
  ],
})
export class UpdateUsernameComponent {
  private readonly MESSAGE_LABELS = 'pages.profile.messages.';

  private snackBar = inject(ToastService);
  private translate = inject(TranslateService);
  appSettings = inject(AppSettingsService);
  userService = inject(UserService);

  location = inject(Location);
  INPUTS = INPUTS;
  currentUsername = this.userService.userInfo?.username;
  dialog = inject(ModalController);
  form = new FormGroup({
    username: new FormControl(this.currentUsername, [
      Validators.required,
      Validators.maxLength(40),
      Validators.minLength(3),
      Validators.pattern('^[a-zA-Z0-9_]*$'),
    ]),
  });

  submit() {
    const username = this.form.get('username')?.value;
    if (username) {
      this.userService
        .setUsername(username.trim())
        .then(() => {
          this.dialog.dismiss();
          this.snackBar.open(this.MESSAGE_LABELS + 'username.successo');
        })
        .catch((e) => {
          console.error(e);
          this.snackBar.open(
            this.translate.instant(
              this.MESSAGE_LABELS + 'username.errore.generico'
            ),
            {
              duration: 3000,
            }
          );
        });
    }
  }

  daysFromLastChange(userInfo: UserModel): number | undefined {
    const lastUsernameChange = userInfo?.lastUsernameChange;
    if (!lastUsernameChange) {
      return undefined;
    }
    const lastChangeDate = new Date(lastUsernameChange);
    const now = new Date();
    const diffInMs = now.getTime() - lastChangeDate.getTime();
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
    const res =
      diffInDays >= this.appSettings.settings!.changeUsernameDaysInterval;

    if (!res) {
      this.form.get('username')?.disable();
    }

    return diffInDays;
  }
}
