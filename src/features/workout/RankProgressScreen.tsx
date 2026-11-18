// Teoría (RF8): rango con nombre + forma + barra de progreso; el color nunca va solo. Animación + háptica al subir.
import React, { useEffect } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button, Card, T } from '../../components/ui';
import { exerciseById } from '../../data/seed';
import { RANK_SHAPES, rankFromPoints } from '../../domain/ranks';
import { notify } from '../../services/alerts';
import { useWorkout } from '../../store/workout';
import { useRankColors, useTheme } from '../../theme/useTheme';

export function RankProgressScreen() {
  const { colors } = useTheme();
  const rankColors = useRankColors();
  const router = useRouter();
  const points = useWorkout((s) => s.points);
  const up = useWorkout((s) => s.rankedUp);
  const entries = Object.entries(points).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((t, [, p]) => t + p, 0);
  const general = rankFromPoints(Math.round(total / Math.max(1, entries.length)));

  useEffect(() => { if (up) notify('rango', `¡Subes a ${up.to}!`); }, [up]);

  const Bar = ({ tier, progress }: { tier: number; progress: number }) => (
    <View style={{ height: 8, borderRadius: 4, backgroundColor: colors.divider, overflow: 'hidden' }}>
      <View style={{ height: 8, width: `${Math.round(progress * 100)}%`, backgroundColor: rankColors[tier] }} />
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
        <T size={28} weight="700" accessibilityRole="header">Progreso de rango</T>
        <Card style={{ padding: 20, gap: 10, alignItems: 'center' }}>
          <T size={44} color={rankColors[general.tier]}>{RANK_SHAPES[general.tier]}</T>
          <T size={26} weight="700">{general.label}</T>
          <T size={14} color="secondary">{`${Math.round(general.progress * 100)} % hacia el siguiente rango`}</T>
          <View style={{ alignSelf: 'stretch' }}><Bar tier={general.tier} progress={general.progress} /></View>
        </Card>
        <T size={18} weight="600">Por ejercicio</T>
        {entries.length === 0 ? <T size={15} color="secondary">Completa series para conseguir tu primer rango.</T> : null}
        {entries.map(([id, p]) => {
          const r = rankFromPoints(p);
          return (
            <Card key={id} style={{ padding: 14, gap: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <T size={20} color={rankColors[r.tier]}>{RANK_SHAPES[r.tier]}</T>
                <T size={15} weight="500" style={{ flex: 1 }} numberOfLines={2}>{exerciseById(id).name}</T>
                <T size={14} weight="700">{r.label}</T>
              </View>
              <Bar tier={r.tier} progress={r.progress} />
            </Card>
          );
        })}
        <Button label="Listo" onPress={() => router.replace('/entrenar')} />
      </ScrollView>
    </SafeAreaView>
  );
}
