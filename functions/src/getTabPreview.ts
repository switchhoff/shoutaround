import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { validateTabId } from './_validate';

// Returns public tab info for the join screen — readable by any auth'd user.
export const getTabPreview = onCall({}, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in required');

  const tabId = validateTabId(request.data.tabId);
  const db = admin.firestore();

  const snap = await db.collection('tabs').doc(tabId).get();
  if (!snap.exists) throw new HttpsError('not-found', 'Tab not found');

  const data = snap.data()!;
  return {
    name: data.name as string,
    memberCount: data.memberCount as number,
    members: (data.members as any[]).map((m) => ({
      displayName: m.displayName,
      avatarEmoji: m.avatarEmoji,
    })),
  };
});
