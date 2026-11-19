import React from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Pencil, Play, Plus, Repeat } from 'lucide-react-native';
import { Button, Card, T } from '../../components/ui';
import { exerciseById, type Muscle } from '../../data/seed';
import { notify } from '../../services/alerts';
import { useWorkout } from '../../store/workout';
import { useTheme } from '../../theme/useTheme';
import { estimateMinutes } from './EntrenarScreen';
import { muscleLabel } from '../routines/Thumb';
import { muscleImages } from './muscleImages';
import { useTranslation } from 'react-i18next';

const label = (m: string) => m.charAt(0).toUpperCase() + m.slice(1).replace('biceps', 'bíceps').replace('triceps', 'tríceps').replace('cuadriceps', 'cuádriceps').replace('gluteos', 'glúteos');

export function RoutineDetailScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const { routineId } = useLocalSearchParams<{ routineId: string }>();
  const routine = useWorkout((s) => s.routines.find((r) => r.id === routineId));
  const start = useWorkout((s) => s.start);
  const active = useWorkout((s) => s.active);
  if (!routine) return null;

  // Distribución muscular: reparto de series por músculo principal.
  const totals: Partial<Record<Muscle, number>> = {};
  let all = 0;
  for (const e of routine.exercises) for (const m of exerciseById(e.exerciseId).muscles) { totals[m] = (totals[m] ?? 0) + e.sets; all += e.sets; }
  const dist = (Object.entries(totals) as [Muscle, number][]).sort((a, b) => b[1] - a[1]).slice(0, 4);

  const begin = () => {
    if (!active || active.routineId !== routine.id) start(routine.id);
    router.replace('/workout/active');
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12 }}>
        <Pressable accessibilityRole="button" accessibilityLabel={t('Volver')} onPress={() => router.back()} style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}><ChevronLeft size={28} color={colors.textPrimary} /></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={t('Editar rutina')} onPress={() => router.push({ pathname: '/routines/edit/[id]', params: { id: routine.id } })} style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}><Pencil size={22} color={colors.textPrimary} /></Pressable>
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120, gap: 20 }}>
        <View style={{ gap: 4 }}>
          <T size={32} weight="700" accessibilityRole="header">{t(routine.name)}</T>
          <T size={16} color="secondary">{t('{{n}} ejercicios · {{min}} min', { n: routine.exercises.length, min: estimateMinutes(routine) })}</T>
        </View>

        <View style={{ gap: 12 }}>
          <T size={18} weight="600">{t('Distribución muscular')}</T>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {dist.map(([m, n]) => (
              <Card key={m} style={{ flex: 1, alignItems: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 4, borderRadius: 18 }}>
                <View style={{ width: 52, height: 52, borderRadius: 12, overflow: 'hidden', backgroundColor: '#070707' }}>
                  <Image source={muscleImages[m]} style={{ width: 52, height: 52 }} resizeMode="cover" accessibilityIgnoresInvertColors />
                </View>
                <T size={13} weight="500">{muscleLabel(m)}</T>
                <T size={13} weight="600" color="brand">{`${Math.round((n / all) * 100)}%`}</T>
              </Card>
            ))}
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <T size={20} weight="700">{t('{{n}} ejercicios', { n: routine.exercises.length })}</T>
          <Pressable accessibilityRole="button" accessibilityLabel={t('Añadir ejercicio')} onPress={() => router.push({ pathname: '/routines/add', params: { routineId: routine.id, save: '1' } })} style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' }}>
            <Plus size={22} color={colors.textPrimary} />
          </Pressable>
        </View>

        <View>
          {routine.exercises.map((e, i) => {
            const ex = exerciseById(e.exerciseId);
            return (
              <View key={`${e.exerciseId}-${i}`} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 8 }}>
                <View style={{ width: 64, height: 64, borderRadius: 16, overflow: 'hidden', backgroundColor: '#070707', borderWidth: 1, borderColor: colors.divider }}>
                  {ex.muscles[0] ? <Image source={muscleImages[ex.muscles[0]]} style={{ width: 64, height: 64 }} resizeMode="cover" accessibilityIgnoresInvertColors /> : null}
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <T size={13} color="secondary">{t('{{sets}} series × {{reps}} reps', { sets: e.sets, reps: e.reps })}</T>
                  <T size={16} weight="500">{t(ex.name)}</T>
                </View>
                <Pressable accessibilityRole="button" accessibilityLabel={t('Reemplazar {{name}}', { name: t(ex.name) })} onPress={() => notify('info', t('Reemplazar ejercicio: disponible al editar la rutina'))} style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}>
                  <Repeat size={22} color={colors.textSecondary} />
                </Pressable>
              </View>
            );
          })}
        </View>
      </ScrollView>
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingBottom: 24, paddingTop: 16, backgroundColor: colors.bg }}>
        <Button label={active?.routineId === routine.id ? t('Continuar entrenamiento') : t('Empezar entrenamiento')} onPress={begin} icon={<Play size={20} color={colors.onBrand} fill={colors.onBrand} />} />
      </View>
    </SafeAreaView>
  );
}
