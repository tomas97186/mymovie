import { inject, Injectable } from "@angular/core";
import { addDoc, collection, deleteDoc, doc, docData, Firestore, updateDoc } from "@angular/fire/firestore";

@Injectable({
    providedIn: 'root',
})
export class DatabaseService {
    private firestore = inject(Firestore);

    get(path: string, idField: string = 'id') {
        return docData(doc(this.firestore, path), { idField });
    }

    getList(path: string, idField: string = 'id') {
        return collection(this.firestore, path);
    }

    add(path: string, data: any) {
        const collectionRef = collection(this.firestore, path);
        return addDoc(collectionRef, data);
    }

    update(path: string, data: any) {
        const docRef = doc(this.firestore, path);
        return updateDoc(docRef, data, { merge: true });
    }

    delete(path: string) {
        const docRef = doc(this.firestore, path);
        return deleteDoc(docRef);
    }
}