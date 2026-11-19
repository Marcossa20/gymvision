// Ilustración de músculos (siluetas del Figma, página «Músculos · reserva»): se superponen con «lighten»
// como en Figma; si un músculo no tiene silueta de cuerpo entero, se usa su miniatura.
import React from 'react';
import { Image, View } from 'react-native';
import type { Muscle } from '../../data/seed';
import { useTheme } from '../../theme/useTheme';
import { muscleImages } from '../workout/muscleImages';
import { MUSCLE_LABELS } from './muscles';
import { useTranslation } from 'react-i18next';

/** Siluetas de cuerpo entero (fondo negro) que se pueden superponer con «lighten», como en Figma. */
const FULL_BODY: Partial<Record<Muscle, number>> = {
  pecho: require('../../../assets/muscles/plan-pecho.jpg'),
  hombros: require('../../../assets/muscles/plan-hombros.jpg'),
  dorsales: require('../../../assets/muscles/plan-dorsales.jpg'),
};

export function MuscleIllustration({ muscles, width }: { muscles: Muscle[]; width: number }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const full = muscles.filter((m) => FULL_BODY[m] !== undefined);
  // Encaje de Figma: imagen de 367,5 × 658 desplazada (-5, -66) dentro de un hueco de 348 × 138.
  const k = width / 348;
  return (
    <View style={{ height: 170, backgroundColor: colors.bg, justifyContent: 'center' }} accessible accessibilityLabel={`${t('Músculos')}: ${muscles.map((m) => t(MUSCLE_LABELS[m])).join(', ')}`}>
      <View style={{ height: 138, borderRadius: 16, overflow: 'hidden' }}>
        {full.length === muscles.length && full.length > 0 ? (
          full.map((m, i) => (
            <Image key={m} source={FULL_BODY[m]!} resizeMode="cover" style={{ position: 'absolute', left: -5 * k, top: -66 * k, width: 367.5 * k, height: 658.4 * k, mixBlendMode: i === 0 ? 'normal' : 'lighten' }} />
          ))
        ) : (
          <Image source={muscleImages[muscles[0]]} resizeMode="contain" style={{ width: '100%', height: '100%' }} />
        )}
      </View>
    </View>
  );
}
