import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule, Location } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ActivatedRoute, Router } from '@angular/router';
import { first, map, of, Subscription, tap } from 'rxjs';
import { SettingsComponent } from '../../components/list-details/settings/settings.component';
import { MovieListComponent } from '../../components/movie-list/movie-list.component';
import { NewListDialogComponent } from '../../components/new-list-dialog/new-list-dialog.component';
import { SearchItemModel } from '../../models/search-item.model';
import { AuthService } from '../../services/auth.service';
import { MovieListService } from '../../services/movie-list.service';
import { MoviesInListComponent } from '../../components/movies-in-list/movies-in-list.component';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { InviteUserDialogComponent } from '../../components/invite-user-dialog/invite-user-dialog.component';

@Component({
  selector: 'app-list-details',
  imports: [
    CommonModule,
    ClipboardModule,
    FormsModule,
    ReactiveFormsModule,
    MovieListComponent,
    MatButtonModule,
    MatListModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatToolbarModule,
    MatProgressBarModule,
    FormsModule,
    SettingsComponent,
    MoviesInListComponent,
  ],
  templateUrl: './list-details.component.html',
  styleUrl: './list-details.component.scss',
})
export class ListDetailsComponent {
  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private listService = inject(MovieListService);
  public authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private listId = signal<string | undefined>(undefined);
  private userListsSub!: Subscription;
  readonly dialog = inject(MatDialog);
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
      return this.listService
        .getListMembers(request)
        .pipe(
          map((memberList) =>
            memberList.map((m) => this.listService.getUserInfo(m))
          )
        );
    },
  });

  openUpdateDialog(): void {
    const dialogRef = this.dialog.open(NewListDialogComponent, {});

    dialogRef
      .afterClosed()
      .pipe(first())
      .subscribe((result) => {
        if (result !== undefined) {
          this.listService
            .changeListName(result.name)
            .then(() => {
              this.snackBar.open('Nome modificato con successo.', 'Chiudi', {
                duration: 3000,
              });
            })
            .catch((error) => {
              console.error('Error update name:', error);
              this.snackBar.open('Errore nella modifica del nome.', 'Chiudi', {
                duration: 3000,
              });
            });
        }
      });
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
          if ('id' in params) {
            this.listId.set(params['id']);
          }
        })
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.userListsSub?.unsubscribe();
  }

  exitList() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Conferma',
        body: 'Sei sicuro di voler abbandonare la lista?',
      },
    });

    dialogRef
      .afterClosed()
      .pipe(first())
      .subscribe((result) => {
        if (result) {
          const listId = this.listDetails.value()?.id;
          if (listId) {
            this.listService.exitList(listId).then(
              () => {
                this.router.navigate(['/lists']);
                this.snackBar.open('Non fai più parte della lista.', 'Chiudi', {
                  duration: 3000,
                });
              }
              // Optionally, navigate back or show a success message
            );
          } else {
            console.error('No list ID found in the route parameters');
          }
        }
      });
  }
}
