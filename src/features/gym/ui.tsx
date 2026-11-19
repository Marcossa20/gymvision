// Piezas comunes de las pantallas de Mi gimnasio.
// Teoría (consistencia): todas las subpantallas comparten la misma barra (cerrar a la izquierda, título centrado)
// y el botón principal abajo, al alcance del pulgar (ley de Fitts).
import React from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, X } from 'lucide-react-native';
import { T } from '../../components/ui';
import { useTheme } from '../../theme/useTheme';
import { useTranslation } from 'react-i18next';

/** Color con transparencia a partir de un token #RRGGBB (para fondos suaves sin inventar colores). */
export const alpha = (hex: string, a: number) =>
  /^#[0-9a-f]{6}$/i.test(hex) ? hex + Math.round(a * 255).toString(16).padStart(2, '0') : hex;

export function ScreenBar({ title, icon = 'close', onBack }: { title: string; icon?: 'close' | 'back'; onBack?: () => void }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const back = onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/gimnasio' as never)));
  const Icon = icon === 'close' ? X : ChevronLeft;
  return (
    <View style={{ height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 }}>
      <Pressable accessibilityRole="button" accessibilityLabel={icon === 'close' ? t('Cerrar') : t('Volver')} onPress={back} hitSlop={4} style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={icon === 'close' ? 26 : 28} color={colors.textPrimary} strokeWidth={2} />
      </Pressable>
      <View style={{ flex: 1, alignItems: 'center' }}>
        <T size={18} weight="600" accessibilityRole="header" numberOfLines={1}>{title}</T>
      </View>
      <View style={{ width: 48 }} />
    </View>
  );
}

/** Cuadrado con icono (56 por defecto) — mosaico de las tarjetas. */
export function IconTile({ children, size = 56, radius = 16 }: { children: React.ReactNode; size?: number; radius?: number }) {
  const { colors } = useTheme();
  return <View style={{ width: size, height: size, borderRadius: radius, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' }}>{children}</View>;
}

/** Zona inferior fija para los botones principales. */
export function BottomActions({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const insets = useSafeAreaInsets();
  return <View style={[{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: Math.max(insets.bottom, 16) + 20, gap: 12 }, style]}>{children}</View>;
}

/** Pastilla de estado (icono + texto: el color nunca va solo). */
export function StatusPill({ icon, label, tone = 'neutral' }: { icon: React.ReactNode; label: string; tone?: 'neutral' | 'brand' }) {
  const { colors } = useTheme();
  const brand = tone === 'brand';
  return (
    <View accessible accessibilityLabel={label} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', paddingVertical: 8, paddingLeft: 12, paddingRight: 14, borderRadius: 20, borderWidth: 1, borderColor: brand ? colors.brand : colors.divider, backgroundColor: brand ? alpha(colors.brand, 0.12) : colors.card }}>
      {icon}
      <T size={brand ? 14 : 13} weight={brand ? '600' : '500'} color={brand ? 'brand' : 'primary'}>{label}</T>
    </View>
  );
}
