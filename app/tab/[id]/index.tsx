import { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert,
  ActivityIndicator, Animated, ScrollView, Share, Platform,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { httpsCallable } from 'firebase/functions';
import * as Location from 'expo-location';
import { functions } from '../../../lib/firebase';
import { useAuth } from '../../../hooks/useAuth';
import { useTab } from '../../../hooks/useTab';
import { useRounds } from '../../../hooks/useRounds';
import { RoundButton } from '../../../components/RoundButton';
import { colors, spacing, font, radius } from '../../../constants/theme';

export default function TabScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, profile } = useAuth();
  const { tab, loading } = useTab(id);
  const { rounds } = useRounds(id, profile?.isPro ?? false);
  const [logging, setLogging] = useState(false);

  // Celebration state
  const [celebName, setCelebName] = useState<string | null>(null);
  const celebOpacity = useRef(new Animated.Value(0)).current;
  const celebScale = useRef(new Animated.Value(0.5)).current;
  const prevRoundCount = useRef<number | null>(null);

  // Detect new round added (by anyone) → show celebration
  useEffect(() => {
    if (rounds.length === 0) { prevRoundCount.current = 0; return; }
    if (prevRoundCount.current === null) { prevRoundCount.current = rounds.length; return; }
    if (rounds.length > prevRoundCount.current) {
      const newest = rounds[0];
      setCelebName(newest.buyerName);
      Animated.parallel([
        Animated.spring(celebScale, { toValue: 1, useNativeDriver: false, bounciness: 15 }),
        Animated.timing(celebOpacity, { toValue: 1, duration: 200, useNativeDriver: false }),
      ]).start(() => {
        // Hold for 2.5s then fade out
        setTimeout(() => {
          Animated.timing(celebOpacity, { toValue: 0, duration: 500, useNativeDriver: false }).start(() => {
            celebScale.setValue(0.5);
            setCelebName(null);
          });
        }, 2500);
      });
    }
    prevRoundCount.current = rounds.length;
  }, [rounds.length]);

  if (loading || !tab || !user) {
    return <View style={s.center}><ActivityIndicator color={colors.accent} /></View>;
  }

  const currentBuyerId = tab.rotationOrder[tab.currentIndex % tab.rotationOrder.length];
  const currentBuyer = tab.members.find((m) => m.userId === currentBuyerId);
  const isMyShout = currentBuyerId === user.uid;

  const nextIndex = (tab.currentIndex + 1) % tab.rotationOrder.length;
  const nextBuyerId = tab.rotationOrder[nextIndex];
  const nextBuyer = tab.members.find((m) => m.userId === nextBuyerId);

  async function shareInvite() {
    const link = `https://shout-round.web.app/join?tab=${id}`;
    await Share.share({ message: `Join my tab on Shout 🍺\n${link}` });
  }

  async function logRound() {
    if (logging) return;
    setLogging(true);
    try {
      let location: { lat: number; lng: number } | undefined;
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      }
      await httpsCallable(functions, 'logRound')({ tabId: id, ...(location ? { location } : {}) });
    } catch (e: any) {
      const msg: string = e.message ?? '';
      if (msg.includes('RATE_LIMITED')) {
        Alert.alert('Steady on', "You can't buy that many rounds that fast.");
      } else if (msg.includes('Not your shout')) {
        Alert.alert('Hold on', "It's not your shout yet.");
      } else {
        Alert.alert('Error', msg || 'Something went wrong');
      }
    } finally {
      setLogging(false);
    }
  }

  function timeAgo(date: Date): string {
    const mins = Math.floor((Date.now() - date.getTime()) / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  return (
    <View style={s.container}>
      <Stack.Screen
        options={{
          title: tab.name,
          headerRight: () => (
            <TouchableOpacity onPress={shareInvite} style={s.inviteBtn}>
              <Text style={s.inviteBtnText}>Invite</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Whose shout ──────────────────────────────────────────── */}
        <View style={[s.shoutCard, isMyShout && s.shoutCardMe]}>
          <Text style={s.shoutEmoji}>{currentBuyer?.avatarEmoji ?? '🍺'}</Text>
          <Text style={[s.shoutLabel, isMyShout && s.shoutLabelMe]}>
            {isMyShout ? 'YOUR SHOUT' : `${currentBuyer?.displayName ?? 'Someone'}'s shout`}
          </Text>
          {isMyShout && (
            <Text style={s.shoutSub}>Don't be shy. Get 'em in.</Text>
          )}
        </View>

        {/* ── Round button ─────────────────────────────────────────── */}
        <View style={s.btnArea}>
          <RoundButton onPress={logRound} disabled={!isMyShout || logging} />
          {logging && <ActivityIndicator color={colors.accent} style={{ marginTop: spacing.lg }} />}
        </View>

        {/* ── Next up ──────────────────────────────────────────────── */}
        {nextBuyer && nextBuyer.userId !== currentBuyerId && (
          <View style={s.nextCard}>
            <Text style={s.nextLabel}>NEXT UP</Text>
            <View style={s.nextRow}>
              <Text style={s.nextEmoji}>{nextBuyer.avatarEmoji}</Text>
              <Text style={s.nextName}>{nextBuyer.displayName}</Text>
            </View>
          </View>
        )}

        {/* ── Rotation order ───────────────────────────────────────── */}
        <View style={s.rotationCard}>
          <Text style={s.sectionLabel}>ROTATION</Text>
          {tab.rotationOrder.map((uid, i) => {
            const member = tab.members.find((m) => m.userId === uid);
            if (!member) return null;
            const isCurrent = i === tab.currentIndex % tab.rotationOrder.length;
            return (
              <View key={uid} style={[s.rotRow, isCurrent && s.rotRowActive]}>
                <Text style={s.rotEmoji}>{member.avatarEmoji}</Text>
                <Text style={[s.rotName, isCurrent && s.rotNameActive]}>{member.displayName}</Text>
                {isCurrent && <Text style={s.rotBadge}>NOW</Text>}
              </View>
            );
          })}
        </View>

        {/* ── Recent rounds ────────────────────────────────────────── */}
        <View style={s.historyCard}>
          <View style={s.historyHeader}>
            <Text style={s.sectionLabel}>RECENT ROUNDS</Text>
            <TouchableOpacity onPress={() => router.push(`/tab/${id}/history`)}>
              <Text style={s.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          {rounds.length === 0 ? (
            <Text style={s.emptyText}>No rounds yet. Someone's slacking.</Text>
          ) : (
            rounds.slice(0, 5).map((r, i) => (
              <View key={r.id} style={s.roundRow}>
                <View style={s.roundIndex}>
                  <Text style={s.roundIndexText}>#{rounds.length - i}</Text>
                </View>
                <Text style={s.roundBuyer}>{r.buyerName}</Text>
                <Text style={s.roundTime}>{r.timestamp ? timeAgo(r.timestamp) : '—'}</Text>
              </View>
            ))
          )}
        </View>

      </ScrollView>

      {/* ── Celebration overlay ──────────────────────────────────── */}
      {celebName !== null && (
        <Animated.View
          style={[s.celebOverlay, { opacity: celebOpacity }]}
          pointerEvents="none"
        >
          <Animated.View style={[s.celebCard, { transform: [{ scale: celebScale }] }]}>
            <Text style={s.celebEmoji}>🍺</Text>
            <Text style={s.celebTitle}>Cheers, legend!</Text>
            <Text style={s.celebName}>{celebName} bought the round</Text>
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  inviteBtn: { marginRight: spacing.sm },
  inviteBtnText: { color: colors.accent, fontSize: font.size.sm },

  // Shout card
  shoutCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  shoutCardMe: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.accent,
  },
  shoutEmoji: { fontSize: 64, marginBottom: spacing.sm },
  shoutLabel: {
    fontSize: font.size.xl,
    fontWeight: font.weight.black,
    color: colors.textMuted,
    textAlign: 'center',
  },
  shoutLabelMe: { color: colors.accent, fontSize: font.size.xxl },
  shoutSub: { fontSize: font.size.md, color: colors.textMuted, marginTop: spacing.xs },

  // Button area
  btnArea: { alignItems: 'center', marginBottom: spacing.xl },

  // Next up
  nextCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  nextLabel: { fontSize: font.size.xs, color: colors.textMuted, letterSpacing: 1, marginBottom: spacing.sm },
  nextRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  nextEmoji: { fontSize: 32 },
  nextName: { fontSize: font.size.xl, fontWeight: font.weight.bold, color: colors.text },

  // Rotation
  rotationCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionLabel: { fontSize: font.size.xs, color: colors.textMuted, letterSpacing: 1, marginBottom: spacing.md },
  rotRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: spacing.sm, paddingVertical: spacing.xs,
  },
  rotRowActive: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    marginHorizontal: -spacing.sm,
  },
  rotEmoji: { fontSize: 22, width: 30 },
  rotName: { flex: 1, fontSize: font.size.md, color: colors.textMuted },
  rotNameActive: { color: colors.text, fontWeight: font.weight.bold },
  rotBadge: {
    fontSize: font.size.xs, color: colors.background,
    backgroundColor: colors.accent, borderRadius: radius.full,
    paddingHorizontal: spacing.sm, paddingVertical: 2,
    fontWeight: font.weight.bold,
  },

  // History
  historyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  seeAll: { fontSize: font.size.sm, color: colors.accent },
  emptyText: { fontSize: font.size.sm, color: colors.textMuted },
  roundRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xs },
  roundIndex: {
    backgroundColor: colors.surfaceAlt, borderRadius: radius.sm,
    paddingHorizontal: spacing.sm, paddingVertical: 2, minWidth: 36, alignItems: 'center',
  },
  roundIndexText: { fontSize: font.size.xs, color: colors.textMuted },
  roundBuyer: { flex: 1, fontSize: font.size.md, color: colors.text },
  roundTime: { fontSize: font.size.xs, color: colors.textMuted },

  // Celebration
  celebOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(28,15,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  celebCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xxl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.accent,
    marginHorizontal: spacing.xl,
  },
  celebEmoji: { fontSize: 72, marginBottom: spacing.md },
  celebTitle: { fontSize: font.size.xxl, fontWeight: font.weight.black, color: colors.accent, marginBottom: spacing.sm },
  celebName: { fontSize: font.size.lg, color: colors.text, textAlign: 'center' },
});
