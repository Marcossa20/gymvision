// Teoría (RF5, manos sudadas): el valor se ajusta deslizando arriba/abajo, sin teclear; cada paso da un «tick» háptico.
// Accesibilidad: acciones increment/decrement para lector de pantalla.
import React, { useRef } from 'react';
import { PanResponder, View } from 'react-native';
import { fmtNum } from '../../domain/format';
import { hapticTick } from '../../services/haptics';
import { T } from '../../components/ui';
import { useTheme } from '../../theme/useTheme';
import { useScrollLock } from './scrollLock';

export function Wheel({ value, step, min = 0, onChange, label, active, suffix, width = 76, height = 96, valueSize = 26, format = fmtNum }: {
  value: number; step: number; min?: number; onChange: (v: number) => void; label: string; active?: boolean; suffix?: string;
  width?: number | `${number}%`; height?: number; valueSize?: number; format?: (n: number) => string;
}) {
  const { colors } = useTheme();
  const base = useRef(value);
  const latest = useRef({ value, onChange });
  latest.current = { value, onChange };
  const last = useRef(0);
  const lock = useRef(useScrollLock());
  lock.current = useScrollLock();

  const pan = useRef(
    PanResponder.create({
      // La rueda se queda con el gesto desde que se toca y no lo suelta (ni al ScrollView ni al sistema).
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => true,
      onPanResponderGrant: () => { base.current = latest.current.value; last.current = 0; lock.current(true); },
      onPanResponderRelease: () => lock.current(false),
      onPanResponderTerminate: () => lock.current(false),
      onPanResponderMove: (_, g) => {
        const steps = Math.round(-g.dy / 18); // arriba = subir
        if (steps !== last.current) {
          last.current = steps;
          const next = Math.max(min, base.current + steps * step);
          if (next !== latest.current.value) { latest.current.onChange(next); hapticTick(); }
        }
      },
    }),
  ).current;

  const prev = Math.max(min, value - step), next = value + step;

  if (!active) {
    return (
      <View style={{ width, height: 48, borderRadius: 14, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' }}>
        <T size={22} weight="700" color="secondary">{format(value)}</T>
      </View>
    );
  }
  return (
    <View
      {...pan.panHandlers}
      accessible accessibilityRole="adjustable" accessibilityLabel={label} accessibilityValue={{ text: `${format(value)}${suffix ?? ''}` }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) => onChange(Math.max(min, value + (e.nativeEvent.actionName === 'increment' ? step : -step)))}
      style={{ width, height, borderRadius: 16, borderWidth: 1.5, borderColor: colors.brand, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center', gap: 6, overflow: 'hidden' }}
    >
      <T size={15} weight="500" color={colors.radioOff} style={{ opacity: 0.7 }}>{format(next)}</T>
      <T size={valueSize} weight="700" color="#FFFFFF">{format(value)}</T>
      <T size={15} weight="500" color={colors.radioOff} style={{ opacity: 0.7 }}>{format(prev)}</T>
    </View>
  );
}
