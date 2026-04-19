import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../lib/firebase';
import { useAuth } from '../../hooks/useAuth';
import { AVATAR_EMOJIS } from '../../constants/avatarEmojis';
import { colors, spacing, radius, font } from '../../constants/theme';

export default function ProfileScreen() {
  const { user, profile } = useAuth();
  const [name, setName] = useState(profile?.displayName ?? '');
  const [emoji, setEmoji] = useState(profile?.avatarEmoji ?? AVATAR_EMOJIS[0]);
  const [saving, setSaving] = useState(false);

  async function save() {
    const trimmed = name.trim();
    if (!trimmed) { Alert.alert('Name required'); return; }
    setSaving(true);
    try {
      const fn = httpsCallable(functions, 'updateProfile');
      await fn({ displayName: trimmed, avatarEmoji: emoji });
      Alert.alert('Saved', 'Profile updated.');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
      <View style={s.tierBadge}>
        <Text style={s.tierText}>{profile?.isPro ? '⭐ Pro' : 'Free'}</Text>
      </View>

      <Text style={s.label}>Display name</Text>
      <TextInput
        style={s.input}
        value={name}
        onChangeText={setName}
        maxLength={30}
        placeholderTextColor={colors.textMuted}
      />

      <Text style={s.label}>Emoji</Text>
      <View style={s.emojiGrid}>
        {AVATAR_EMOJIS.map((e) => (
          <TouchableOpacity
            key={e}
            style={[s.emojiBtn, emoji === e && s.emojiBtnSelected]}
            onPress={() => setEmoji(e)}
          >
            <Text style={s.emojiText}>{e}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={s.btn} onPress={save} disabled={saving}>
        {saving
          ? <ActivityIndicator color={colors.background} />
          : <Text style={s.btnText}>Save</Text>}
      </TouchableOpacity>

      {!profile?.isPro && (
        <View style={s.proBanner}>
          <Text style={s.proTitle}>Shout Pro</Text>
          <Text style={s.proSub}>Full history · Stats · Export · Unlimited members</Text>
          <Text style={s.proPrice}>£2.99/mo or £14.99/yr</Text>
          {/* TODO: wire up RevenueCat or Expo IAP */}
          <TouchableOpacity style={s.proBtn}>
            <Text style={s.proBtnText}>Upgrade to Pro</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: colors.background, padding: spacing.lg, paddingTop: spacing.xl },
  tierBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginBottom: spacing.xl,
  },
  tierText: { color: colors.accent, fontWeight: font.weight.bold, fontSize: font.size.sm },
  label: {
    fontSize: font.size.sm,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  input: {
    backgroundColor: colors.surface,
    color: colors.text,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: font.size.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.xl },
  emojiBtn: {
    width: 52, height: 52, borderRadius: radius.md,
    backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'transparent',
  },
  emojiBtnSelected: { borderColor: colors.accent, backgroundColor: colors.surfaceAlt },
  emojiText: { fontSize: 28 },
  btn: { backgroundColor: colors.accent, borderRadius: radius.full, padding: spacing.md, alignItems: 'center', marginBottom: spacing.xl },
  btnText: { color: colors.background, fontSize: font.size.lg, fontWeight: font.weight.bold },
  proBanner: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.accent,
    alignItems: 'center',
  },
  proTitle: { fontSize: font.size.xl, fontWeight: font.weight.black, color: colors.accent, marginBottom: spacing.xs },
  proSub: { fontSize: font.size.sm, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.sm },
  proPrice: { fontSize: font.size.md, color: colors.text, fontWeight: font.weight.bold, marginBottom: spacing.md },
  proBtn: { backgroundColor: colors.accent, borderRadius: radius.full, paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
  proBtnText: { color: colors.background, fontWeight: font.weight.bold },
});
