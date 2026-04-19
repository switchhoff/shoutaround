import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { colors } from '../constants/theme';

// Entry point — routes to onboarding or home based on auth + profile state
export default function Index() {
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user || !profile?.displayName) {
      router.replace('/onboarding');
    } else {
      router.replace('/(tabs)');
    }
  }, [user, profile, loading]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color={colors.accent} size="large" />
    </View>
  );
}
