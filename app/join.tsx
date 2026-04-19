import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { colors, spacing, font, radius } from '../constants/theme';

interface TabPreview {
  name: string;
  memberCount: number;
  members: { displayName: string; avatarEmoji: string }[];
}

export default function JoinScreen() {
  const { tab: tabId } = useLocalSearchParams<{ tab: string }>();
  const { user, profile, loading: authLoading } = useAuth();
  const [preview, setPreview] = useState<TabPreview | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(true);
  const [joining, setJoining] = useState(false);

  // Redirect to onboarding if no profile yet
  useEffect(() => {
    if (authLoading) return;
    if (!user || !profile?.displayName) {
      router.replace('/onboarding');
    }
  }, [user, profile, authLoading]);

  useEffect(() => {
    if (!tabId || authLoading || !user) return;
    const fn = httpsCallable(functions, 'getTabPreview');
    fn({ tabId })
      .then((r) => setPreview(r.data as TabPreview))
      .catch(() => setPreview(null))
      .finally(() => setLoadingPreview(false));
  }, [tabId, authLoading, user]);

  async function join() {
    if (!tabId) return;
    setJoining(true);
    try {
      await httpsCallable(functions, 'joinTab')({ tabId });
      router.replace(`/tab/${tabId}`);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not join tab');
      setJoining(false);
    }
  }

  if (authLoading || loadingPreview) {
    return <View style={s.center}><ActivityIndicator color={colors.accent} /></View>;
  }

  if (!tabId || !preview) {
    return (
      <View style={s.center}>
        <Text style={s.err}>Invalid invite link.</Text>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <Text style={s.invite}>You've been invited to</Text>
      <Text style={s.tabName}>{preview.name}</Text>

      <View style={s.membersRow}>
        {preview.members.map((m, i) => (
          <View key={i} style={s.memberChip}>
            <Text style={s.memberEmoji}>{m.avatarEmoji}</Text>
            <Text style={s.memberName}>{m.displayName}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={s.btn} onPress={join} disabled={joining}>
        {joining
          ? <ActivityIndicator color={colors.background} />
          : <Text style={s.btnText}>Join this tab 🍺</Text>}
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: colors.background,
    alignItems: 'center', justifyContent: 'center', padding: spacing.xl,
  },
  center: {
    flex: 1, backgroundColor: colors.background,
    alignItems: 'center', justifyContent: 'center',
  },
  invite: { fontSize: font.size.md, color: colors.textMuted, marginBottom: spacing.sm },
  tabName: {
    fontSize: font.size.xxl, fontWeight: font.weight.black,
    color: colors.text, textAlign: 'center', marginBottom: spacing.xl,
  },
  membersRow: {
    flexDirection: 'row', flexWrap: 'wrap',
    justifyContent: 'center', gap: spacing.sm, marginBottom: spacing.xxl,
  },
  memberChip: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    backgroundColor: colors.surface, borderRadius: radius.full,
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
  },
  memberEmoji: { fontSize: 18 },
  memberName: { fontSize: font.size.sm, color: colors.text },
  btn: {
    backgroundColor: colors.accent, borderRadius: radius.full,
    paddingHorizontal: spacing.xxl, paddingVertical: spacing.md,
  },
  btnText: { color: colors.background, fontSize: font.size.lg, fontWeight: font.weight.bold },
  err: { color: colors.textMuted, fontSize: font.size.md },
});
