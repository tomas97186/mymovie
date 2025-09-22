import { Injectable } from '@angular/core';
import { Auth, User } from '@angular/fire/auth';
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  reload,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from '@firebase/auth';
import { BehaviorSubject } from 'rxjs';
import { auth } from '../firebase';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private user$ = new BehaviorSubject<User | null | undefined>(undefined);

  constructor() {
    Injectable;
    // Ascolta i cambiamenti di stato
    onAuthStateChanged(auth, (user) => {
      this.user$.next(user);
    });
  }

  get currentUser$() {
    return this.user$.asObservable();
  }

  signOut() {
    return signOut(auth);
  }

  async userReload() {
    if (this.user$.getValue()) {
      await reload(this.user$.getValue()!);
    }
  }

  isAuthenticated(): boolean {
    return (
      this.user$.getValue() !== null && this.user$.getValue() !== undefined
    );
  }

  async resetPassword(email: string) {
    await sendPasswordResetEmail(auth, email);
  }

  async registerUser(email: string, password: string) {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    // Utente creato con successo
    console.log('Registrazione riuscita:', userCredential.user);
    await sendEmailVerification(userCredential.user);
    return userCredential;
  }

  async sendEmailVerification(user?: User | null) {
    user ??= this.user$.value;
    if (!user) {
      return false;
    }
    if (user.emailVerified) {
      console.log(`L'utente ${user.email} è già verificato.`);
      return false;
    }
    console.log('Sending authentication mail to: ', user.email);
    await sendEmailVerification(user);
    return true;
  }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  loginWithGoogle() {
    const handleSignIn = () => {
      cfaSignIn('google.com').subscribe((user: User) =>
        console.log(user.displayName)
      );
    };
    const auth = getAuth();
    signInWithPopup(auth, new GoogleAuthProvider())
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential?.accessToken;
        // The signed-in user info.
        return result;
        // IdP data available using getAdditionalUserInfo(result)
        // ...
      })
      .catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        // ...
      });
  }

  logout() {
    return signOut(auth);
  }
}
