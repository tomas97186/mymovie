import { Injectable } from '@angular/core';
import { Auth, User } from '@angular/fire/auth';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from '@firebase/auth';
import { BehaviorSubject } from 'rxjs';
import { auth } from '../firebase';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private user$ = new BehaviorSubject<User | null | undefined>(undefined);

  constructor() {
    Injectable
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

  isAuthenticated(): boolean {
    return this.user$.getValue() !== null && this.user$.getValue() !== undefined;
  }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  logout() {
    return signOut(auth);
  }
}
