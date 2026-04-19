import { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface Round {
  id: string;
  buyerId: string;
  buyerName: string;
  timestamp: Date;
  location?: { lat: number; lng: number; placeName?: string };
  note?: string;
}

export function useRounds(tabId: string, isPro: boolean) {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const col = collection(db, 'tabs', tabId, 'rounds');
    // Free: last 20. Pro: last 100 (full history loaded in pages via Function).
    const q = query(col, orderBy('timestamp', 'desc'), limit(isPro ? 100 : 20));
    const unsub = onSnapshot(q, (snap) => {
      setRounds(
        snap.docs.map((d) => ({
          id: d.id,
          buyerId: d.data().buyerId,
          buyerName: d.data().buyerName,
          timestamp: d.data().timestamp?.toDate(),
          location: d.data().location,
          note: d.data().note,
        }))
      );
      setLoading(false);
    });
    return unsub;
  }, [tabId, isPro]);

  return { rounds, loading };
}
