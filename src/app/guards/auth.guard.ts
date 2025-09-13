import { CanActivateFn, Router } from "@angular/router";
import { TMDBService } from "../services/tmdb.service";
import { inject } from "@angular/core";
import { AuthService } from "../services/auth.service";
import { filter, map, tap } from "rxjs";

export function authenticationGuard(): CanActivateFn {
    return () => {
        const authService = inject(AuthService);
        const router = inject(Router);

        return authService.currentUser$.pipe(
            filter(user => user !== undefined),
            map(user =>
                user != null
            ),
            tap(isAuth => {
                if (!isAuth) {
                    router.navigate(['/login']);
                }
            })
        )
    };
}