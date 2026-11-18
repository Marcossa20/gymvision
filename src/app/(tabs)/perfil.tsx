// STUB: pantalla "Perfil" — la implementa Miguel Ángel (B), ver REPARTO.md. Sustituir este archivo entero.
// Mientras tanto da acceso (solo en desarrollo) al Laboratorio de componentes.
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { FlaskConical } from 'lucide-react-native';
import { Button, T } from '../../components/ui';
import { useTheme } from '../../theme/useTheme';

export default function Screen() {
  const { colors } = useTheme();
  const router = useRouter();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 20 }}>
      <T size={20} weight="600">Perfil</T>
      <T size={14} color="secondary">Pendiente (B)</T>
      {__DEV__ ? (
        <Button label="Laboratorio de componentes" onPress={() => router.push('/lab')} icon={<FlaskConical size={20} color={colors.onBrand} />} style={{ alignSelf: 'stretch', marginTop: 16 }} />
      ) : null}
    </View>
  );
}
