// Cardio · En curso (Figma 2063:88) — RF7.
// Teoría (El Ordenador, acelerómetro): en Caminata/Correr el cronómetro arranca y se pausa solo según
// detecte pasos; el usuario no toca nada con las manos ocupadas. Vibración breve + aviso visual al
// empezar/dejar de andar (feedback sin mirar, Reto 3). Números enormes = legibles de un vistazo (Reto 2).
// Teoría (RNF3): salir a mitad pide confirmación; «Terminar» lleva a un resumen que aún se puede descartar.
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Image, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useNavigation, usePreventRemove, useRouter } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';
import { Bike, Flame, Pause, PersonStanding, Play, Route } from 'lucide-react-native';
import { Button, Card, T } from '../../components/ui';
import { exerciseById } from '../../data/seed';
import { notify } from '../../services/alerts';
import { useStepCounter } from '../../services/accelerometer';
import { useCardio } from '../../store/cardio';
import { useProfile } from '../../store/profile';
import { useTheme } from '../../theme/useTheme';
import { alpha } from '../gym/ui';
import { cardioKind, cardioPointsFor, computeMetrics, goalProgress, type CardioGoal } from './catalog';
import { fmtClock, fmtDec, fmtInt } from './format';

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <Card style={{ flex: 1, gap: 4, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 20 }}>
      {icon}
      <T size={20} weight="700">{value}</T>
      <T size={12} color="secondary">{label}</T>
    </Card>
  );
}

/** Cronómetro manual (cardio sin pasos): solo avanza mientras no está en pausa. */
function useManualTimer(running: boolean) {
  const [ms, setMs] = useState(0);
  const last = useRef<number | null>(null);
  useEffect(() => {
    if (!running) { last.current = null; return; }
    last.current = Date.now();
    const t = setInterval(() => {
      const now = Date.now();
      setMs((v) => v + (now - (last.current ?? now)));
      last.current = now;
    }, 250);
    return () => clearInterval(t);
  }, [running]);
  return ms;
}

