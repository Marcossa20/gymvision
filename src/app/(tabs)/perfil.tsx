// STUB: pantalla "Perfil" — la implementa Miguel Ángel (B), ver REPARTO.md. Sustituir este archivo entero.
import { View } from 'react-native';
import { T } from '../../components/ui';
import { useTheme } from '../../theme/useTheme';

export default function Screen() {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
      <T size={20} weight="600">Perfil</T>
      <T size={14} color="secondary">Pendiente (B)</T>
    </View>
  );
}
