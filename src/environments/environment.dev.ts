const protocol: 'http' | 'https' = 'https'
const host = 'tmdb-dev.up.railway.app';
const port = 8080

export const environment = {
  production: false,
  posterUrl: 'https://image.tmdb.org/t/p/original',
  apiUrl: `${protocol}://${host}${port != 8080? (':'+ port) : ''}`,
  // Your web app's Firebase configuration
  firebaseConfig: {
  apiKey: "AIzaSyBtYDImwWDYGOdpt0B_94MFHl7UermtLHk",
  authDomain: "moviemates-dev.firebaseapp.com",
  databaseURL: "https://moviemates-dev-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "moviemates-dev",
  storageBucket: "moviemates-dev.firebasestorage.app",
  messagingSenderId: "219921804483",
  appId: "1:219921804483:web:5831a105a94f229e6a0676"
  },
};
