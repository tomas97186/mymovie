import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule, Location } from '@angular/common';
import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Share } from '@capacitor/share';
import {
  AlertController,
  IonBackButton,
  IonButton,
  IonButtons,
  IonChip,
  IonContent,
  IonHeader,
  IonIcon,
  IonLabel,
  IonProgressBar,
  IonTitle,
  IonToolbar,
  IonSegmentContent,
  IonSegmentView,
  ModalController,
  IonNote,
  IonSegment,
  IonSegmentButton,
} from '@ionic/angular/standalone';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { map, of, Subject, Subscription, tap } from 'rxjs';
import { ToastService } from 'src/app/services/toast.service';
import { BUTTONS, INPUTS } from 'src/app/variables';
import { MovieListComponent } from '../../components/movie-list/movie-list.component';
import { SearchItemModel } from '../../models/search-item.model';
import { AuthService } from '../../services/auth.service';
import { MovieListService } from '../../services/movie-list.service';
import { ListSettingsPageComponent } from '../list-settings-page/list-settings-page.component';
import { InvitationResponseEnum } from 'src/app/enum/invitation.response.enum';
import { InviteUserPageComponent } from '../invite-user-page/invite-user-page.component';
import { MovieListDynamicComponent } from 'src/app/components/movie-list-dynamic/movie-list-dynamic.component';
import { SearchResultsModel } from 'src/app/models/search-results.model';

@Component({
  selector: 'app-list-details',
  imports: [
    IonSegmentButton,
    IonSegment,
    IonNote,
    IonChip,
    TranslateModule,
    IonContent,
    IonLabel,
    RouterModule,
    IonProgressBar,
    IonButtons,
    IonHeader,
    IonBackButton,
    IonButton,
    IonIcon,
    CommonModule,
    ClipboardModule,
    FormsModule,
    ReactiveFormsModule,
    MovieListComponent,
    FormsModule,
    IonToolbar,
    IonTitle,
    IonSegmentContent,
    IonSegmentView,
    MovieListDynamicComponent,
  ],
  templateUrl: './new-list-details.component.html',
  styleUrl: './new-list-details.component.scss',
})
export class NewListDetailsComponent {
  private readonly MESSAGE_LABELS = 'pages.listDetails.messages.';
  private readonly DIALOG_LABELS = 'pages.listDetails.dialogs.';

