import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { validateDisplayName, validateAvatarEmoji } from './_validate';

export const updateProfile = onCall({}, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in required');

  const displayName = validateDisplayName(request.data.displayName);
  const avatarEmoji = validateAvatarEmoji(request.data.avatarEmoji);
  const uid = request.auth.uid;
  const db = admin.firestore();

  await db.collection('users').doc(uid).set(
    {
      displayName,
      avatarEmoji,
      lastSeen: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  return { ok: true };
});
