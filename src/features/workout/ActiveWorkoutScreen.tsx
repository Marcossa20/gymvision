// Teoría: RF5/RF6 — registro con un toque, peso deslizando, descanso integrado en la misma pantalla (no hay pantalla de descanso).
// Teoría: RNF3 — borrar deslizando hacia un lado con «Deshacer»; terminar pide confirmación.
import React, { useEffect, useRef, useState } from 'react';
import { Image, Modal, PanResponder, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Check, ChevronDown, Pencil, Play, Plus, Repeat, SkipForward, Timer } from 'lucide-react-native';
import { Button, T } from '../../components/ui';
import { exerciseById } from '../../data/seed';
import { fmtClock, fmtNum } from '../../domain/format';
import { notify } from '../../services/alerts';
import { useWorkout } from '../../store/workout';
import { useTheme } from '../../theme/useTheme';
import { muscleImages } from './muscleImages';
import { Wheel } from './Wheel';

function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), intervalMs); return () => clearInterval(id); }, [intervalMs]);
  return now;
}

/** Fila de serie: se desliza hacia la izquierda para eliminar (con deshacer). */
function SetRow({ index, ex, selected, onToggle, onRemove, children }: {
  index: number; ex: number; selected: boolean; onToggle: () => void; onRemove: () => void; children: React.ReactNode;
}) {
  const [dx, setDx] = useState(0);
  const cb = useRef(onRemove); cb.current = onRemove;
  const pan = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => g.dx < -10 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
    onPanResponderMove: (_, g) => setDx(Math.min(0, g.dx)),
    onPanResponderRelease: (_, g) => { if (g.dx < -90) cb.current(); setDx(0); },
    onPanResponderTerminate: () => setDx(0),
  })).current;
  return (
    <View {...pan.panHandlers} accessibilityHint="Desliza hacia la izquierda para eliminar la serie" style={{ transform: [{ translateX: dx }] }} key={`${ex}-${index}`}>
      {children}
    </View>
  );
}

