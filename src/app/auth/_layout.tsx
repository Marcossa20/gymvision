// Pila de Acceso. Mientras se cargan las cuentas guardadas no se muestra nada (evita parpadeo del login);
// si ya hay sesión, va directo a Entrenar (pestaña inicial tras el login, CLAUDE.md §3).
import { View } from 'react-native';
import { Redirect, Stack } from 'expo-router';
import { useAuth } from '../../store/auth';
import { useTheme } from '../../theme/useTheme';

export default function AuthLayout() {
  const { colors } = useTheme();
  const hydrated = useAuth((s) => s.hydrated);
  const loggedIn = useAuth((s) => s.loggedIn);
  if (!hydrated) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  if (loggedIn) return <Redirect href={'/entrenar' as never} />;
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg }, animation: 'slide_from_right' }} />;
}
