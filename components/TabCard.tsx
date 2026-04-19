import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { type Tab } from '../hooks/useTab';
import { colors, spacing, radius, font } from '../constants/theme';

interface Props {
  tab: Tab;
  currentUserId: string;
}

export function TabCard({ tab, currentUserId }: Props) {
  const currentBuyerId = tab.rotationOrder[tab.currentIndex % tab.rotationOrder.length];
  const currentBuyer = tab.members.find((m) => m.userId === currentBuyerId);
  const isMyShout = currentBuyerId === currentUserId;

  return (
    <TouchableOpacity style={s.card} onPress={() => router.push(`/tab/${tab.id}`)}>
      <Text style={s.tabName}>{tab.name}</Text>
      <View style={s.shoutRow}>
        <Text style={s.buyerEmoji}>{currentBuyer?.avatarEmoji ?? '🍺'}</Text>
        <Text style={[s.shoutText, isMyShout && s.shoutTextMe]}>
          {isMyShout
            ? 'YOUR SHOUT. Don\'t be shy.'
            : `It's ${currentBuyer?.displayName ?? 'someone'}'s shout 🍺`}
        </Text>
      </View>
      <Text style={s.members}>
        {tab.members.map((m) => m.avatarEmoji).join(' ')} · {tab.memberCount} people
      </Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabName: {
    fontSize: font.size.lg,
    fontWeight: font.weight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  shoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  buyerEmoji: { fontSize: 24 },
  shoutText: {
    fontSize: font.size.md,
    color: colors.textMuted,
    flex: 1,
  },
  shoutTextMe: {
    color: colors.accent,
    fontWeight: font.weight.bold,
  },
  members: {
    fontSize: font.size.sm,
    color: colors.textMuted,
  },
});
