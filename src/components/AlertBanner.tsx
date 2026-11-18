// Teoría (Reto 3): señal visual equivalente a la vibración/sonido; icono + texto, nunca solo color.
import React from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AlertTriangle, Bell, CheckCircle2, Info, LockOpen, ScanLine, Timer, Trophy } from 'lucide-react-native';
import { useAlerts, type AlertKind } from '../services/alerts';
import { useTheme } from '../theme/useTheme';
import { T } from './ui';

const icons: Record<AlertKind, typeof Bell> = {
  serie: CheckCircle2, descanso: Timer, rango: Trophy, cardio: Bell, qr: ScanLine, taquilla: LockOpen, error: AlertTriangle, info: Info,
};

export function AlertBanner() {
  const current = useAlerts((s) => s.current);
  const hide = useAlerts((s) => s.hide);
  const { colors, highContrast } = useTheme();
  const insets = useSafeAreaInsets();
  if (!current) return null;
  const Icon = icons[current.kind];
  const accent = current.kind === 'error' ? colors.danger : colors.brand;
  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', left: 16, right: 16, top: insets.top + 8, zIndex: 100 }}>
      <Pressable
        accessibilityRole="alert" accessibilityLiveRegion="polite" accessibilityLabel={current.message} onPress={hide}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56, paddingHorizontal: 16, borderRadius: 16, backgroundColor: colors.card, borderWidth: highContrast ? 2 : 1.5, borderColor: accent }}
      >
        <Icon size={22} color={accent} />
        <T size={15} weight="600" style={{ flex: 1 }}>{current.message}</T>
        {current.actionLabel ? (
          <Pressable accessibilityRole="button" accessibilityLabel={current.actionLabel} hitSlop={10} onPress={() => { current.onAction?.(); hide(); }} style={{ minHeight: 48, justifyContent: 'center', paddingHorizontal: 6 }}>
            <T size={15} weight="700" color="brand">{current.actionLabel}</T>
          </Pressable>
        ) : null}
      </Pressable>
    </View>
  );
}
