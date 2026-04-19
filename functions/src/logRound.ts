import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { validateTabId, validateNote } from './_validate';
import { readRateLimit, writeRateLimit } from './_rateLimit';

export const logRound = onCall({}, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in required');

  const uid = request.auth.uid;
  const db = admin.firestore();
  const data = request.data;
  const tabId = validateTabId(data.tabId);
  const note = validateNote(data.note);

  const tabRef = db.collection('tabs').doc(tabId);
  const roundRef = tabRef.collection('rounds').doc();

  await db.runTransaction(async (t) => {
    // ── All reads first ──────────────────────────────────────────────────────
    const { ref: rlRef, state: rlState } = await readRateLimit(t, db, uid, 'logRound');

    const tabSnap = await t.get(tabRef);
    if (!tabSnap.exists) throw new HttpsError('not-found', 'Tab not found');

    const tab = tabSnap.data()!;
    const rotationOrder: string[] = tab.rotationOrder;

    if (!rotationOrder.includes(uid)) {
      throw new HttpsError('permission-denied', 'Not a member of this tab');
    }

    const currentBuyer = rotationOrder[tab.currentIndex % rotationOrder.length];
    if (currentBuyer !== uid) {
      throw new HttpsError('permission-denied', "Not your shout yet");
    }

    const userSnap = await t.get(db.collection('users').doc(uid));
    const buyerName = userSnap.exists ? (userSnap.data()!.displayName ?? 'Unknown') : 'Unknown';

    // ── All writes after ─────────────────────────────────────────────────────
    writeRateLimit(t, rlRef, 'logRound', rlState);

    const roundData: Record<string, unknown> = {
      buyerId: uid,
      buyerName,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    };
    if (note) roundData.note = note;
    if (data.location) {
      const loc = data.location;
      if (typeof loc.lat === 'number' && typeof loc.lng === 'number') {
        roundData.location = {
          lat: loc.lat,
          lng: loc.lng,
          ...(typeof loc.placeName === 'string' ? { placeName: loc.placeName.slice(0, 100) } : {}),
        };
      }
    }

    t.set(roundRef, roundData);
    t.update(tabRef, {
      currentIndex: (tab.currentIndex + 1) % rotationOrder.length,
    });
  });

  return { roundId: roundRef.id };
});
