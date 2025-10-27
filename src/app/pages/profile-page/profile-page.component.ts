import { CommonModule, Location } from '@angular/common';
import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  Signal,
  signal,
} from '@angular/core';
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  updateProfile,
} from '@angular/fire/auth';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  AlertController,
  IonContent,
  IonIcon,
  IonSegment,
  IonSegmentButton,
  IonSegmentView,
  IonSegmentContent,
  ModalController,
  IonLabel,
  IonFab,
  IonFabButton,
  IonButton,
} from '@ionic/angular/standalone';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  catchError,
  filter,
  first,
  from,
  map,
  Observable,
  of,
  share,
  switchMap,
  tap,
} from 'rxjs';
import { MovieListComponent } from 'src/app/components/movie-list/movie-list.component';
import { ToastService } from 'src/app/services/toast.service';
import { UserService } from 'src/app/services/user.service';
import { BUTTONS } from 'src/app/variables';
import { fieldValidations } from 'src/environments/fields.validation';
import { AuthService } from '../../services/auth.service';
import { MovieListService } from '../../services/movie-list.service';
import {
  rxResource,
  takeUntilDestroyed,
  toSignal,
} from '@angular/core/rxjs-interop';
import { FriendsService } from 'src/app/services/friends.service';
import { FriendStatusEnum } from 'src/app/enum/friend-status.enum';
import { FriendshipModel } from 'src/app/models/Friendship.model';
import { SearchItemModel } from 'src/app/models/search-item.model';
import { SelectAvatarDialogComponent } from 'src/app/components/select-avatar-dialog/select-avatar-dialog.component';

@Component({
  selector: 'app-profile-page',
  imports: [
    IonButton,
    IonFabButton,
    IonFab,
    IonLabel,
    IonSegmentButton,
    IonSegment,
    CommonModule,
    TranslateModule,
    RouterModule,
    IonContent,
    IonIcon,
    IonSegmentView,
    IonSegmentContent,
    MovieListComponent,
  ],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss',
})
export class ProfilePageComponent {
  private readonly MESSAGE_LABELS = 'pages.profile.messages.';
  private readonly DIALOG_LABELS = 'pages.profile.dialogs.';

  private readonly translate = inject(TranslateService);
  readonly dialog = inject(ModalController);
  readonly alertController = inject(AlertController);
  readonly router = inject(Router);
  readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly snackBar = inject(ToastService);
  private readonly location = inject(Location);
  authService = inject(AuthService);
  userService = inject(UserService);
  listService = inject(MovieListService);
  private friendService = inject(FriendsService);
  private currentUid = toSignal<string | undefined>(
    this.route.params.pipe(
      takeUntilDestroyed(this.destroyRef),
      map((data) => {
        const uid =
          'id' in data ? data['id'] : this.userService.currentUser!.uid;
        return uid as string;
      })
    ),
    { initialValue: undefined }
  );
  userInfo = rxResource({
    request: () => this.currentUid(),
    loader: ({ request }) => {
      console.log('UID: ', request);
      return this.userService.getUserInfo(request);
    },
  });
  isYou = computed(
    () => this.currentUid() === this.userService.currentUser?.uid
  );
  friendshipStatus = computed(() =>
    this.currentUid() === this.userService.currentUser?.uid
      ? of(undefined)
      : this.friendService.getFriendStatus(this.currentUid()!)
  );
  FriendStatusEnum = FriendStatusEnum;
  selectedTab = signal<string>('like');
  movies = rxResource({
    request: () => ({
      selectedTab: this.selectedTab(),
      uid: this.currentUid(),
    }),
    loader: ({ request: { selectedTab, uid } }) => {
      return this.listService.getUserReviews(uid, selectedTab === 'like');
    },
  });

  onSegmentChange(event: CustomEvent) {
    this.selectedTab.set(event.detail.value);
  }

  async openChangeAvatarModal() {
    const ref = await this.dialog.create({
      component: SelectAvatarDialogComponent,
      initialBreakpoint: 0.5,
      expandToScroll: false,
      componentProps: {},
    });
    ref.present();
    const { data } = await ref.onWillDismiss();
    if (!!data) {
      this.userService.setAvatar(data);
    }
  }

  scrollToTop() {
    const element = document.querySelector('.container');
    element?.scroll({ top: 0, behavior: 'smooth' });
  }

  removeFriend(uid: string, username: string, request: boolean = false) {
    const messagePath =
      this.MESSAGE_LABELS + request ? 'removeFriend.' : 'cancelRequest.';
    this.friendService
      .removeFriend(uid)
      .then((res) => {
        this.snackBar.open(
          this.translate.instant(messagePath + 'success', { username })
        );
      })
      .catch((err) => {
        console.error('ERROR DURING REMOVE FRIEND: ', err);
        this.snackBar.open(
          this.translate.instant(messagePath + 'error', { username }),
          { color: 'danger', duration: 3000 }
        );
      });
  }

  acceptFriend(uid: string, username: string) {
    this.friendService
      .acceptFriendRequest({ uid, username })
      .then((res) => {
        this.snackBar.open(
          this.translate.instant(this.MESSAGE_LABELS + 'acceptFriend.success', {
            username,
          })
        );
      })
      .catch((err) => {
        console.error('ERROR DURING REMOVE FRIEND: ', err);
        this.snackBar.open(
          this.MESSAGE_LABELS +
            this.translate.instant('acceptFriend.error', { username }),
          { color: 'danger', duration: 3000 }
        );
      });
  }

  addFriend(username: string) {
    if (username) {
      this.friendService
        .sendFriendRequest(username)
        .then((res) => {
          this.snackBar.open(
            this.translate.instant(this.MESSAGE_LABELS + 'addFriend.success'),
            {
              duration: 3000,
            }
          );
        })
        .catch((error) => {
          console.error('Error add friend:', error);
          this.snackBar.open(
            this.translate.instant(this.MESSAGE_LABELS + 'addFriend.errore'),
            {
              duration: 3000,
            }
          );
        });
    }
  }

  closePage() {
    this.location.back();
  }
}
