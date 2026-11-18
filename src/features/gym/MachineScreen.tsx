// Máquina encontrada (Figma 2048:2).
// Teoría (La Persona, errores — RNF3): confirmación antes de abrir — si la lectura fue a otra máquina,
// «No es esta máquina» vuelve a escanear sin perder nada. Feedback inmediato con el código reconocido.
// Contrato REPARTO §2.1: «Abrir ejercicio» navega a /workout/machine/<exerciseId> (pantalla de A).
import React from 'react';
import { Image, ScrollView, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowRight, Check, History } from 'lucide-react-native';
import { Button, Card, T } from '../../components/ui';
import { lookupMachine, machineRoute } from '../../services/qr';
import { useWorkout } from '../../store/workout';
import { rankFromPoints, RANK_NAMES } from '../../domain/ranks';
import { useTheme } from '../../theme/useTheme';
import { MuscleIllustration } from '../ranks/MuscleIllustration';
import { MUSCLE_LABELS } from '../ranks/muscles';
import { rankImages } from '../ranks/rankImages';
import { BottomActions, ScreenBar, StatusPill } from './ui';

interface LastSets { weight: number; reps: number; sets: number; daysAgo: number }
/** TODO(issue [para A]): el historial aún no guarda series por ejercicio; cuando exista, leerlo aquí. */
function lastSetsFor(_exerciseId: string): LastSets | null {
  return null;
}

export function MachineScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { code } = useLocalSearchParams<{ code: string }>();
  const r = lookupMachine(code ?? '');
  const points = useWorkout((s) => (r.ok ? s.points[r.exercise.id] : undefined));

  if (!r.ok) return <Redirect href={{ pathname: '/gym/manual', params: { code: r.code ?? code ?? '', error: '1' } } as never} />;
  const ex = r.exercise;
  const rank = points !== undefined && points > 0 ? rankFromPoints(points) : null;
  const name = ex.name.replace(/\s*\(máquina\)\s*$/i, '');

  const last = lastSetsFor(ex.id);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenBar title="Máquina encontrada" icon="back" />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, gap: 16 }}>
        <StatusPill tone="brand" icon={<Check size={18} color={colors.brand} strokeWidth={2.5} />} label={`Código ${r.code} reconocido`} />
        <Card style={{ borderRadius: 28, overflow: 'hidden' }}>
          <MuscleIllustration muscles={ex.muscles} width={width - 42} />
          <View style={{ paddingHorizontal: 20, paddingTop: 18, paddingBottom: 20, gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <T size={22} weight="700" style={{ flex: 1 }} accessibilityRole="header">Máquina: {name}</T>
              {rank ? (
                <Image source={rankImages[rank.tier]} style={{ width: 44, height: 44 }} resizeMode="contain" accessible accessibilityLabel={`Rango ${rank.label}`} />
              ) : null}
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {ex.muscles.map((m) => (
                <View key={m} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: colors.divider }}>
                  <T size={13} weight="500">{MUSCLE_LABELS[m]}</T>
                </View>
              ))}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, backgroundColor: colors.divider }}>
              <History size={22} color={colors.brand} />
              <View style={{ flex: 1, gap: 2 }}>
                {last ? (
                  <>
                    <T size={15} weight="600">Última vez: {last.weight} kg × {last.reps}</T>
                    <T size={12} color="secondary">Hace {last.daysAgo} días · {last.sets} series{rank ? ` · Rango ${RANK_NAMES[rank.tier]}` : ''}</T>
                  </>
                ) : (
                  <>
                    <T size={15} weight="600">Primera vez en esta máquina</T>
                    <T size={12} color="secondary">{rank ? `Rango ${rank.label}` : 'Sin rango todavía'}</T>
                  </>
                )}
              </View>
            </View>
          </View>
        </Card>
      </ScrollView>
      <BottomActions>
        <Button variant="secondary" label="No es esta máquina" onPress={() => router.replace('/gym/scan' as never)} />
        <Button label="Abrir ejercicio" onPress={() => router.replace(machineRoute(ex.id) as never)} icon={<ArrowRight size={22} color={colors.onBrand} />} />
      </BottomActions>
    </SafeAreaView>
  );
}

