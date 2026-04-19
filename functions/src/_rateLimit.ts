import * as admin from 'firebase-admin';
import { RATE_LIMITS, type RateLimitAction } from './_constants';

interface BucketState {
  count: number;
  windowStart: number; // ms
}

/**
 * READ phase — call inside transaction before any writes.
 * Returns new bucket state to apply, or throws if rate limit exceeded.
 */
export async function readRateLimit(
  t: admin.firestore.Transaction,
  db: admin.firestore.Firestore,
  userId: string,
  action: RateLimitAction
): Promise<{ ref: admin.firestore.DocumentReference; state: BucketState }> {
  const { max, windowMs } = RATE_LIMITS[action];
  const ref = db.collection('rateLimits').doc(userId);
  const snap = await t.get(ref);
  const now = Date.now();

  const existing = snap.exists ? snap.data()![action] : null;

  let count = 1;
  let windowStart = now;

  if (existing) {
    const elapsed = now - existing.windowStart.toMillis();
    if (elapsed < windowMs) {
      count = existing.count + 1;
      windowStart = existing.windowStart.toMillis();
      if (count > max) {
        throw new Error(`RATE_LIMITED:${action}`);
      }
    }
    // else window expired — reset (defaults above apply)
  }

  return { ref, state: { count, windowStart } };
}

/**
 * WRITE phase — call inside transaction after all reads are done.
 */
export function writeRateLimit(
  t: admin.firestore.Transaction,
  ref: admin.firestore.DocumentReference,
  action: RateLimitAction,
  state: BucketState
): void {
  t.set(
    ref,
    {
      [action]: {
        count: state.count,
        windowStart: admin.firestore.Timestamp.fromMillis(state.windowStart),
      },
    },
    { merge: true }
  );
}
