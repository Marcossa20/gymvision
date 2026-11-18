// Teoría (Gestalt: agrupación en tarjetas; consistencia): componentes reutilizables, todo el estilo viene del tema.
import React from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { Check } from 'lucide-react-native';
import { useTheme } from '../theme/useTheme';
import { minTouch, radius } from '../theme/tokens';

export function T({ size = 16, weight = '400', color, style, children, ...rest }: {
  size?: number; weight?: TextStyle['fontWeight']; color?: 'primary' | 'secondary' | 'brand' | string;
  style?: StyleProp<TextStyle>; children?: React.ReactNode; numberOfLines?: number; accessibilityRole?: 'header' | 'text';
}) {
  const { colors, fs } = useTheme();
  const c = color === 'secondary' ? colors.textSecondary : color === 'brand' ? colors.brand : color && color !== 'primary' ? color : colors.textPrimary;
  const family = weight === '700' || weight === 'bold' ? 'Inter_700Bold' : weight === '600' ? 'Inter_600SemiBold' : weight === '500' ? 'Inter_500Medium' : 'Inter_400Regular';
  return <Text {...rest} style={[{ fontSize: fs(size), fontFamily: family, color: c }, style]}>{children}</Text>;
}

export function Card({ children, style, onPress, accessibilityLabel }: {
  children: React.ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void; accessibilityLabel?: string;
}) {
  const { colors, highContrast } = useTheme();
  const base: ViewStyle = {
    backgroundColor: colors.card, borderRadius: radius.card, borderWidth: highContrast ? 2 : 1,
    borderColor: highContrast ? colors.border : colors.divider,
  };
  if (onPress) return <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} onPress={onPress} style={[base, style]}>{children}</Pressable>;
  return <View style={[base, style]}>{children}</View>;
}

export function Button({ label, onPress, variant = 'primary', icon, style, disabled }: {
  label: string; onPress: () => void; variant?: 'primary' | 'secondary' | 'danger'; icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>; disabled?: boolean;
}) {
  const { colors, highContrast } = useTheme();
  const bg = variant === 'primary' ? colors.brand : variant === 'danger' ? colors.danger : colors.card;
  const fg = variant === 'secondary' ? colors.textPrimary : colors.onBrand;
  return (
    <Pressable
      accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }} disabled={disabled} onPress={onPress}
      style={({ pressed }) => [{
        minHeight: 56, borderRadius: 28, backgroundColor: bg, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        opacity: disabled ? 0.4 : pressed ? 0.85 : 1, borderWidth: variant === 'secondary' || highContrast ? 1.5 : 0, borderColor: variant === 'secondary' ? colors.divider : colors.border,
      }, style]}
    >
      <T size={17} weight="600" color={fg}>{label}</T>
      {icon}
    </Pressable>
  );
}

/** Fila de ajustes: altura mínima 56, icono 22 turquesa, texto, valor opcional, chevron. */
export function Row({ icon, label, value, right, onPress, last }: {
  icon?: React.ReactNode; label: string; value?: string; right?: React.ReactNode; onPress?: () => void; last?: boolean;
}) {
  const { colors } = useTheme();
  const content = (
    <View style={{ minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth, borderBottomColor: colors.divider }}>
      {icon}
      <T size={16} weight="500" style={{ flex: 1 }}>{label}</T>
      {value ? <T size={15} color="secondary">{value}</T> : null}
      {right}
    </View>
  );
  if (!onPress) return content;
  return <Pressable accessibilityRole="button" accessibilityLabel={value ? `${label}, ${value}` : label} onPress={onPress}>{content}</Pressable>;
}

/** Interruptor: ON muestra un check dentro del pomo (el color nunca va solo). */
export function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="switch" accessibilityLabel={label} accessibilityState={{ checked: value }} hitSlop={12}
      onPress={() => onChange(!value)}
      style={{ width: 52, height: 32, borderRadius: 16, backgroundColor: value ? colors.brand : colors.switchOff, justifyContent: 'center', padding: 3 }}
    >
      <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', alignSelf: value ? 'flex-end' : 'flex-start' }}>
        {value ? <Check size={16} color={colors.brand} strokeWidth={3} /> : null}
      </View>
    </Pressable>
  );
}

/** Radio: seleccionado = círculo relleno interior + texto en negrita. */
export function RadioRow({ label, selected, onPress, last }: { label: string; selected: boolean; onPress: () => void; last?: boolean }) {
  const { colors, fs } = useTheme();
  return (
    <Pressable
      accessibilityRole="radio" accessibilityState={{ selected }} accessibilityLabel={label} onPress={onPress}
      style={{ minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth, borderBottomColor: colors.divider }}
    >
      <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: selected ? colors.brand : colors.radioOff, alignItems: 'center', justifyContent: 'center' }}>
        {selected ? <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: colors.brand }} /> : null}
      </View>
      <Text style={{ flex: 1, fontSize: fs(16), color: colors.textPrimary, fontWeight: selected ? '700' : '400' }}>{label}</Text>
    </Pressable>
  );
}

export { minTouch };
