import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { useAuth } from '../../../hooks/useAuth';
import { useTab } from '../../../hooks/useTab';
import { useRounds } from '../../../hooks/useRounds';
import { colors, spacing, font, radius } from '../../../constants/theme';

export default function StatsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();
  const { tab, loading: tabLoading } = useTab(id);
  const { rounds, loading: roundsLoading } = useRounds(id, true);

  // Pro gate
  if (!profile?.isPro) {
    return (
      <View style={s.center}>
        <Text style={s.proGateEmoji}>⭐</Text>
        <Text style={s.proGateTitle}>Pro feature</Text>
        <Text style={s.proGateSub}>Upgrade to Pro to see stats.</Text>
      </View>
    );
  }

  if (tabLoading || roundsLoading || !tab) {
    return <View style={s.center}><ActivityIndicator color={colors.accent} /></View>;
  }

  // Compute per-member stats
  const countByMember: Record<string, number> = {};
  for (const r of rounds) {
    countByMember[r.buyerId] = (countByMember[r.buyerId] ?? 0) + 1;
  }

  const fairShare = rounds.length / tab.members.length;

  // Venue stats — most frequent location
  const venueCounts: Record<string, number> = {};
  for (const r of rounds) {
    if (r.location?.placeName) {
      venueCounts[r.location.placeName] = (venueCounts[r.location.placeName] ?? 0) + 1;
    }
  }
  const topVenue = Object.entries(venueCounts).sort((a, b) => b[1] - a[1])[0];

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <Stack.Screen options={{ title: 'Stats' }} />

      <Text style={s.sectionTitle}>Rounds bought</Text>
      {tab.members.map((m) => {
        const bought = countByMember[m.userId] ?? 0;
        const debt = fairShare - bought;
        return (
          <View key={m.userId} style={s.row}>
            <Text style={s.memberEmoji}>{m.avatarEmoji}</Text>
            <View style={s.rowInfo}>
              <Text style={s.memberName}>{m.displayName}</Text>
              <View style={s.barBg}>
                <View
                  style={[
                    s.bar,
                    { width: `${Math.min(100, rounds.length ? (bought / rounds.length) * 100 : 0)}%` },
                  ]}
                />
              </View>
            </View>
            <View style={s.countCol}>
              <Text style={s.count}>{bought}</Text>
              {debt > 0.5 && (
                <Text style={s.debt}>owes {Math.round(debt)}</Text>
              )}
            </View>
          </View>
        );
      })}

      <Text style={[s.sectionTitle, { marginTop: spacing.xl }]}>Total rounds</Text>
      <Text style={s.bigStat}>{rounds.length}</Text>

      {topVenue && (
        <>
          <Text style={[s.sectionTitle, { marginTop: spacing.xl }]}>Favourite venue</Text>
          <Text style={s.bigStat}>{topVenue[0]}</Text>
          <Text style={s.subStat}>{topVenue[1]} rounds</Text>
        </>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  center: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  proGateEmoji: { fontSize: 48, marginBottom: spacing.md },
  proGateTitle: { fontSize: font.size.xl, fontWeight: font.weight.bold, color: colors.text, marginBottom: spacing.sm },
  proGateSub: { fontSize: font.size.md, color: colors.textMuted },
  sectionTitle: {
    fontSize: font.size.sm,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md, gap: spacing.sm },
  memberEmoji: { fontSize: 28, width: 36 },
  rowInfo: { flex: 1 },
  memberName: { fontSize: font.size.md, color: colors.text, marginBottom: 4 },
  barBg: { height: 6, backgroundColor: colors.surface, borderRadius: radius.full, overflow: 'hidden' },
  bar: { height: 6, backgroundColor: colors.accent, borderRadius: radius.full },
  countCol: { alignItems: 'flex-end', minWidth: 40 },
  count: { fontSize: font.size.lg, fontWeight: font.weight.bold, color: colors.text },
  debt: { fontSize: font.size.xs, color: colors.danger },
  bigStat: { fontSize: font.size.xxl, fontWeight: font.weight.black, color: colors.accent },
  subStat: { fontSize: font.size.sm, color: colors.textMuted },
});
