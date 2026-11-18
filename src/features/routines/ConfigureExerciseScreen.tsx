// Teoría (RF2): series, reps, peso y descanso con el mismo gesto de deslizar que en el entreno (consistencia).
// Cardio: un único objetivo (tiempo | pasos | distancia); «pasos» solo en Caminata y Correr (acelerómetro).
import React, { useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Minus, Plus, X } from 'lucide-react-native';
import { Button, T } from '../../components/ui';
import { exerciseById, type CardioGoal } from '../../data/seed';
import { fmtClock, fmtNum } from '../../domain/format';
import { notify } from '../../services/alerts';
import { useTheme } from '../../theme/useTheme';
import { ScrollLockContext } from '../workout/scrollLock';
import { Wheel } from '../workout/Wheel';
import { useDraft } from './draft';
import { ExThumb, muscleLabel } from './Thumb';

const goals: { id: CardioGoal; label: string; unit: string; step: number; min: number; def: number }[] = [
  { id: 'time', label: 'Tiempo', unit: 'min', step: 5, min: 5, def: 30 },
  { id: 'steps', label: 'Pasos', unit: 'pasos', step: 500, min: 500, def: 5000 },
  { id: 'distance', label: 'Distancia', unit: 'km', step: 0.5, min: 0.5, def: 3 },
];

