import React from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Clock, Dumbbell, Layers, Trophy } from 'lucide-react-native';
import { Button, Card, T } from '../../components/ui';
import { fmtNum } from '../../domain/format';
import { useWorkout } from '../../store/workout';
import { useTheme } from '../../theme/useTheme';

export function SummaryScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const s = useWorkout((st) => st.lastSummary);
  const up = useWorkout((st) => st.rankedUp);
  const unit = 'kg';
  if (!s) return null;
  const stats = [
    { I: Clock, label: 'Duración', value: `${s.durationMin} min` },
    { I: Dumbbell, label: 'Volumen', value: `${fmtNum(s.volume)} ${unit}` },
    { I: Layers, label: 'Series', value: String(s.sets) },
  ];
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
        <T size={32} weight="700" accessibilityRole="header">¡Entreno completado!</T>
        <T size={16} color="secondary">{s.name}</T>
        <View style={{ gap: 12 }}>
          {stats.map(({ I, label, value }) => (
            <Card key={label} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 }}>
              <I size={24} color={colors.brand} />
              <T size={16} color="secondary" style={{ flex: 1 }}>{label}</T>
              <T size={22} weight="700">{value}</T>
            </Card>
          ))}
        </View>
        {up ? (
          <Card style={{ padding: 16, gap: 6, borderColor: colors.brand, borderWidth: 1.5 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}><Trophy size={24} color={colors.brand} /><T size={18} weight="700">¡Has subido de rango!</T></View>
            <T size={15} color="secondary">{`${up.from} → ${up.to}`}</T>
          </Card>
        ) : null}
        <Button label="Ver progreso de rango" onPress={() => router.replace('/workout/rank-progress')} />
        <Button label="Volver al inicio" variant="secondary" onPress={() => router.replace('/entrenar')} />
      </ScrollView>
    </SafeAreaView>
  );
}
