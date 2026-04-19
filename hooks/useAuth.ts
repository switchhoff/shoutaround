import { useEffect, useState } from 'react';
import { type User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { onAuthChange, signInAnon } from '../lib/auth';
import { db } from '../lib/firebase';

export interface UserProfile {
  displayName: string;
  avatarEmoji: string;
  isPro: boolean;
  proExpiry?: Date;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthChange(async (firebaseUser) => {
      if (!firebaseUser) {
        try {
          await signInAnon();
        } catch {
          setAuthLoading(false);
          setProfileLoading(false);
        }
        return;
      }
      setUser(firebaseUser);
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!user) return;
    setProfileLoading(true);
    const ref = doc(db, 'users', user.uid);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setProfile({
          displayName: data.displayName,
          avatarEmoji: data.avatarEmoji,
          isPro: data.isPro ?? false,
          proExpiry: data.proExpiry?.toDate(),
        });
      } else {
        setProfile(null);
      }
      setProfileLoading(false);
    });
    return unsub;
  }, [user]);

  // loading = true until both auth AND profile state are known
  const loading = authLoading || profileLoading;

  return { user, profile, loading, hasProfile: !!profile?.displayName };
}
