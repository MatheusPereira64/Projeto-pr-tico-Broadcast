import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Contact } from '../types';

const COLLECTION = 'contacts';

export const subscribeToContacts = (
  userId: string,
  connectionId: string,
  onData: (contacts: Contact[]) => void
): Unsubscribe => {
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    where('connectionId', '==', connectionId)
  );
  return onSnapshot(q, (snap) => {
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Contact));
    onData(data.sort((a, b) => a.createdAt - b.createdAt));
  });
};

export const createContact = async (
  userId: string,
  connectionId: string,
  name: string,
  phone: string
): Promise<void> => {
  await addDoc(collection(db, COLLECTION), {
    userId,
    connectionId,
    name,
    phone,
    createdAt: Date.now(),
  });
};

export const updateContact = async (
  id: string,
  name: string,
  phone: string
): Promise<void> => {
  await updateDoc(doc(db, COLLECTION, id), { name, phone });
};

export const deleteContact = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, COLLECTION, id));
};
