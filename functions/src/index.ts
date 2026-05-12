import * as admin from 'firebase-admin';
import { onSchedule } from 'firebase-functions/v2/scheduler';

admin.initializeApp();

const db = admin.firestore();

/**
 * Scheduled function that runs every minute to dispatch scheduled messages.
 * Updates messages whose scheduledAt timestamp has passed and status is 'scheduled'.
 */
export const dispatchScheduledMessages = onSchedule(
  { schedule: 'every 1 minutes', timeZone: 'America/Sao_Paulo' },
  async () => {
    const now = Date.now();

    const snapshot = await db
      .collection('messages')
      .where('status', '==', 'scheduled')
      .where('scheduledAt', '<=', now)
      .get();

    if (snapshot.empty) return;

    const batch = db.batch();

    snapshot.docs.forEach((doc) => {
      batch.update(doc.ref, {
        status: 'sent',
        sentAt: now,
      });
    });

    await batch.commit();

    console.log(`Dispatched ${snapshot.size} scheduled message(s).`);
  }
);
