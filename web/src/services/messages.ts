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
import type { Message, MessageStatus } from '../types';

const COLLECTION = 'messages';

export const subscribeToMessages = (
  userId: string,
  connectionId: string,
  onData: (messages: Message[]) => void
): Unsubscribe => {
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    where('connectionId', '==', connectionId)
  );
  return onSnapshot(q, (snap) => {
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Message));
    onData(data.sort((a, b) => b.createdAt - a.createdAt));
  });
};

export const createMessage = async (
  userId: string,
  connectionId: string,
  contactIds: string[],
  content: string,
  scheduledAt: number
): Promise<void> => {
  const now = Date.now();
  const isImmediate = scheduledAt <= now;
  await addDoc(collection(db, COLLECTION), {
    userId,
    connectionId,
    contactIds,
    content,
    status: isImmediate ? 'sent' : 'scheduled',
    scheduledAt,
    sentAt: isImmediate ? now : null,
    createdAt: now,
  });
};

export const updateMessage = async (
  id: string,
  contactIds: string[],
  content: string,
  scheduledAt: number
): Promise<void> => {
  const now = Date.now();
  const isImmediate = scheduledAt <= now;
  await updateDoc(doc(db, COLLECTION, id), {
    contactIds,
    content,
    scheduledAt,
    status: isImmediate ? 'sent' : 'scheduled',
    sentAt: isImmediate ? now : null,
  });
};

export const deleteMessage = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, COLLECTION, id));
};
