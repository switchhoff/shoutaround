import { useEffect, useState } from 'react';
import { doc, onSnapshot, collection, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { currentUser } from '../lib/auth';

export interface TabMember {
  userId: string;
  displayName: string;
  avatarEmoji: string;
}

export interface Tab {
  id: string;
  name: string;
  createdBy: string;
  members: TabMember[];
  rotationOrder: string[];
  currentIndex: number;
  createdAt: Date;
  memberCount: number;
}

export function useTab(tabId: string) {
  const [tab, setTab] = useState<Tab | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ref = doc(db, 'tabs', tabId);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setTab({
          id: snap.id,
          name: d.name,
          createdBy: d.createdBy,
          members: d.members,
          rotationOrder: d.rotationOrder,
          currentIndex: d.currentIndex,
          createdAt: d.createdAt?.toDate(),
          memberCount: d.memberCount,
        });
      }
      setLoading(false);
    });
    return unsub;
  }, [tabId]);

  return { tab, loading };
}

export function useUserTabs() {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = currentUser();
    if (!user) return;

    // Firestore: tabs where members array contains this userId
    const q = query(
      collection(db, 'tabs'),
      where('rotationOrder', 'array-contains', user.uid)
    );
    const unsub = onSnapshot(q, (snap) => {
      setTabs(
        snap.docs.map((d) => ({
          id: d.id,
          name: d.data().name,
          createdBy: d.data().createdBy,
          members: d.data().members,
          rotationOrder: d.data().rotationOrder,
          currentIndex: d.data().currentIndex,
          createdAt: d.data().createdAt?.toDate(),
          memberCount: d.data().memberCount,
        }))
      );
      setLoading(false);
    });
    return unsub;
  }, []);

  return { tabs, loading };
}
