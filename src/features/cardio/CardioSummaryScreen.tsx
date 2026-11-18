// Cardio · Resumen (Figma 2063:133) — RF7 + RF8.
// Teoría (gamificación): se ve cuánto suma la sesión al rango de Cardio (insignia con forma propia, no solo color).
// Teoría (RNF3): «Descartar» se puede deshacer desde el aviso; al guardar, vibración y aviso si sube de rango.
import React from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, useRouter } from 'expo-router';
import { Clock, Flame, PersonStanding, Route } from 'lucide-react-native';
import { Button, Card, T } from '../../components/ui';
import { exerciseById } from '../../data/seed';
import { rankFromPoints } from '../../domain/ranks';
import { notify } from '../../services/alerts';
import { useCardio } from '../../store/cardio';
import { useTheme } from '../../theme/useTheme';
import { rankImages } from '../ranks/rankImages';
import { BottomActions } from '../gym/ui';
import { cardioKind } from './catalog';
import { fmtDate, fmtDec, fmtInt } from './format';

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <Card style={{ flex: 1, gap: 4, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 20 }}>
      {icon}
      <T size={20} weight="700">{value}</T>
      <T size={12} color="secondary">{label}</T>
    </Card>
  );
}

export function CardioSummaryScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const pending = useCardio((s) => s.pending);
  const total = useCardio((s) => s.points);

  if (!pending) return <Redirect href={'/entrenar' as never} />;
  const p = pending;
  const exercise = exerciseById(p.exerciseId) ?? exerciseById('caminata');
  const kind = cardioKind(p.exerciseId);
  const after = rankFromPoints(total + p.points);
  const minutes = Math.max(1, Math.round(p.activeMs / 60000));

  const leave = () => router.replace('/entrenar' as never);

  const save = () => {
    const before = rankFromPoints(useCardio.getState().points);
    useCardio.getState().savePending();
    const now = rankFromPoints(useCardio.getState().points);
    if (now.label !== before.label) notify('rango', `¡Subes a ${now.label} en Cardio!`);
    else notify('serie', 'Cardio guardado');
    leave();
  };

  const discard = () => {
    useCardio.getState().setPending(null);
    notify('info', 'Cardio descartado', {
      actionLabel: 'Deshacer',
      ms: 6000,
      onAction: () => {
        useCardio.getState().setPending(p);
        useCardio.getState().savePending();
        notify('serie', 'Cardio recuperado y guardado');
      },
    });
    leave();
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, gap: 14 }}>
        <View style={{ alignItems: 'center', gap: 8 }}>
          <Image source={kind.thumb} style={{ width: 64, height: 64, borderRadius: 32 }} accessibilityIgnoresInvertColors />
          <T size={26} weight="700" style={{ textAlign: 'center' }} accessibilityRole="header">Cardio completado</T>
          <T size={14} color="secondary" style={{ textAlign: 'center' }}>{exercise.name} · {fmtDate(p.date)}</T>
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Stat icon={<Clock size={18} color={colors.brand} />} value={`${minutes} min`} label="Duración" />
          {kind.usesSteps ? (
            <Stat icon={<PersonStanding size={18} color={colors.brand} />} value={fmtInt(p.steps)} label="Pasos" />
          ) : (
            <Stat icon={<Flame size={18} color={colors.brand} />} value={`${fmtInt(p.kcal)} kcal`} label="Aprox." />
          )}
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Stat icon={<Route size={18} color={colors.brand} />} value={`${fmtDec(p.distanceKm)} km`} label={kind.usesSteps ? 'Distancia' : 'Distancia aprox.'} />
          {kind.usesSteps ? <Stat icon={<Flame size={18} color={colors.brand} />} value={`${fmtInt(p.kcal)} kcal`} label="Aprox." /> : <View style={{ flex: 1 }} />}
        </View>
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 22, borderWidth: 1.5, borderColor: colors.brand }}>
          <Image source={rankImages[after.tier]} style={{ width: 44, height: 44 }} resizeMode="contain" accessible accessibilityLabel={`Rango ${after.label}`} />
          <View style={{ flex: 1, gap: 2 }}>
            <T size={15} weight="700">Suma a tu rango de Cardio</T>
            <T size={13} color="secondary">{after.label} · +{fmtInt(p.points)} puntos esta sesión</T>
          </View>
        </Card>
      </ScrollView>
      <BottomActions>
        <Button label="Guardar cardio" onPress={save} />
        {/* Acción destructiva: texto rojo + palabra explícita (no solo color), y se puede deshacer */}
        <Pressable accessibilityRole="button" accessibilityLabel="Descartar" onPress={discard} style={({ pressed }) => ({ minHeight: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.divider, opacity: pressed ? 0.85 : 1 })}>
          <T size={17} weight="600" color={colors.danger}>Descartar</T>
        </Pressable>
      </BottomActions>
    </SafeAreaView>
  );
}
