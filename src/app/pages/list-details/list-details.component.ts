import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule, Location } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AlertController,
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonLabel,
  IonProgressBar,
  IonSegment,
  IonSegmentButton,
  IonSegmentContent,
  IonSegmentView,
  IonTitle,
  IonToolbar,
  ModalController,
} from '@ionic/angular/standalone';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of, Subscription, tap } from 'rxjs';
import { ToastService } from 'src/app/services/toast.service';
import { SettingsComponent } from '../../components/list-details/settings/settings.component';
import { MovieListComponent } from '../../components/movie-list/movie-list.component';
import { SearchItemModel } from '../../models/search-item.model';
import { AuthService } from '../../services/auth.service';
import { MovieListService } from '../../services/movie-list.service';
import { BUTTONS, INPUTS } from 'src/app/variables';

@Component({
  selector: 'app-list-details',
  imports: [
    TranslateModule,
    IonContent,
    IonLabel,
    IonSegmentButton,
    IonSegment,
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
    SettingsComponent,
    IonToolbar,
    IonTitle,
    IonSegmentView,
    IonSegmentContent,
  ],
  templateUrl: './list-details.component.html',
  styleUrl: './list-details.component.scss',
})
export class ListDetailsComponent {
  private readonly MESSAGE_LABELS = 'pages.listDetails.messages.';
  private readonly DIALOG_LABELS = 'pages.listDetails.dialogs.';

  private translate = inject(TranslateService);
  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private listService = inject(MovieListService);
  public authService = inject(AuthService);
  private snackBar = inject(ToastService);
  private listId = signal<string | undefined>(undefined);
  private userListsSub!: Subscription;
  private dialog = inject(ModalController);
  private alertController = inject(AlertController);
  location = inject(Location);
  listDetails = rxResource({
    request: this.listId,
    loader: ({ request }) => {
      if (!request) return of(undefined);
      return this.listService.getListInfo(request);
    },
  });

  watchedMovies = rxResource({
    request: this.listId,
    loader: ({ request }) => {
      if (!request) return of(undefined);
      return this.listService.getListMovies(request, true);
    },
  });
  moviesToWatch = rxResource({
    request: this.listId,
    loader: ({ request }) => {
      if (!request) return of(undefined);
      return this.listService.getListMovies(request, false);
    },
  });
  members = rxResource({
    request: this.listId,
    loader: ({ request }) => {
      if (!request) return of(undefined);
      return this.listService.getListMembers(request);
    },
  });

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