export function CardioRunScreen() {
  useKeepAwake();
  const { colors } = useTheme();
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams<{ exerciseId?: string; goal?: CardioGoal; target?: string }>();
  const exerciseId = params.exerciseId ?? 'caminata';
  const exercise = exerciseById(exerciseId) ?? exerciseById('caminata');
  const kind = cardioKind(exerciseId);
  const goal = params.goal && ['time', 'steps', 'distance'].includes(params.goal) ? params.goal : undefined;
  const target = params.target ? Number(params.target) : undefined;

  const [paused, setPaused] = useState(false);
  const [finished, setFinished] = useState(false);
  const goalNotified = useRef(false);
  const setPending = useCardio((s) => s.setPending);
  const heightCm = useProfile((s) => s.heightCm);

  const counter = useStepCounter({
    onWalkingChange: (w) => notify('cardio', w ? 'Movimiento detectado · cronómetro en marcha' : 'Sin movimiento · cronómetro en pausa'),
  });
  const manualMs = useManualTimer(!kind.usesSteps && !paused && !finished);

  // Arranque/pausa del acelerómetro
  useEffect(() => {
    if (!kind.usesSteps) return;
    if (paused || finished) counter.stop();
    else counter.start();
  }, [kind.usesSteps, paused, finished]); // eslint-disable-line react-hooks/exhaustive-deps

  // Inicio (cardio manual): 2 pulsos cortos
  useEffect(() => { if (!kind.usesSteps) notify('cardio', `${exercise.name} · cronómetro en marcha`); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const activeMs = kind.usesSteps ? counter.activeMs : manualMs;
  const m = computeMetrics(kind, activeMs, counter.steps, heightCm);
  const progress = goalProgress(goal, target, m);

  useEffect(() => {
    if (progress !== null && progress >= 1 && !goalNotified.current) {
      goalNotified.current = true;
      notify('cardio', '¡Objetivo cumplido!');
    }
  }, [progress]);

  usePreventRemove(!finished, ({ data }) => {
    Alert.alert('¿Salir sin guardar?', 'Perderás el registro de este cardio.', [
      { text: 'Seguir', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: () => navigation.dispatch(data.action) },
    ]);
  });

  const finish = () => {
    setFinished(true);
    counter.stop();
    setPending({ id: String(Date.now()), exerciseId: exercise.id, date: Date.now(), ...m, points: cardioPointsFor(m), goal, target });
    notify('cardio', 'Cardio terminado');
  };
  useEffect(() => { if (finished) router.replace('/cardio/summary' as never); }, [finished, router]);

  // Estado: punto + texto (el color nunca va solo)
  const moving = kind.usesSteps ? counter.walking : true;
  const state = paused ? 'Pausado' : kind.usesSteps ? (counter.walking ? 'Detectando movimiento' : counter.available === false ? 'Acelerómetro no disponible' : 'Esperando movimiento') : 'En marcha';
  const live = !paused && moving;

  // Tarjeta principal: la métrica del objetivo (en cardio con pasos, siempre los pasos)
  const main = kind.usesSteps || goal === 'steps'
    ? { value: fmtInt(m.steps), unit: 'pasos', goalText: goal === 'steps' && target ? ` · objetivo ${fmtInt(target)}` : '' }
    : goal === 'time'
      ? { value: fmtInt(activeMs / 60000), unit: 'min', goalText: target ? ` · objetivo ${fmtInt(target)}` : '' }
      : { value: fmtDec(m.distanceKm), unit: 'km', goalText: goal === 'distance' && target ? ` · objetivo ${fmtDec(target)}` : '' };
  const TitleIcon = exercise.id === 'bicicleta' ? Bike : PersonStanding;

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ flex: 1, paddingHorizontal: 20, paddingVertical: 12, gap: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TitleIcon size={22} color={colors.brand} />
          <T size={20} weight="700" accessibilityRole="header">{exercise.name}</T>
        </View>
        <View accessible accessibilityLiveRegion="polite" accessibilityLabel={state} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14, backgroundColor: live ? alpha(colors.brand, 0.14) : colors.card, borderWidth: live ? 0 : 1, borderColor: colors.divider }}>
          {live ? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.brand }} /> : <Pause size={10} color={colors.textSecondary} fill={colors.textSecondary} />}
          <T size={12} weight="600" color={live ? 'brand' : 'secondary'}>{state}</T>
        </View>

        <View style={{ alignItems: 'center', gap: 2 }} accessible accessibilityLabel={`Tiempo ${fmtClock(activeMs)}`}>
          <T size={72} weight="700" style={{ fontVariant: ['tabular-nums'] }}>{fmtClock(activeMs)}</T>
          <T size={12} weight="600" color="secondary">TIEMPO</T>
        </View>

        <Card style={{ alignItems: 'center', gap: 8, padding: 20, borderRadius: 26 }}>
          <T size={44} weight="700" color="brand" style={{ fontVariant: ['tabular-nums'] }}>{main.value}</T>
          <T size={14} color="secondary">{main.unit}{main.goalText}</T>
          {progress !== null ? (
            <View accessible accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }} style={{ alignSelf: 'stretch', height: 8, borderRadius: 4, backgroundColor: colors.divider, overflow: 'hidden' }}>
              <View style={{ width: `${progress * 100}%`, height: '100%', borderRadius: 4, backgroundColor: colors.brand }} />
            </View>
          ) : null}
        </Card>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Stat icon={<Route size={18} color={colors.brand} />} value={`${fmtDec(m.distanceKm)} km`} label={kind.usesSteps ? 'Distancia' : 'Distancia aprox.'} />
          <Stat icon={<Flame size={18} color={colors.brand} />} value={`${fmtInt(m.kcal)} kcal`} label="Aprox." />
        </View>

        <View style={{ flex: 1, minHeight: 80, borderRadius: 24, overflow: 'hidden' }}>
          <Image source={kind.image} resizeMode="cover" style={{ width: '100%', height: '100%' }} accessibilityIgnoresInvertColors />
        </View>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Button
            variant="secondary"
            label={paused ? 'Reanudar' : 'Pausar'}
            onPress={() => setPaused((p) => !p)}
            icon={paused ? <Play size={20} color={colors.textPrimary} /> : <Pause size={20} color={colors.textPrimary} />}
            style={{ flex: 1, flexDirection: 'row-reverse' }}
          />
          <Button label="Terminar" onPress={finish} style={{ flex: 1 }} />
        </View>
      </View>
    </SafeAreaView>
  );
}
