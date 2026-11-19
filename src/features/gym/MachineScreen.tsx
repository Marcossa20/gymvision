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
import { useRanksDemo } from '../ranks/data';
import { fmtWeight } from '../profile/format';
import { BottomActions, ScreenBar, StatusPill } from './ui';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';

interface LastSession { weight: number; reps: number; sets: number; when: string }

const when = (t: number) => {
  const d = Math.floor((Date.now() - t) / 86400000);
  return d <= 0 ? i18n.t('Hoy') : d === 1 ? i18n.t('Ayer') : i18n.t('Hace {{n}} días', { n: d });
};

/** Última sesión de ese ejercicio (historial de Entrenar) o, en modo demostración, un ejemplo como el del Figma. */
function useLastSession(exerciseId: string): LastSession | null {
  const last = useWorkout((s) => s.lastSets[exerciseId]);
  const demo = useRanksDemo((s) => s.demo);
  if (last && last.sets.length) {
    const top = last.sets.reduce((a, b) => (b.weight > a.weight ? b : a));
    return { weight: top.weight, reps: top.reps, sets: last.sets.length, when: when(last.date) };
  }
  return demo ? { weight: 32, reps: 12, sets: 3, when: i18n.t('Hace {{n}} días', { n: 2 }) } : null;
}

export function MachineScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { code } = useLocalSearchParams<{ code: string }>();
  const r = lookupMachine(code ?? '');
  const points = useWorkout((s) => (r.ok ? s.points[r.exercise.id] : undefined));

  if (!r.ok) return <Redirect href={{ pathname: '/gym/manual', params: { code: r.code ?? code ?? '', error: '1' } } as never} />;
  const ex = r.exercise;
  const rank = points !== undefined && points > 0 ? rankFromPoints(points) : null;
  const name = t(ex.name).replace(/\s*\((máquina|machine)\)\s*$/i, '');

  const last = useLastSession(ex.id);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenBar title={t('Máquina encontrada')} icon="back" />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, gap: 16 }}>
        <StatusPill tone="brand" icon={<Check size={18} color={colors.brand} strokeWidth={2.5} />} label={t('Código {{code}} reconocido', { code: r.code })} />
        <Card style={{ borderRadius: 28, overflow: 'hidden' }}>
          <MuscleIllustration muscles={ex.muscles} width={width - 42} />
          <View style={{ paddingHorizontal: 20, paddingTop: 18, paddingBottom: 20, gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <T size={22} weight="700" style={{ flex: 1 }} accessibilityRole="header">{t('Máquina: {{name}}', { name })}</T>
              {rank ? (
                <Image source={rankImages[rank.tier]} style={{ width: 44, height: 44 }} resizeMode="contain" accessible accessibilityLabel={t('Rango {{label}}', { label: rank.label })} />
              ) : null}
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {ex.muscles.map((m) => (
                <View key={m} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: colors.surface2 }}>
                  <T size={13} weight="500">{t(MUSCLE_LABELS[m])}</T>
                </View>
              ))}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, backgroundColor: colors.surface2 }}>
              <History size={22} color={colors.brand} />
              <View style={{ flex: 1, gap: 2 }}>
                {last ? (
                  <>
                    <T size={15} weight="600">{t('Última vez: {{w}} × {{r}}', { w: fmtWeight(last.weight), r: last.reps })}</T>
                    <T size={12} color="secondary">{last.when} · {t('{{n}} series', { n: last.sets })}{rank ? ` · ${t('Rango {{label}}', { label: t(RANK_NAMES[rank.tier]) })}` : ''}</T>
                  </>
                ) : (
                  <>
                    <T size={15} weight="600">{t('Primera vez en esta máquina')}</T>
                    <T size={12} color="secondary">{rank ? t('Rango {{label}}', { label: rank.label }) : t('Sin rango todavía')}</T>
                  </>
                )}
              </View>
            </View>
          </View>
        </Card>
      </ScrollView>
      <BottomActions>
        <Button variant="secondary" label={t('No es esta máquina')} onPress={() => router.replace('/gym/scan' as never)} />
        <Button label={t('Abrir ejercicio')} onPress={() => router.replace(machineRoute(ex.id) as never)} icon={<ArrowRight size={22} color={colors.onBrand} />} />
      </BottomActions>
    </SafeAreaView>
  );
}

