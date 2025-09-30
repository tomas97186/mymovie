import { initializeApp } from "@angular/fire/app";
import { environment } from "../environments/environment";
import { getAuth } from "@angular/fire/auth";
import { LogLevel, setLogLevel } from '@angular/fire';
import { getFirestore } from "@angular/fire/firestore";

setLogLevel(LogLevel.SILENT);
// Inizializza Firebase
const app = initializeApp(environment.firebaseConfig);

// Ottieni il servizio Auth
const auth = getAuth(app);
const database = getFirestore(app);

export { auth, database };