  private translate = inject(TranslateService);
  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);
  private listService = inject(MovieListService);
  public authService = inject(AuthService);
  private snackBar = inject(ToastService);
  private listId = signal<string | undefined>(undefined);
  private userListsSub!: Subscription;
  private alertController = inject(AlertController);
  private dialog = inject(ModalController);
  selectedFilter = signal<'toWatch' | 'watched'>('toWatch');
  location = inject(Location);
  currentPage = signal<number>(1);
  listDetails = rxResource({
    request: this.listId,
    loader: ({ request }) => {
      if (!request) return of(undefined);
      return this.listService.getListInfo(request);
    },
  });
  selectedTab = signal<string>('like');
  movies = rxResource({
    request: () => ({
      selectedTab: this.selectedTab(),
      listDetails: this.listDetails.value(),
      page: this.currentPage(),
    }),
    loader: ({ request: { selectedTab, listDetails, page } }) => {
      return this.listService
        .getListMovies(listDetails?.id!, selectedTab === 'watched', page)
        .pipe(
          map(
            (movies) =>
              ({
                results: movies,
                current_page: page,
                total_results:
                  selectedTab === 'watched'
                    ? this.listDetails!.value()!.watchedMovies
                    : this.listDetails!.value()!.moviesCount -
                      this.listDetails!.value()!.watchedMovies,
                total_pages:
                  selectedTab === 'watched'
                    ? listDetails!.watchedPages
                    : listDetails!.toWatchPages,
              } as SearchResultsModel)
          ),
          tap(console.log)
        );
    },
  });
  total = computed(() =>
    !this.listDetails.hasValue()
      ? undefined
      : this.selectedTab() === 'watched'
      ? this.listDetails!.value()!.watchedMovies
      : this.listDetails!.value()!.moviesCount -
        this.listDetails!.value()!.watchedMovies
  );

  onSegmentChange(event: CustomEvent) {
    this.selectedTab.set(event.detail.value);
  }

  async openSettings() {
    const alert = await this.dialog.create({
      component: ListSettingsPageComponent,
      initialBreakpoint: 1,
      componentProps: {
        details: this.listDetails.value()!,
        inviteUser: this.openInviteUserDialog.bind(this),
        shareList: this.shareListCode.bind(this),
      },
    });
    await alert.present();
  }

  async openInvite() {
    const alert = await this.dialog.create({
      component: InviteUserPageComponent,
      initialBreakpoint: 1,
      componentProps: {
        details: this.listDetails.value()!,
      },
    });
    await alert.present();
  }

  async openUpdateDialog() {
    const alert = await this.alertController.create({
      header: this.translate.instant(
        this.DIALOG_LABELS + 'modificaNome.header'
      ),
      inputs: [
        {
          id: 'name',
          label: this.translate.instant(INPUTS.NOME),
          placeholder: this.translate.instant(INPUTS.NOME),
          name: 'name',
          attributes: {
            maxLength: 45,
          },
        },
      ],
      buttons: [
        {
          text: this.translate.instant(BUTTONS.ANNULLA),
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: this.translate.instant(BUTTONS.CONFERMA),
          role: 'confirm',
          handler: (data) => {
            if (data.name.length < 3) {
              this.snackBar.open(
                this.translate.instant(
                  this.MESSAGE_LABELS + 'modificaNome.errore.minLength'
                ),
                { color: 'danger', duration: 3000 }
              );
              return false;
            } else {
              return this.__updateName(data);
            }
          },
        },
      ],
    });

    await alert.present();
  }

  async shareListCode() {
    if ((await Share.canShare()).value) {
      // Share text only
      await Share.share({
        text: this.translate.instant(
          this.MESSAGE_LABELS + 'settings.condividi.messaggio',
          {
            listId: this.listDetails.value()?.id,
          }
        ),
      });
    } else {
      this.snackBar.open(
        this.translate.instant(this.MESSAGE_LABELS + 'condivi.errore')
      );
    }
  }

  async openInviteUserDialog() {
    const alert = await this.alertController.create({
      header: this.translate.instant(
        'pages.listDetails.settings.dialogs.invita.header'
      ),
      inputs: [
        {
          id: 'username',
          label: 'Username',
          placeholder: 'Username',
          name: 'username',
          attributes: {
            maxLength: 15,
            minLength: 5,
          },
        },
      ],
      buttons: [
        {
          text: this.translate.instant(BUTTONS.ANNULLA),
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: this.translate.instant(BUTTONS.CONFERMA),
          role: 'confirm',
          handler: this.__inviteUser.bind(this),
        },
      ],
    });

    await alert.present();
  }
  private __inviteUser(data: { username: string }) {
    if (data && data.username) {
      this.listService
        .inviteToList(this.listId()!, data.username)
        .then((res) => {
          switch (res) {
            case InvitationResponseEnum.USERNAME_NOT_EXISTS: {
              this.snackBar.open(
                this.translate.instant(
                  this.MESSAGE_LABELS + 'invito.nonEsiste',
                  {
                    username: data.username,
                  }
                ),
                {
                  duration: 3000,
                }
              );
              break;
            }
            case InvitationResponseEnum.USER_IN_LIST: {
              this.snackBar.open(
                this.translate.instant(
                  this.MESSAGE_LABELS + 'invito.utenteInList',
                  {
                    username: data.username,
                  }
                ),
                {
                  duration: 3000,
                }
              );
              break;
            }
            default: {
              this.snackBar.open(
                this.translate.instant(this.MESSAGE_LABELS + 'invito.successo'),
                {
                  duration: 3000,
                }
              );
            }
          }
        })
        .catch((error) => {
          console.error('Error invite:', error);
          this.snackBar.open(
            this.translate.instant(this.MESSAGE_LABELS + 'errore'),
            {
              duration: 3000,
            }
          );
        });
    }
  }

  private __updateName(data: { name: string }) {
    if (data && data.name) {
      console.log(data);
      this.listService
        .changeListName(data.name, this.listId()!)
        .then(() => {
          this.snackBar.open(
            this.translate.instant(
              this.MESSAGE_LABELS + 'modificaNome.successo'
            ),
            {
              duration: 3000,
            }
          );
        })
        .catch((error) => {
          console.error('Error update name:', error);
          this.snackBar.open(
            this.translate.instant(
              this.MESSAGE_LABELS + 'modificaNome.errore.generico'
            ),
            {
              duration: 3000,
            }
          );
        });
    }
  }

  filterMovies(movieList: SearchItemModel[], watched: boolean) {
    return movieList.filter(
      (movie) => (!!!movie.watched && !watched) || movie.watched === watched
    );
  }

  scrollToTop() {
    const element = document.querySelector('.container');
    element?.scroll({ top: 0, behavior: 'smooth' });
  }

  copyToClipboardNotification() {
    this.snackBar.open(
      this.translate.instant(this.MESSAGE_LABELS + 'copiaCodice'),
      {
        duration: 3000,
      }
    );
  }

  ngOnInit() {
    this.route.params
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap((params) => {
          if ('listId' in params) {
            this.listId.set(params['listId']);
          }
        })
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.userListsSub?.unsubscribe();
  }
}
