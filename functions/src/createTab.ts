import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { validateTabName } from './_validate';
import { readRateLimit, writeRateLimit } from './_rateLimit';
import { FREE_TIER_MEMBER_LIMIT } from './_constants';

interface Member {
  userId: string;
  displayName: string;
  avatarEmoji: string;
}

export const createTab = onCall({}, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in required');

  const uid = request.auth.uid;
  const db = admin.firestore();
  const data = request.data;

  const name = validateTabName(data.name);
  const members: Member[] = data.members;
  const rotationOrder: string[] = data.rotationOrder;

  if (!Array.isArray(members) || members.length < 1) {
    throw new HttpsError('invalid-argument', 'At least 1 member required');
  }
  if (!Array.isArray(rotationOrder) || rotationOrder.length !== members.length) {
    throw new HttpsError('invalid-argument', 'rotationOrder must match members');
  }

  const userSnap = await db.collection('users').doc(uid).get();
  const isPro = userSnap.exists ? (userSnap.data()!.isPro ?? false) : false;

  if (!isPro && members.length > FREE_TIER_MEMBER_LIMIT) {
    throw new HttpsError('permission-denied', `Free tier limited to ${FREE_TIER_MEMBER_LIMIT} members`);
  }

  const tabRef = db.collection('tabs').doc();

  await db.runTransaction(async (t) => {
    // ── All reads first ──────────────────────────────────────────────────────
    const { ref: rlRef, state: rlState } = await readRateLimit(t, db, uid, 'createTab');

    // ── All writes after ─────────────────────────────────────────────────────
    writeRateLimit(t, rlRef, 'createTab', rlState);
    t.set(tabRef, {
      name,
      createdBy: uid,
      members,
      rotationOrder,
      currentIndex: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      memberCount: members.length,
    });
  });

  return { tabId: tabRef.id };
});
