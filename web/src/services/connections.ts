import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Connection } from '../types';

const COLLECTION = 'connections';

export const subscribeToConnections = (
  userId: string,
  onData: (connections: Connection[]) => void
): Unsubscribe => {
  const q = query(collection(db, COLLECTION), where('userId', '==', userId));
  return onSnapshot(q, (snap) => {
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Connection));
    onData(data.sort((a, b) => a.createdAt - b.createdAt));
  });
};

export const createConnection = async (userId: string, name: string): Promise<void> => {
  await addDoc(collection(db, COLLECTION), {
    userId,
    name,
    createdAt: Date.now(),
  });
};

export const updateConnection = async (id: string, name: string): Promise<void> => {
  await updateDoc(doc(db, COLLECTION, id), { name });
};

export const deleteConnection = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, COLLECTION, id));
};
