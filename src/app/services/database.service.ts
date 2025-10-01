import { inject, Injectable } from '@angular/core';
import { set } from '@angular/fire/database';
import {
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  docData,
  DocumentData,
  DocumentReference,
  Firestore,
  setDoc,
  updateDoc,
  writeBatch,
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  private firestore = inject(Firestore);

  get(path: string, idField: string = 'id') {
    return docData(doc(this.firestore, path), { idField });
  }

  getList(path: string, idField: string = 'id') {
    return collectionData(collection(this.firestore, path), { idField });
  }

  getDoc(path: string) {
    return doc(this.firestore, path);
  }

  add(path: string, data: any, id?: string) {
    if (!id) {
      const collectionRef = collection(this.firestore, path);
      return addDoc(collectionRef, data);
    } else {
      const collectionRef = doc(this.firestore, path, id);
      return setDoc(collectionRef, data);
    }
  }

  set(path: string, data: any) {
    const collectionRef = doc(this.firestore, path);
    return setDoc(collectionRef, data);
  }

  setDoc(doc: DocumentReference<DocumentData, DocumentData>, value: any) {
    return setDoc(doc, value);
  }

  setMultiple(updates: UpdateModel[]) {
    const batch = writeBatch(this.firestore);

    updates.forEach((u) => {
      u.type ??= 'set';
      switch (u.type) {
        case 'update':
          batch.update(doc(this.firestore, u.path), u.value);
          break;
        case 'delete':
          batch.delete(doc(this.firestore, u.path));
          break;
        case 'set':
          batch.set(doc(this.firestore, u.path), u.value);
          break;
      }
    });

    return batch.commit();
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

export interface UpdateModel {
  path: string;
  type?: 'update' | 'set' | 'delete';
  value?: any;
}
