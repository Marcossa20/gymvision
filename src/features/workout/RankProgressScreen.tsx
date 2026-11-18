// Teoría (RF8, gamificación): el rango se muestra con insignia de forma propia + nombre + porcentaje (el color nunca va solo);
// al subir de rango, animación + háptica + aviso visual (Reto 3).
import React, { useEffect } from 'react';
import { Image, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring } from 'react-native-reanimated';
import { Button, Card, T } from '../../components/ui';
import { nextRankLabel, rankFromPoints } from '../../domain/ranks';
import { notify } from '../../services/alerts';
import { Bar, RankBadge } from '../ranks/RankBits';
import { muscleLabel } from '../routines/Thumb';
import { useWorkout } from '../../store/workout';
import { useTheme } from '../../theme/useTheme';
import { muscleImages } from './muscleImages';
import { useTranslation } from 'react-i18next';

export function RankProgressScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const d = useWorkout((s) => s.lastSummary?.rankDelta);

  const before = d ? (d.before > 0 ? rankFromPoints(d.before) : null) : null;
  const after = d ? rankFromPoints(d.after) : null;
  const rankedUp = !!after && (!before || after.label !== before.label);

  // Animación de la insignia nueva (entra con un muelle) y aviso al subir de rango.
  const scale = useSharedValue(0.6);
  useEffect(() => {
    scale.value = withDelay(150, withSpring(1, { damping: 8, stiffness: 120 }));
    if (rankedUp && after) notify('rango', t('¡Subes a {{rank}}!', { rank: after.label }));
  }, [rankedUp, after, scale]);
  const badgeStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const pct = after ? Math.round(after.progress * 100) : 0;
  const gained = after ? (before && before.label === after.label ? Math.max(0, Math.round((after.progress - before.progress) * 100)) : pct) : 0;
  const next = after ? nextRankLabel(after) : null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 12, gap: 18, alignItems: 'center', flexGrow: 1 }}>
        <View style={{ height: 30 }} />
        <T size={13} weight="700" color="brand" accessibilityRole="header">{t('TU PROGRESO · ENTRENO DE HOY')}</T>

        {d && after ? (
          <>
            <View style={{ width: 84, height: 84, borderRadius: 24, overflow: 'hidden', backgroundColor: '#070707' }}>
              <Image source={muscleImages[d.muscle]} style={{ width: 84, height: 84 }} resizeMode="cover" accessibilityIgnoresInvertColors />
            </View>
            <T size={34} weight="700">{muscleLabel(d.muscle)}</T>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
              <View style={{ alignItems: 'center', gap: 6 }}>
                <RankBadge rank={before} size={110} />
                <T size={14} weight="500" color="secondary">{before ? before.label : t('Sin rango')}</T>
              </View>
              <ArrowRight size={28} color={colors.brand} />
              <Animated.View style={[{ alignItems: 'center', gap: 6 }, badgeStyle]}>
                <RankBadge rank={after} size={150} />
                <T size={16} weight="700">{after.label}</T>
              </Animated.View>
            </View>

            <Card style={{ alignSelf: 'stretch', borderRadius: 22, padding: 16, gap: 8 }}>
              <T size={13} weight="500" color="secondary">{next ? t('Para subir a {{rank}}', { rank: next }) : t('Has alcanzado el rango máximo')}</T>
              <T size={44} weight="700" color="brand">{`${pct} %`}</T>
              <Bar progress={after.progress} color={colors.brand} height={8} />
              <T size={13} color="secondary">{(next ? t('Te falta un {{left}} % para subir de rango · ', { left: 100 - pct }) : '') + t('hoy has sumado +{{n}} %', { n: gained })}</T>
            </Card>
          </>
        ) : (
          <Card style={{ alignSelf: 'stretch', borderRadius: 22, padding: 20, gap: 8, marginTop: 24 }}>
            <T size={18} weight="700">{t('Hoy no ha cambiado ningún rango')}</T>
            <T size={14} color="secondary">{t('Sube peso o repeticiones en tus ejercicios para avanzar hacia el siguiente rango.')}</T>
          </Card>
        )}

        <View style={{ flex: 1, minHeight: 12 }} />
        <Button label={t('Continuar')} style={{ alignSelf: 'stretch' }} onPress={() => router.replace('/entrenar')} />
      </ScrollView>
    </SafeAreaView>
  );
}
