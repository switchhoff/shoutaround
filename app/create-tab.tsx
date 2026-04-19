import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { colors, spacing, radius, font } from '../constants/theme';

export default function CreateTabScreen() {
  const { user, profile } = useAuth();
  const [tabName, setTabName] = useState('');
  const [saving, setSaving] = useState(false);

  // Creator is always first member
  const creatorMember = user && profile
    ? { userId: user.uid, displayName: profile.displayName, avatarEmoji: profile.avatarEmoji }
    : null;

  async function create() {
    if (!tabName.trim()) { Alert.alert('Tab needs a name'); return; }
    if (!creatorMember) return;
    setSaving(true);
    try {
      const fn = httpsCallable(functions, 'createTab');
      const result = await fn({
        name: tabName.trim(),
        members: [creatorMember],
        rotationOrder: [creatorMember.userId],
      });
      const data = result.data as { tabId: string };
      router.replace(`/tab/${data.tabId}`);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not create tab');
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={s.container}>
      <Text style={s.label}>Tab name</Text>
      <TextInput
        style={s.input}
        placeholder="e.g. Friday Locals"
        placeholderTextColor={colors.textMuted}
        value={tabName}
        onChangeText={setTabName}
        maxLength={40}
        autoFocus
      />

      <Text style={s.hint}>
        Create the tab, then share the invite link to add your mates.
      </Text>

      <TouchableOpacity style={s.btn} onPress={create} disabled={saving}>
        {saving
          ? <ActivityIndicator color={colors.background} />
          : <Text style={s.btnText}>Create tab</Text>}
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
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
    marginBottom: spacing.md,
  },
  hint: {
    fontSize: font.size.sm,
    color: colors.textMuted,
    marginBottom: spacing.xl,
  },
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
