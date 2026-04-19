import '../lib/firebase'; // initialise Firebase before anything else
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { colors } from '../constants/theme';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="tab/[id]/index" options={{ title: '' }} />
        <Stack.Screen name="tab/[id]/history" options={{ title: 'Round History' }} />
        <Stack.Screen name="tab/[id]/stats" options={{ title: 'Stats' }} />
        <Stack.Screen name="create-tab" options={{ title: 'New Tab' }} />
        <Stack.Screen name="join" options={{ title: 'Join Tab' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