export function ConfigureExerciseScreen() {
  const { colors, highContrast } = useTheme();
  const router = useRouter();
  const { index } = useLocalSearchParams<{ index: string }>();
  const i = Number(index);
  const { draft, update, remove, insert } = useDraft();
  const [scrollLocked, setScrollLocked] = useState(false);
  const e = draft?.exercises[i];
  if (!draft || !e) return null;
  const ex = exerciseById(e.exerciseId);
  const cardio = ex.type === 'cardio';
  const canSteps = ['caminata', 'correr'].includes(ex.id);
  const goal = goals.find((g) => g.id === (e.goal ?? 'time'))!;
  const border = { borderWidth: highContrast ? 2 : 1, borderColor: highContrast ? colors.border : colors.divider };
  const round = (b: number) => Math.round(b * 10) / 10;

  const quitar = () => {
    const removed = remove(i);
    router.back();
    if (removed) notify('info', 'Ejercicio quitado de la rutina', { actionLabel: 'Deshacer', onAction: () => insert(i, removed), ms: 5000 });
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 }}>
        <Pressable accessibilityRole="button" accessibilityLabel="Cerrar" onPress={() => router.back()} style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}><X size={26} color={colors.textPrimary} /></Pressable>
        <T size={18} weight="600" accessibilityRole="header" style={{ flex: 1, textAlign: 'center' }}>Configurar ejercicio</T>
        <Pressable accessibilityRole="button" accessibilityLabel="Guardar" onPress={() => router.back()} style={{ minWidth: 64, height: 48, alignItems: 'center', justifyContent: 'center' }}><T size={16} weight="600" color="brand">Guardar</T></Pressable>
      </View>
      <ScrollLockContext.Provider value={setScrollLocked}>
      <ScrollView scrollEnabled={!scrollLocked} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 120, gap: 16 }}>
        <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 12, borderRadius: 20, backgroundColor: colors.card }, border]}>
          <ExThumb ex={ex} size={72} radius={18} />
          <View style={{ flex: 1, gap: 4 }}>
            <T size={18} weight="700">{ex.name}</T>
            <T size={13} color="secondary">{ex.muscles.length ? ex.muscles.map(muscleLabel).join(' · ') : 'Cardio'}</T>
          </View>
        </View>

        {cardio ? (
          <>
            <View style={{ flexDirection: 'row', gap: 4, padding: 4, borderRadius: 14, backgroundColor: colors.switchOff }}>
              {goals.filter((g) => g.id !== 'steps' || canSteps).map((g) => {
                const sel = g.id === (e.goal ?? 'time');
                return (
                  <Pressable key={g.id} accessibilityRole="radio" accessibilityState={{ selected: sel }} accessibilityLabel={`Objetivo: ${g.label}`} onPress={() => update(i, { goal: g.id, target: g.def })}
                    style={{ flex: 1, minHeight: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: sel ? colors.brand : 'transparent' }}>
                    <T size={14} weight={sel ? '700' : '500'} color={sel ? colors.onBrand : 'secondary'}>{g.label}</T>
                  </Pressable>
                );
              })}
            </View>
            <View style={{ alignItems: 'center', gap: 8 }}>
              <T size={11} weight="600" color={colors.radioOff} style={{ letterSpacing: 0.66 }}>{`OBJETIVO (${goal.unit.toUpperCase()})`}</T>
              <Wheel active width="100%" height={128} valueSize={32} value={e.target ?? goal.def} step={goal.step} min={goal.min} label={`Objetivo en ${goal.unit}`} suffix={` ${goal.unit}`} onChange={(v) => update(i, { target: round(v) })} />
            </View>
          </>
        ) : (
          <>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {[
                { l: 'SERIES', v: e.sets, step: 1, min: 1, set: (v: number) => update(i, { sets: v }), f: (n: number) => String(n) },
                { l: 'REPS', v: e.reps, step: 1, min: 1, set: (v: number) => update(i, { reps: v }), f: (n: number) => String(n) },
                { l: 'PESO (KG)', v: e.weight, step: 2.5, min: 0, set: (v: number) => update(i, { weight: v }), f: fmtNum },
              ].map((w) => (
                <View key={w.l} style={{ flex: 1, alignItems: 'center', gap: 8 }}>
                  <T size={11} weight="600" color={colors.radioOff} style={{ letterSpacing: 0.66 }}>{w.l}</T>
                  <Wheel active width="100%" height={128} valueSize={32} value={w.v} step={w.step} min={w.min} format={w.f} label={w.l.toLowerCase()} onChange={w.set} />
                </View>
              ))}
            </View>

            <View style={[{ minHeight: 76, borderRadius: 20, backgroundColor: colors.card, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 18, paddingRight: 12, paddingVertical: 12 }, border]}>
              <View style={{ flexShrink: 1, gap: 2 }}>
                <T size={15} weight="600">Descanso</T>
                <T size={12} color="secondary">Se inicia al marcar la serie</T>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Pressable accessibilityRole="button" accessibilityLabel="Quitar 15 segundos de descanso" onPress={() => update(i, { restSec: Math.max(0, e.restSec - 15) })} style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: colors.switchOff, alignItems: 'center', justifyContent: 'center' }}><Minus size={22} color={colors.textPrimary} /></Pressable>
                <T size={22} weight="700" accessibilityRole="text">{fmtClock(e.restSec)}</T>
                <Pressable accessibilityRole="button" accessibilityLabel="Añadir 15 segundos de descanso" onPress={() => update(i, { restSec: e.restSec + 15 })} style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: colors.switchOff, alignItems: 'center', justifyContent: 'center' }}><Plus size={22} color={colors.textPrimary} /></Pressable>
              </View>
            </View>
          </>
        )}

        <View style={{ gap: 8 }}>
          <T size={14} weight="500" color="secondary">Notas</T>
          <TextInput
            accessibilityLabel="Notas del ejercicio" multiline value={e.notes ?? ''} onChangeText={(t) => update(i, { notes: t })} placeholder="Ej. Banco a 30°, asiento en la muesca 3" placeholderTextColor={colors.radioOff}
            style={[{ minHeight: 84, borderRadius: 16, backgroundColor: colors.card, padding: 16, fontSize: 15, fontFamily: 'Inter_400Regular', color: colors.textPrimary, textAlignVertical: 'top' }, border]}
          />
        </View>
        <Button label="Quitar de la rutina" variant="secondary" onPress={quitar} />
      </ScrollView>
      </ScrollLockContext.Provider>
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingBottom: 24, paddingTop: 12, backgroundColor: colors.bg }}>
        <Button label="Guardar ejercicio" onPress={() => router.back()} />
      </View>
    </SafeAreaView>
  );
}
