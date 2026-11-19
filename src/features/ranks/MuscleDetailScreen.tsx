// Detalle de músculo (Figma 2063:231) — RF8: «al tocar un músculo se ven sus datos».
// Teoría (gamificación + visibilidad del estado): rango actual, siguiente escalón y % que falta;
// desde aquí se llega a los ejercicios que lo trabajan (reconocimiento antes que recuerdo).
import React from 'react';
import { Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight, Dumbbell, Target } from 'lucide-react-native';
import { Card, T } from '../../components/ui';
import { exercises, type Muscle } from '../../data/seed';
import { nextRankLabel } from '../../domain/ranks';
import { useWorkout } from '../../store/workout';
import { useTheme } from '../../theme/useTheme';
import { fmtInt, fmtWeight } from '../profile/format';
import { exerciseRank, useMuscleRanks, useRanksDemo } from './data';
import { MuscleIllustration } from './MuscleIllustration';
import { MUSCLE_LABELS } from './muscles';
import { Bar, RankBadge } from './RankBits';
import { useTranslation } from 'react-i18next';

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <Card style={{ flex: 1, gap: 4, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 20 }}>
      {icon}
      <T size={20} weight="700">{value}</T>
      <T size={12} color="secondary">{label}</T>
    </Card>
  );
}

export function MuscleDetailScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { muscle } = useLocalSearchParams<{ muscle: Muscle }>();
  const { byMuscle, points } = useMuscleRanks();
  const demo = useRanksDemo((s) => s.demo);
  const lastSets = useWorkout((s) => s.lastSets);
  const bestWeight = useWorkout((s) => s.bestWeight);
  if (!muscle || !(muscle in MUSCLE_LABELS)) return <Redirect href={'/rangos' as never} />;

  const r = byMuscle[muscle]?.rank ?? null;
  const next = r ? nextRankLabel(r) : null;
  const list = exercises.filter((e) => e.muscles.includes(muscle));
  // Datos reales: última sesión de cada ejercicio del músculo y mejor peso histórico (store de Entrenar).
  const volumeKg = list.reduce((a, e) => a + (lastSets[e.id]?.sets.reduce((v, s) => v + s.weight * s.reps, 0) ?? 0), 0);
  const bestKg = Math.max(0, ...list.map((e) => bestWeight[e.id] ?? 0));
  const volume = demo && r ? `${fmtInt(6240)} kg` : volumeKg ? `${fmtInt(volumeKg)} kg` : '—';
  const best = demo && r ? '34 kg' : bestKg ? fmtWeight(bestKg) : '—';

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 12, gap: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Pressable accessibilityRole="button" accessibilityLabel={t('Volver')} onPress={() => (router.canGoBack() ? router.back() : router.replace('/rangos' as never))} hitSlop={12} style={{ width: 48, height: 48, marginLeft: -12, alignItems: 'center', justifyContent: 'center' }}>
            <ChevronLeft size={24} color={colors.textPrimary} />
          </Pressable>
          <T size={24} weight="700" accessibilityRole="header">{t(MUSCLE_LABELS[muscle])}</T>
        </View>

        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 18, paddingVertical: 16, borderRadius: 26 }}>
          <RankBadge rank={r} size={92} />
          <View style={{ flex: 1, gap: 6 }}>
            <T size={22} weight="700">{r ? r.label : t('Sin rango')}</T>
            <T size={13} color="secondary">{r ? (next ? t('Siguiente: {{next}}', { next }) : t('Rango máximo')) : t('Aún sin entrenar')}</T>
            <Bar progress={r?.progress ?? 0} color={colors.brand} height={8} />
            <T size={12} weight="600" color="brand">{r ? t('{{n}}% completado', { n: Math.round(r.progress * 100) }) : t('Haz una serie para empezar')}</T>
          </View>
        </Card>

        <View style={{ borderRadius: 24, borderWidth: 1, borderColor: colors.divider, paddingVertical: 12, gap: 6, backgroundColor: colors.bg }}>
          <MuscleIllustration muscles={[muscle]} width={width - 42} />
          <T size={13} weight="500" color="secondary" style={{ textAlign: 'center' }}>{t(MUSCLE_LABELS[muscle])}</T>
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Stat icon={<Dumbbell size={18} color={colors.brand} />} value={volume} label={demo && r ? t('Volumen · mes') : t('Volumen · última sesión')} />
          <Stat icon={<Target size={18} color={colors.brand} />} value={best} label={t('Mejor serie')} />
        </View>

        <T size={15} weight="700" accessibilityRole="header">{t('Ejercicios que lo trabajan')}</T>
        <View style={{ gap: 8 }}>
          {list.length === 0 ? <T size={13} color="secondary">{t('No hay ejercicios de este músculo en el catálogo.')}</T> : null}
          {list.map((e) => {
            const er = exerciseRank(points, e);
            const go = e.machineCode ? () => router.push(`/gym/machine/${e.machineCode}` as never) : undefined;
            return (
              <Card key={e.id} onPress={go} accessibilityLabel={`${t(e.name)}, ${er ? er.label : t('sin rango')}`} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 18, minHeight: 56 }}>
                <RankBadge rank={er} size={36} />
                <View style={{ flex: 1, gap: 2 }}>
                  <T size={14} weight="600" numberOfLines={1}>{t(e.name)}</T>
                  <T size={12} color="secondary">{er ? er.label : t('Sin rango')}</T>
                </View>
                {go ? <ChevronRight size={18} color={colors.textSecondary} /> : null}
              </Card>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
