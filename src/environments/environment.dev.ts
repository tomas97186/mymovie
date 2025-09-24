const protocol: 'http' | 'https' = 'https'
const host = 'tmdb.up.railway.app';
const port = 8080

export const environment = {
  production: false,
  posterUrl: 'https://image.tmdb.org/t/p/original',
  apiUrl: `${protocol}://${host}${port != 8080? (':'+ port) : ''}`,
  // Your web app's Firebase configuration
  firebaseConfig: {
    apiKey: 'AIzaSyDuKbBngtqj9egJ8S-bvyac2t5ZfTWimVc',
    authDomain: 'mymovie-dc845.firebaseapp.com',
    databaseURL:
      'https://mymovie-dc845-default-rtdb.europe-west1.firebasedatabase.app',
    projectId: 'mymovie-dc845',
    storageBucket: 'mymovie-dc845.firebasestorage.app',
    messagingSenderId: '998649665443',
    appId: '1:998649665443:web:59746c7dc26e1d046aac16',
  },
};
