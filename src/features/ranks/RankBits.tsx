// Piezas de rango reutilizables: insignia (imagen con forma propia) y barra de progreso.
import React from 'react';
import { Image, View } from 'react-native';
import { Lock } from 'lucide-react-native';
import type { Rank } from '../../domain/ranks';
import { useTheme } from '../../theme/useTheme';
import { rankImages } from './rankImages';
import { useTranslation } from 'react-i18next';

export function RankBadge({ rank, size }: { rank: Rank | null; size: number }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  if (!rank) {
    return (
      <View accessible accessibilityLabel={t('Sin rango')} style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' }}>
        <Lock size={Math.round(size * 0.45)} color={colors.textSecondary} />
      </View>
    );
  }
  return <Image source={rankImages[rank.tier]} style={{ width: size, height: size }} resizeMode="contain" accessible accessibilityLabel={t('Rango {{label}}', { label: rank.label })} />;
}

export function Bar({ progress, color, height = 6 }: { progress: number; color: string; height?: number }) {
  const { colors } = useTheme();
  return (
    <View accessible accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }} style={{ alignSelf: 'stretch', height, borderRadius: height / 2, backgroundColor: colors.switchOff, overflow: 'hidden' }}>
      <View style={{ width: `${Math.round(progress * 100)}%`, height: '100%', borderRadius: height / 2, backgroundColor: color }} />
    </View>
  );
}
