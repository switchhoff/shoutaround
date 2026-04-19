import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { validateTabId } from './_validate';
import { readRateLimit, writeRateLimit } from './_rateLimit';

export const exportTab = onCall({}, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in required');

  const uid = request.auth.uid;
  const db = admin.firestore();
  const tabId = validateTabId(request.data.tabId);
  const format: string = request.data.format === 'csv' ? 'csv' : 'json';

  const userSnap = await db.collection('users').doc(uid).get();
  if (!userSnap.exists || !userSnap.data()!.isPro) {
    throw new HttpsError('permission-denied', 'Pro required for export');
  }

  const tabSnap = await db.collection('tabs').doc(tabId).get();
  if (!tabSnap.exists) throw new HttpsError('not-found', 'Tab not found');
  const tab = tabSnap.data()!;
  if (!(tab.rotationOrder as string[]).includes(uid)) {
    throw new HttpsError('permission-denied', 'Not a member');
  }

  await db.runTransaction(async (t) => {
    const { ref: rlRef, state: rlState } = await readRateLimit(t, db, uid, 'export');
    writeRateLimit(t, rlRef, 'export', rlState);
  });

  const roundsSnap = await db
    .collection('tabs').doc(tabId).collection('rounds')
    .orderBy('timestamp', 'asc').get();

  const rounds = roundsSnap.docs.map((d) => ({
    id: d.id,
    buyerId: d.data().buyerId,
    buyerName: d.data().buyerName,
    timestamp: d.data().timestamp?.toDate().toISOString() ?? null,
    note: d.data().note ?? null,
    location: d.data().location ?? null,
  }));

  return { format, tabName: tab.name, rounds };
});
