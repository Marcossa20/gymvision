// Detalle de entreno (Figma 2012:2).
// Teoría (reconocimiento + feedback): tabla serie / peso × reps con los récords marcados con icono + texto
// (no solo color); «Repetir entreno» reutiliza la rutina con un toque (eficiencia, menos memoria).
import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Dumbbell, Repeat, Trophy } from 'lucide-react-native';
import { Button, Card, T } from '../../components/ui';
import { routines } from '../../data/seed';
import { notify } from '../../services/alerts';
import { useProfile } from '../../store/profile';
import { useWorkout } from '../../store/workout';
import { useTheme } from '../../theme/useTheme';
import { MUSCLE_LABELS } from '../ranks/muscles';
import { fmtDuration, fmtInt, fmtLongDate, fmtWeight } from './format';
import { useHistory } from './history';
import { MuscleChip } from './ProfileScreen';

export function WorkoutDetailScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const name = useProfile((s) => s.name);
  const history = useHistory();
  const h = history.find((x) => x.id === id);
  if (!h) return <Redirect href={'/perfil' as never} />;

  const routine = routines.find((r) => r.name === h.name);
  const repeat = () => {
    if (!routine) return notify('error', 'No se encuentra la rutina de este entreno');
    // Acción pública del store de A (no se escriben history/points: contrato §2.3).
    useWorkout.getState().start(routine.id);
    router.push('/workout/active' as never);
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8 }}>
        <Pressable accessibilityRole="button" accessibilityLabel="Volver" onPress={() => (router.canGoBack() ? router.back() : router.replace('/perfil' as never))} style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}>
          <ArrowLeft size={28} color={colors.textPrimary} />
        </Pressable>
        <T size={19} weight="700" accessibilityRole="header">Detalle de entreno</T>
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 36 }}>
        <View style={{ gap: 6, paddingTop: 18 }}>
          <T size={14.5} weight="500" color="secondary">{name}</T>
          <T size={13} color="secondary">{fmtLongDate(h.date)}</T>
          <T size={26} weight="700">{h.name}</T>
        </View>
        <View style={{ flexDirection: 'row', paddingTop: 16 }}>
          {[['Tiempo', fmtDuration(h.durationMin)], ['Volumen', `${fmtInt(h.volume)} kg`], ['Series', String(h.sets)]].map(([l, v]) => (
            <View key={l} style={{ flex: 1, gap: 3 }}>
              <T size={13} color="secondary">{l}</T>
              <T size={20} weight="700">{v}</T>
            </View>
          ))}
        </View>
        {h.muscles.length ? <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingTop: 16 }}>{h.muscles.map((m) => <MuscleChip key={m} m={m} size="md" />)}</View> : null}
        <View style={{ paddingTop: 18 }}>
          <Button label="Repetir entreno" onPress={repeat} disabled={!routine} icon={<Repeat size={20} color={colors.onBrand} />} style={{ flexDirection: 'row-reverse', borderRadius: 16, minHeight: 52 }} />
        </View>

        <T size={11} weight="600" color="secondary" style={{ letterSpacing: 0.8, paddingTop: 26, paddingBottom: 10, paddingLeft: 4 }}>
          EJERCICIOS{h.exercises ? ` · ${h.exercises.length}` : ''}
        </T>
        {!h.exercises ? (
          <Card style={{ padding: 16, borderWidth: 0 }}>
            <T size={13} color="secondary">Este entreno no guarda el detalle de cada serie.</T>
          </Card>
        ) : (
          <View style={{ gap: 12 }}>
            {h.exercises.map((e) => {
              const vol = e.sets.reduce((a, s) => a + s.weight * s.reps, 0);
              return (
                <Card key={e.name} style={{ paddingHorizontal: 14, paddingTop: 14, paddingBottom: 12, gap: 10, borderWidth: 0 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={{ width: 52, height: 52, borderRadius: 12, backgroundColor: colors.divider, alignItems: 'center', justifyContent: 'center' }}>
                      <Dumbbell size={26} color={colors.brand} />
                    </View>
                    <View style={{ flex: 1, gap: 3 }}>
                      <T size={15.5} weight="700">{e.name}</T>
                      <T size={12.5} color="secondary">{MUSCLE_LABELS[e.muscle]} · {fmtInt(vol)} kg de volumen</T>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 14, paddingTop: 2 }}>
                    <T size={10.5} weight="600" color="secondary" style={{ width: 40, textAlign: 'center', letterSpacing: 0.7 }}>SERIE</T>
                    <T size={10.5} weight="600" color="secondary" style={{ flex: 1, letterSpacing: 0.7 }}>PESO × REPETICIONES</T>
                  </View>
                  {e.sets.map((s, i) => (
                    <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }} accessible accessibilityLabel={`Serie ${i + 1}: ${fmtWeight(s.weight)} por ${s.reps} repeticiones${s.record ? ', récord' : ''}`}>
                      <View style={{ width: 40, height: 38, borderRadius: 10, backgroundColor: colors.divider, alignItems: 'center', justifyContent: 'center' }}>
                        <T size={15} weight="700">{i + 1}</T>
                      </View>
                      <T size={17} weight="600" style={{ flex: 1 }}>{fmtWeight(s.weight)} × {s.reps} reps</T>
                      {s.record ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingLeft: 7, paddingRight: 9, paddingVertical: 4, borderRadius: 10, borderWidth: 1, borderColor: colors.brand, backgroundColor: colors.divider }}>
                          <Trophy size={13} color={colors.brand} />
                          <T size={12} weight="700" color="brand">Récord</T>
                        </View>
                      ) : null}
                    </View>
                  ))}
                </Card>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
