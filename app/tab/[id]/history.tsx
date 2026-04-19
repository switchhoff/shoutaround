import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../../lib/firebase';
import { useAuth } from '../../../hooks/useAuth';
import { useRounds } from '../../../hooks/useRounds';
import { colors, spacing, font, radius } from '../../../constants/theme';

export default function HistoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();
  const isPro = profile?.isPro ?? false;
  const { rounds, loading } = useRounds(id, isPro);

  async function exportRounds(format: 'csv' | 'json') {
    try {
      const fn = httpsCallable(functions, 'exportTab');
      const result = await fn({ tabId: id, format });
      const data = result.data as any;
      // TODO: implement share sheet / file save using expo-sharing
      Alert.alert('Export ready', `${data.rounds.length} rounds exported as ${format.toUpperCase()}.`);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Export failed');
    }
  }

  function formatDate(date: Date): string {
    return date.toLocaleString('en-GB', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    });
  }

  return (
    <View style={s.container}>
      <Stack.Screen
        options={{
          title: 'Round History',
          headerRight: isPro
            ? () => (
                <TouchableOpacity onPress={() => exportRounds('csv')} style={s.exportBtn}>
                  <Text style={s.exportText}>Export</Text>
                </TouchableOpacity>
              )
            : undefined,
        }}
      />

      {!isPro && (
        <View style={s.freeBanner}>
          <Text style={s.freeBannerText}>Showing last 20 rounds · Upgrade to Pro for full history</Text>
        </View>
      )}

      {loading ? (
        <ActivityIndicator color={colors.accent} style={{ marginTop: spacing.xl }} />
      ) : rounds.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyText}>No rounds yet. Someone's slacking.</Text>
        </View>
      ) : (
        <FlatList
          data={rounds}
          keyExtractor={(r) => r.id}
          renderItem={({ item, index }) => (
            <View style={s.row}>
              <View style={s.indexBadge}>
                <Text style={s.indexText}>#{rounds.length - index}</Text>
              </View>
              <View style={s.rowContent}>
                <Text style={s.buyerName}>{item.buyerName}</Text>
                <Text style={s.meta}>
                  {item.timestamp ? formatDate(item.timestamp) : '—'}
                  {item.location?.placeName ? ` · ${item.location.placeName}` : ''}
                </Text>
                {item.note ? <Text style={s.note}>{item.note}</Text> : null}
              </View>
            </View>
          )}
          contentContainerStyle={s.list}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  freeBanner: {
    backgroundColor: colors.surfaceAlt,
    padding: spacing.sm,
    alignItems: 'center',
  },
  freeBannerText: { fontSize: font.size.xs, color: colors.textMuted },
  exportBtn: { marginRight: spacing.sm },
  exportText: { color: colors.accent, fontSize: font.size.sm },
  list: { padding: spacing.lg },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  indexBadge: {
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    minWidth: 36,
    alignItems: 'center',
  },
  indexText: { fontSize: font.size.xs, color: colors.textMuted },
  rowContent: { flex: 1 },
  buyerName: { fontSize: font.size.md, fontWeight: font.weight.bold, color: colors.text },
  meta: { fontSize: font.size.sm, color: colors.textMuted, marginTop: 2 },
  note: { fontSize: font.size.sm, color: colors.textMuted, fontStyle: 'italic', marginTop: 2 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: colors.textMuted, fontSize: font.size.md },
});
