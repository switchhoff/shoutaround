import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { validateTabId } from './_validate';
import { readRateLimit, writeRateLimit } from './_rateLimit';
import { FREE_TIER_MEMBER_LIMIT } from './_constants';

export const joinTab = onCall({}, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in required');

  const uid = request.auth.uid;
  const db = admin.firestore();
  const tabId = validateTabId(request.data.tabId);

  const tabRef = db.collection('tabs').doc(tabId);
  const userRef = db.collection('users').doc(uid);

  await db.runTransaction(async (t) => {
    // ── All reads first ──────────────────────────────────────────────────────
    const { ref: rlRef, state: rlState } = await readRateLimit(t, db, uid, 'joinTab');
    const [tabSnap, userSnap] = await Promise.all([t.get(tabRef), t.get(userRef)]);

    if (!tabSnap.exists) throw new HttpsError('not-found', 'Tab not found');

    const tab = tabSnap.data()!;
    const user = userSnap.data();

    if ((tab.rotationOrder as string[]).includes(uid)) {
      throw new HttpsError('already-exists', 'Already in this tab');
    }

    const tabOwnerSnap = await t.get(db.collection('users').doc(tab.createdBy));
    const ownerIsPro = tabOwnerSnap.exists ? (tabOwnerSnap.data()!.isPro ?? false) : false;

    if (!ownerIsPro && tab.memberCount >= FREE_TIER_MEMBER_LIMIT) {
      throw new HttpsError('resource-exhausted', 'Tab is full (free tier limit)');
    }

    const newMember = {
      userId: uid,
      displayName: user?.displayName ?? 'Unknown',
      avatarEmoji: user?.avatarEmoji ?? '🍺',
    };

    // ── All writes after ─────────────────────────────────────────────────────
    writeRateLimit(t, rlRef, 'joinTab', rlState);
    t.update(tabRef, {
      members: admin.firestore.FieldValue.arrayUnion(newMember),
      rotationOrder: admin.firestore.FieldValue.arrayUnion(uid),
      memberCount: admin.firestore.FieldValue.increment(1),
    });
  });

  return { ok: true };
});