export function ActiveWorkoutScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const a = useWorkout((s) => s.active);
  const restEndsAt = useWorkout((s) => s.restEndsAt);
  const { toggleSet, setWeight, setReps, addSet, removeSet, adjustRest, skipRest, finish, discard } = useWorkout.getState();
  const now = useNow();
  const [exIndex, setExIndex] = useState(0);
  const [confirm, setConfirm] = useState(false);

  // El aviso de fin de descanso lo gestiona services/notifications.ts (funciona aunque salgas de esta pantalla).
  useEffect(() => { if (!a) router.replace('/entrenar'); }, [a, router]);
  if (!a) return null;

  const item = a.items[exIndex];
  const ex = exerciseById(item.exerciseId);
  const current = item.sets.findIndex((s) => !s.done);
  const remaining = restEndsAt ? Math.max(0, Math.ceil((restEndsAt - now) / 1000)) : 0;
  const totalRest = item.restSec;
  const elapsed = (now - a.startedAt) / 1000;

  const done = () => { const rec = finish(); if (rec) router.replace('/workout/summary'); };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 8, paddingRight: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Pressable accessibilityRole="button" accessibilityLabel="Minimizar entreno" onPress={() => router.replace('/entrenar')} style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}><ChevronDown size={28} color={colors.textPrimary} /></Pressable>
          <View>
            <T size={24} weight="700">{fmtClock(elapsed)}</T>
            <T size={12} color="secondary">{`${a.name} · ${exIndex + 1} de ${a.items.length}`}</T>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Pressable accessibilityRole="button" accessibilityLabel="Iniciar descanso" onPress={() => useWorkout.setState({ restEndsAt: Date.now() + item.restSec * 1000 })} style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' }}><Timer size={24} color={colors.textPrimary} /></Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Terminar entreno" onPress={() => setConfirm(true)} style={{ height: 48, paddingHorizontal: 20, borderRadius: 14, borderWidth: 1.5, borderColor: colors.radioOff, alignItems: 'center', justifyContent: 'center' }}>
            <T size={15} weight="600">Terminar</T>
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: restEndsAt ? 150 : 40, gap: 14 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, padding: 3 }}>
          {a.items.map((it, i) => {
            const m = exerciseById(it.exerciseId).muscles[0];
            const sel = i === exIndex;
            return (
              <Pressable key={i} accessibilityRole="button" accessibilityLabel={`Ejercicio ${i + 1}: ${exerciseById(it.exerciseId).name}`} accessibilityState={{ selected: sel }} onPress={() => setExIndex(i)}
                style={{ width: 64, height: 64, borderRadius: 32, overflow: 'hidden', borderWidth: sel ? 3 : 1, borderColor: sel ? colors.brand : colors.divider, backgroundColor: '#070707' }}>
                {m ? <Image source={muscleImages[m]} style={{ width: 64, height: 64 }} resizeMode="cover" accessibilityIgnoresInvertColors /> : null}
                {it.sets.every((s) => s.done) ? <View style={{ position: 'absolute', right: 2, bottom: 2, backgroundColor: colors.brand, borderRadius: 9, padding: 2 }}><Check size={12} color={colors.onBrand} strokeWidth={3} /></View> : null}
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={{ height: 166, borderRadius: 24, backgroundColor: '#070707', borderWidth: 1, borderColor: colors.divider, alignItems: 'center', justifyContent: 'center', gap: 6, overflow: 'hidden' }}>
          {ex.muscles[0] ? <Image source={muscleImages[ex.muscles[0]]} style={{ width: '100%', height: 138 }} resizeMode="cover" accessibilityIgnoresInvertColors /> : null}
          <T size={13} weight="500" color="secondary">{ex.muscles.map((m) => m.charAt(0).toUpperCase() + m.slice(1)).join(' · ') || 'Cardio'}</T>
        </View>

        <T size={20} weight="700" accessibilityRole="header">{ex.name}</T>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          {[{ l: 'Tutorial', I: Play }, { l: 'Reemplazar', I: Repeat }, { l: 'Notas', I: Pencil }].map(({ l, I }) => (
            <Pressable key={l} accessibilityRole="button" accessibilityLabel={l} onPress={() => notify('info', `${l}: próximamente`)} style={{ flex: 1, minHeight: 48, borderRadius: 22, backgroundColor: colors.surface2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <I size={16} color={colors.textPrimary} /><T size={13} weight="500">{l}</T>
            </Pressable>
          ))}
        </View>

        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 8, alignItems: 'center' }}>
            <T size={11} weight="600" color={colors.radioOff} style={{ width: 32, textAlign: 'center' }}>SERIE</T>
            <T size={11} weight="600" color={colors.radioOff} style={{ flex: 1, textAlign: 'center' }}>PREVIA</T>
            <T size={11} weight="600" color={colors.radioOff} style={{ width: 76, textAlign: 'center' }}>KG</T>
            <T size={11} weight="600" color={colors.radioOff} style={{ width: 76, textAlign: 'center' }}>REPS</T>
            <View style={{ width: 48 }} />
          </View>
          {item.sets.map((s, i) => {
            const isCur = i === current;
            return (
              <SetRow key={i} index={i} ex={exIndex} selected={isCur} onToggle={() => toggleSet(exIndex, i)} onRemove={() => removeSet(exIndex, i)}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 8, borderRadius: 20, backgroundColor: isCur ? colors.card : 'transparent', borderWidth: isCur ? 2 : 0, borderColor: colors.brand }}>
                  <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: isCur ? colors.brand : colors.surface2, alignItems: 'center', justifyContent: 'center' }}>
                    <T size={15} weight="700" color={isCur ? colors.onBrand : colors.textPrimary}>{i + 1}</T>
                  </View>
                  <T size={13} color="secondary" numberOfLines={1} style={{ flex: 1, textAlign: 'center' }}>{`${fmtNum(s.weight)}×${s.reps}`}</T>
                  <Wheel value={s.weight} step={2.5} label={`Peso de la serie ${i + 1}`} suffix=" kg" active={isCur && !s.done} onChange={(v) => setWeight(exIndex, i, v)} />
                  <Wheel value={s.reps} step={1} min={1} label={`Repeticiones de la serie ${i + 1}`} active={isCur && !s.done} onChange={(v) => setReps(exIndex, i, v)} />
                  <Pressable
                    accessibilityRole="checkbox" accessibilityState={{ checked: s.done }} accessibilityLabel={`Completar serie ${i + 1}`}
                    onPress={() => toggleSet(exIndex, i)}
                    style={{ width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: s.done ? colors.brand : isCur ? 'transparent' : colors.surface2, borderWidth: isCur && !s.done ? 2 : 0, borderColor: colors.brand }}>
                    <Check size={24} color={s.done ? colors.onBrand : isCur ? colors.brand : colors.radioOff} strokeWidth={3} />
                  </Pressable>
                </View>
              </SetRow>
            );
          })}
          <Pressable accessibilityRole="button" accessibilityLabel="Añadir serie" onPress={() => addSet(exIndex)} style={{ height: 48, borderRadius: 16, backgroundColor: colors.surface2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Plus size={20} color={colors.brand} /><T size={15} weight="600" color="brand">Añadir serie</T>
          </Pressable>
        </View>
      </ScrollView>

      {restEndsAt ? (
        <View accessibilityLiveRegion="polite" style={{ position: 'absolute', left: 20, right: 20, bottom: 24, backgroundColor: colors.card, borderRadius: 20, borderWidth: 1.5, borderColor: 'rgba(48,226,202,0.5)', paddingHorizontal: 14, paddingVertical: 12, gap: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ flex: 1, minWidth: 96 }}>
              <T size={10} weight="600" color="secondary" numberOfLines={1} style={{ letterSpacing: 0.8 }}>DESCANSO</T>
              <T size={28} weight="700" numberOfLines={1}>{fmtClock(remaining)}</T>
            </View>
            {[-15, 15].map((d) => (
              <Pressable key={d} accessibilityRole="button" accessibilityLabel={`${d > 0 ? 'Añadir' : 'Quitar'} 15 segundos`} onPress={() => adjustRest(d)} style={{ minHeight: 48, paddingHorizontal: 10, borderRadius: 14, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' }}>
                <T size={15} weight="600">{d > 0 ? '+15 s' : '−15 s'}</T>
              </Pressable>
            ))}
            <Pressable accessibilityRole="button" accessibilityLabel="Saltar descanso" onPress={skipRest} style={{ minHeight: 48, paddingHorizontal: 12, borderRadius: 14, backgroundColor: colors.brand, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <SkipForward size={18} color={colors.onBrand} /><T size={15} weight="600" color={colors.onBrand}>Saltar</T>
            </Pressable>
          </View>
          <View style={{ height: 5, borderRadius: 3, backgroundColor: colors.divider, overflow: 'hidden' }}>
            <View style={{ height: 5, width: `${Math.min(100, (remaining / Math.max(1, totalRest)) * 100)}%`, backgroundColor: colors.brand }} />
          </View>
        </View>
      ) : null}

      <Modal transparent animationType="fade" visible={confirm} onRequestClose={() => setConfirm(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 24 }}>
          <View style={{ backgroundColor: colors.card, borderRadius: 24, padding: 20, gap: 14 }}>
            <T size={20} weight="700" accessibilityRole="header">¿Terminar el entreno?</T>
            <T size={15} color="secondary">Se guardarán las series que hayas completado.</T>
            <Button label="Terminar y guardar" onPress={() => { setConfirm(false); done(); }} />
            <Button label="Descartar entreno" variant="danger" onPress={() => { setConfirm(false); discard(); }} />
            <Button label="Seguir entrenando" variant="secondary" onPress={() => setConfirm(false)} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
