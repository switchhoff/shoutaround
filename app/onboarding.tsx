import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { AVATAR_EMOJIS } from '../constants/avatarEmojis';
import { colors, spacing, radius, font } from '../constants/theme';

export default function Onboarding() {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState<string>(AVATAR_EMOJIS[0]);
  const [saving, setSaving] = useState(false);

  async function save() {
    const trimmed = name.trim();
    if (!trimmed) { Alert.alert('Name required', 'Pick a display name.'); return; }
    if (!user) return;
    setSaving(true);
    try {
      const fn = httpsCallable(functions, 'updateProfile');
      await fn({ displayName: trimmed, avatarEmoji: emoji });
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
      <Text style={s.title}>Welcome to{'\n'}Shout 🍺</Text>
      <Text style={s.sub}>Pick a name your mates will recognise.</Text>

      <TextInput
        style={s.input}
        placeholder="Your name"
        placeholderTextColor={colors.textMuted}
        value={name}
        onChangeText={setName}
        maxLength={30}
        autoFocus
      />

      <Text style={s.label}>Pick your emoji</Text>
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
          : <Text style={s.btnText}>Let's go</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    paddingTop: spacing.xxl + spacing.lg,
  },
  title: {
    fontSize: font.size.xxl,
    fontWeight: font.weight.black,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  sub: {
    fontSize: font.size.md,
    color: colors.textMuted,
    marginBottom: spacing.xl,
  },
  input: {
    backgroundColor: colors.surface,
    color: colors.text,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: font.size.lg,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    fontSize: font.size.sm,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  emojiBtn: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emojiBtnSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.surfaceAlt,
  },
  emojiText: { fontSize: 28 },
  btn: {
    backgroundColor: colors.accent,
    borderRadius: radius.full,
    padding: spacing.md,
    alignItems: 'center',
  },
  btnText: {
    color: colors.background,
    fontSize: font.size.lg,
    fontWeight: font.weight.bold,
  },
});
