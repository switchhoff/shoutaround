import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { useUserTabs } from '../../hooks/useTab';
import { TabCard } from '../../components/TabCard';
import { colors, spacing, font, radius } from '../../constants/theme';

export default function HomeScreen() {
  const { user, profile } = useAuth();
  const { tabs, loading } = useUserTabs();

  if (!user) return null;

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.greeting}>
          {profile?.avatarEmoji} {profile?.displayName}
        </Text>
        <TouchableOpacity onPress={() => router.push('/create-tab')} style={s.newBtn}>
          <Ionicons name="add" size={24} color={colors.background} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.accent} style={{ marginTop: spacing.xl }} />
      ) : tabs.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyTitle}>No tabs yet.</Text>
          <Text style={s.emptySub}>Start one for your next round.</Text>
          <TouchableOpacity style={s.startBtn} onPress={() => router.push('/create-tab')}>
            <Text style={s.startBtnText}>Create a tab</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={tabs}
          keyExtractor={(t) => t.id}
          renderItem={({ item }) => <TabCard tab={item} currentUserId={user.uid} />}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  greeting: { fontSize: font.size.lg, color: colors.text, fontWeight: font.weight.medium },
  newBtn: {
    backgroundColor: colors.accent,
    borderRadius: radius.full,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { padding: spacing.lg, paddingTop: spacing.sm },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyTitle: { fontSize: font.size.xl, fontWeight: font.weight.bold, color: colors.text, marginBottom: spacing.xs },
  emptySub: { fontSize: font.size.md, color: colors.textMuted, marginBottom: spacing.xl },
  startBtn: { backgroundColor: colors.accent, borderRadius: radius.full, paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
  startBtnText: { color: colors.background, fontWeight: font.weight.bold, fontSize: font.size.md },
});
