import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Redirect, Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { useTheme } from '../theme/useTheme';
import { useAuth } from '../store/auth';
import { AlertBanner } from '../components/AlertBanner';

export default function RootLayout() {
  const { colors, isDark } = useTheme();
  const loggedIn = useAuth((s) => s.loggedIn);
  const segments = useSegments();
  const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center' }}><ActivityIndicator color={colors.brand} /></View>;
  }

  // Sesión local simulada: sin sesión → pantalla de acceso (la implementa B).
  const inAuth = (segments[0] as string) === 'auth';
  if (!loggedIn && !inAuth) return <Redirect href={'/auth/login' as never} />;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaProvider>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg }, animation: 'slide_from_right' }} />
        <AlertBanner />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
