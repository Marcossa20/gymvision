// Teoría (retroalimentación + gamificación): cierre del entreno con datos clave, récords y músculos trabajados;
// una acción principal («Ver progreso de rango») y una secundaria (Gestalt: jerarquía visual).
import React from 'react';
import { Image, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Check, Clock, Dumbbell, Layers, Trophy } from 'lucide-react-native';
import { Button, Card, T } from '../../components/ui';
import { exerciseById } from '../../data/seed';
import { fmtDateLong, fmtDuration, fmtNum, fmtThousands } from '../../domain/format';
import { muscleLabel } from '../routines/Thumb';
import { useWorkout } from '../../store/workout';
import { useSettings } from '../../store/settings';
import { useTheme } from '../../theme/useTheme';
import { muscleImages } from './muscleImages';
import { useTranslation } from 'react-i18next';

export function SummaryScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const s = useWorkout((st) => st.lastSummary);
  const unit = useSettings((st) => st.unit);
  if (!s) return null;
  const records = s.records ?? [];
  const best = records[0];
  const stats = [
    { I: Clock, label: 'Duración', value: fmtDuration(s.durationMin) },
    { I: Dumbbell, label: 'Volumen total', value: `${fmtThousands(s.volume)} ${unit}` },
    { I: Layers, label: 'Series', value: String(s.sets) },
    { I: Trophy, label: 'Récords nuevos', value: String(records.length) },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 12, gap: 10, flexGrow: 1 }}>
        <View style={{ alignItems: 'center', gap: 8 }}>
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center' }}>
            <Check size={32} color={colors.onBrand} strokeWidth={3} />
          </View>
          <T size={26} weight="700" accessibilityRole="header">{t('Entreno completado')}</T>
          <T size={14} color="secondary">{t('{{name}} · {{date}}', { name: t(s.name), date: fmtDateLong(s.date) })}</T>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {stats.map(({ I, label, value }) => (
            <Card key={label} style={{ width: '48%', flexGrow: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 12, gap: 4 }}>
              <I size={18} color={colors.brand} />
              <T size={20} weight="700">{value}</T>
              <T size={12} color="secondary">{t(label)}</T>
            </Card>
          ))}
        </View>

        {best ? (
          <Card style={{ borderRadius: 22, paddingHorizontal: 16, paddingVertical: 14, gap: 4, borderColor: colors.brand, borderWidth: 1.5 }}>
            <T size={11} weight="600" color="brand">{t('NUEVO RÉCORD')}</T>
            <T size={16} weight="700">{t(exerciseById(best.exerciseId).name)}</T>
            <T size={13} color="secondary">{t('{{w}} {{unit}} × {{reps}}  ·  +{{d}} {{unit}} respecto a tu mejor marca', { w: fmtNum(best.weight), unit, reps: best.reps, d: fmtNum(best.delta) })}</T>
          </Card>
        ) : null}

        {s.muscles?.length ? (
          <Card style={{ borderRadius: 22, paddingHorizontal: 16, paddingVertical: 14, gap: 8 }}>
            <T size={14} weight="600">{t('Músculos trabajados')}</T>
            {s.muscles.map(({ muscle, pct }) => (
              <View key={muscle} accessible accessibilityLabel={t('{{m}}: {{pct}} por ciento', { m: muscleLabel(muscle), pct })} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ width: 26, height: 26, borderRadius: 7, overflow: 'hidden', backgroundColor: '#070707' }}>
                  <Image source={muscleImages[muscle]} style={{ width: 26, height: 26 }} resizeMode="cover" accessibilityIgnoresInvertColors />
                </View>
                <T size={13} weight="500" color="secondary" style={{ width: 82 }} numberOfLines={1}>{muscleLabel(muscle)}</T>
                <View style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: colors.divider, overflow: 'hidden' }}>
                  <View style={{ width: `${pct}%`, height: 6, backgroundColor: colors.brand }} />
                </View>
                <T size={13} weight="600" style={{ width: 40, textAlign: 'right' }}>{`${pct}%`}</T>
              </View>
            ))}
          </Card>
        ) : null}

        <View style={{ flex: 1, minHeight: 12 }} />
        <Button label={t('Ver progreso de rango')} onPress={() => router.replace('/workout/rank-progress')} icon={<Trophy size={20} color={colors.onBrand} />} />
        <Button label={t('Guardar y salir')} variant="secondary" onPress={() => router.replace('/entrenar')} />
      </ScrollView>
    </SafeAreaView>
  );
}
