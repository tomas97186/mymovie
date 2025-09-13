import { initializeApp } from "@angular/fire/app";
import { environment } from "../environments/environment";
import { getAuth } from "@angular/fire/auth";
import { getDatabase } from "@angular/fire/database";
import { LogLevel, setLogLevel } from '@angular/fire';

setLogLevel(LogLevel.SILENT);
// Inizializza Firebase
const app = initializeApp(environment.firebaseConfig);

// Ottieni il servizio Auth
const auth = getAuth(app);
const database = getDatabase(app);

export { auth, database };