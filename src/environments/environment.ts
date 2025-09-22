// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: true,
  proxySecret: '',
  posterUrl: 'https://image.tmdb.org/t/p/original',
  apiUrl: '/.netlify/functions/tmdb',
  // Your web app's Firebase configuration
  firebaseConfig: {
    apiKey: 'AIzaSyDuKbBngtqj9egJ8S-bvyac2t5ZfTWimVc',
    // authDomain: 'mymovie-dc845.firebaseapp.com',
    databaseURL:
      'https://mymovie-dc845-default-rtdb.europe-west1.firebasedatabase.app',
    projectId: 'mymovie-dc845',
    storageBucket: 'mymovie-dc845.firebasestorage.app',
    messagingSenderId: '998649665443',
    appId: '1:998649665443:web:59746c7dc26e1d046aac16',
  },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
