import {
  ApplicationConfig,
  inject,
  LOCALE_ID,
  provideAppInitializer,
  provideZoneChangeDetection,
} from '@angular/core';
import {
  PreloadAllModules,
  provideRouter,
  RouteReuseStrategy,
  withPreloading,
} from '@angular/router';

import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore, enableIndexedDbPersistence } from '@angular/fire/firestore';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
  IonicRouteStrategy,
  provideIonicAngular,
} from '@ionic/angular/standalone';
import {
  provideTranslateLoader,
  provideTranslateService,
} from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { environment } from '../environments/environment';
import { routes } from './app.routes';
import { ProxyInterceptor } from './interceptors/proxy.interceptor';
import { SettingsService } from './services/settings.service';

export function appInitializerFactory() {
  return async () => {
    await inject(SettingsService).init();
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular({ useSetInputAPI: true, _forceStatusbarPadding: true }),
    ProxyInterceptor,
    provideHttpClient(withInterceptorsFromDi()),
    provideTranslateService({
      // registra il loader HTTP e il percorso dei file di traduzione
      loader: provideTranslateHttpLoader({
        prefix: '/assets/i18n/',
        suffix: '.json',
        enforceLoading: true, // opzionale
        useHttpBackend: true, // opzionale
      }),
      fallbackLang: 'en', // lingua fallback
      lang: 'it', // lingua iniziale
    }),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ProxyInterceptor,
      multi: true,
    },
    provideAnimations(),
    { provide: LOCALE_ID, useValue: 'it-IT' },
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
    provideAppInitializer(async () => await inject(SettingsService).init()),
  ],
};
