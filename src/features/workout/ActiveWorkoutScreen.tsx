// Teoría: RF5/RF6 — registro con un toque, peso deslizando, descanso integrado en la misma pantalla (no hay pantalla de descanso).
// Teoría: RNF3 — borrar deslizando hacia un lado con «Deshacer»; terminar pide confirmación.
import React, { useEffect, useRef, useState } from 'react';
import { Image, Modal, PanResponder, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Check, ChevronDown, Footprints, Pencil, Play, Plus, Repeat, SkipForward, Timer, Trash2 } from 'lucide-react-native';
import { Button, T } from '../../components/ui';
import { exerciseById } from '../../data/seed';
import { fmtClock, fmtNum } from '../../domain/format';
import { notify } from '../../services/alerts';
import { hapticTick } from '../../services/haptics';
import { useCardio, type CardioSession } from '../../store/cardio';
import { useWorkout, type ActiveExercise } from '../../store/workout';
import { useTheme } from '../../theme/useTheme';
import { ExThumb, muscleLabel } from '../routines/Thumb';
import { muscleImages } from './muscleImages';
import { ScrollLockContext, useScrollLock } from './scrollLock';
import { Wheel } from './Wheel';
import { useTranslation } from 'react-i18next';

function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), intervalMs); return () => clearInterval(id); }, [intervalMs]);
  return now;
}

/**
 * Fila de serie: se desliza hacia la izquierda para eliminar (con deshacer).
 * Teoría (visibilidad del estado + RNF3): mientras se arrastra aparece detrás un fondo rojo con papelera y el texto
 * «Eliminar» (el color nunca va solo); pasado el umbral cambia a «Suelta para eliminar» y da un toque háptico.
 */
const DELETE_THRESHOLD = 90;
function SetRow({ index, ex, selected, onRemove, children }: {
  index: number; ex: number; selected: boolean; onRemove: () => void; children: React.ReactNode;
}) {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const lock = useScrollLock();
  const [dx, setDx] = useState(0);
  const cb = useRef(onRemove); cb.current = onRemove;
  const lockRef = useRef(lock); lockRef.current = lock;
  const pan = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => g.dx < -10 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
    onPanResponderGrant: () => lockRef.current(true),
    onPanResponderMove: (_, g) => setDx(Math.min(0, g.dx)),
    onPanResponderRelease: (_, g) => { lockRef.current(false); if (g.dx < -DELETE_THRESHOLD) cb.current(); setDx(0); },
    onPanResponderTerminate: () => { lockRef.current(false); setDx(0); },
  })).current;

  const progress = Math.min(1, -dx / DELETE_THRESHOLD);
  const armed = -dx >= DELETE_THRESHOLD;
  const wasArmed = useRef(false);
  useEffect(() => { if (armed && !wasArmed.current) hapticTick(); wasArmed.current = armed; }, [armed]);
  const onDanger = isDark ? '#0B0B0D' : '#FFFFFF';

  return (
    <View key={`${ex}-${index}`} style={{ borderRadius: 20, overflow: 'hidden' }}>
      {dx < 0 ? (
        <View pointerEvents="none" style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: colors.danger, opacity: 0.55 + 0.45 * progress, justifyContent: 'center', alignItems: 'flex-end', paddingRight: 22 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <T size={14} weight="700" color={onDanger}>{armed ? t('Suelta para eliminar') : t('Eliminar')}</T>
            <Trash2 size={armed ? 28 : 22} color={onDanger} />
          </View>
        </View>
      ) : null}
      <View {...pan.panHandlers} accessibilityHint={t('Desliza hacia la izquierda para eliminar la serie')} style={{ transform: [{ translateX: dx }], backgroundColor: selected ? colors.card : colors.bg, borderRadius: 20 }}>
        {children}
      </View>
    </View>
  );
}

/**
 * Cardio dentro del entreno (contrato REPARTO §2.2): en vez de series/peso hay un objetivo y un botón que abre
 * /cardio/run (acelerómetro, de B). Al volver, la sesión guardada marca el ejercicio como hecho.
 */
function CardioPanel({ item, session, onStart }: { item: ActiveExercise; session?: CardioSession; onStart: () => void }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const goalText = item.goal === 'steps' ? t('{{n}} pasos', { n: fmtNum(item.target ?? 0) }) : item.goal === 'distance' ? `${fmtNum(item.target ?? 0)} km` : `${fmtNum(item.target ?? 30)} min`;
  return (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: 20, backgroundColor: colors.card, borderWidth: session ? 2 : 1, borderColor: session ? colors.brand : colors.divider }}>
        <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' }}>
          {session ? <Check size={26} color={colors.brand} strokeWidth={3} /> : <Footprints size={26} color={colors.brand} />}
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <T size={13} color="secondary">{session ? t('Completado') : t('Objetivo')}</T>
          <T size={18} weight="700">{session ? t('{{min}} min · {{steps}} pasos', { min: Math.max(1, Math.round(session.activeMs / 60000)), steps: fmtNum(session.steps) }) : goalText}</T>
        </View>
      </View>
      <Button label={session ? t('Repetir cardio') : t('Empezar cardio')} onPress={onStart} icon={<Play size={20} color={colors.onBrand} fill={colors.onBrand} />} />
    </View>
  );
}

export function ActiveWorkoutScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const a = useWorkout((s) => s.active);
  const restEndsAt = useWorkout((s) => s.restEndsAt);
  const { toggleSet, setWeight, setReps, addSet, removeSet, adjustRest, skipRest, finish, discard } = useWorkout.getState();
  const now = useNow();
  const [exIndex, setExIndex] = useState(0);
  const [scrollLocked, setScrollLocked] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const cardioSessions = useCardio((st) => st.sessions);
  const cardioDone = (id: string) => (a ? cardioSessions.find((x) => x.exerciseId === id && x.date >= a.startedAt) : undefined);

  // El aviso de fin de descanso lo gestiona services/notifications.ts (funciona aunque salgas de esta pantalla).
  // Al terminar el entreno `a` pasa a null y se navega al resumen; esta redirección solo es para cuando no hay entreno.
  const finishing = useRef(false);
  useEffect(() => { if (!a && !finishing.current) router.replace('/entrenar'); }, [a, router]);

  // Avance automático: al terminar (o saltar) el descanso de la última serie de un ejercicio, se pasa al siguiente
  // ejercicio pendiente. Teoría (menos pasos manuales con las manos ocupadas, RNF1); se avisa con un banner para que
  // el cambio no sea una sorpresa (visibilidad del estado del sistema).
  const prevRest = useRef(restEndsAt);
  useEffect(() => {
    const restEnded = prevRest.current !== null && restEndsAt === null;
    prevRest.current = restEndsAt;
    if (!restEnded || !a) return;
    const cur = a.items[exIndex];
    if (!cur || cur.sets.length === 0 || !cur.sets.every((x) => x.done)) return;
    const next = a.items.findIndex((it, i) => i > exIndex && !it.sets.every((x) => x.done));
    if (next < 0) return; // era el último ejercicio pendiente: se queda para terminar el entreno
    setExIndex(next);
    // Con un pequeño retraso para no pisar el aviso «Descanso terminado» (que sale justo ahora).
    const name = t(exerciseById(a.items[next].exerciseId).name);
    setTimeout(() => notify('info', t('Siguiente ejercicio · {{name}}', { name })), 1800);
  }, [restEndsAt]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!a) return null;

  const item = a.items[exIndex];
  const ex = exerciseById(item.exerciseId);
  const current = item.sets.findIndex((s) => !s.done);
  const remaining = restEndsAt ? Math.max(0, Math.ceil((restEndsAt - now) / 1000)) : 0;
  const totalRest = item.restSec;
  const elapsed = (now - a.startedAt) / 1000;

  const done = () => { finishing.current = true; const rec = finish(); if (rec) router.replace('/workout/summary'); else finishing.current = false; };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 8, paddingRight: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Pressable accessibilityRole="button" accessibilityLabel={t('Minimizar entreno')} onPress={() => router.replace('/entrenar')} style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}><ChevronDown size={28} color={colors.textPrimary} /></Pressable>
          <View>
            <T size={24} weight="700">{fmtClock(elapsed)}</T>
            <T size={12} color="secondary">{t('{{name}} · {{n}} de {{total}}', { name: t(a.name), n: exIndex + 1, total: a.items.length })}</T>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Pressable accessibilityRole="button" accessibilityLabel={t('Iniciar descanso')} onPress={() => useWorkout.setState({ restEndsAt: Date.now() + item.restSec * 1000 })} style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' }}><Timer size={24} color={colors.textPrimary} /></Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel={t('Terminar entreno')} onPress={() => setConfirm(true)} style={{ height: 48, paddingHorizontal: 20, borderRadius: 14, borderWidth: 1.5, borderColor: colors.radioOff, alignItems: 'center', justifyContent: 'center' }}>
            <T size={15} weight="600">{t('Terminar')}</T>
          </Pressable>
        </View>
      </View>

      <ScrollLockContext.Provider value={setScrollLocked}>
      <ScrollView scrollEnabled={!scrollLocked} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: restEndsAt ? 150 : 40, gap: 14 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, padding: 3 }}>
          {a.items.map((it, i) => {
            const itEx = exerciseById(it.exerciseId);
            const isCardio = itEx.type === 'cardio';
            const sel = i === exIndex;
            return (
              <Pressable key={i} accessibilityRole="button" accessibilityLabel={t('Ejercicio {{n}}: {{name}}', { n: i + 1, name: t(exerciseById(it.exerciseId).name) })} accessibilityState={{ selected: sel }} onPress={() => setExIndex(i)}
                style={{ width: 64, height: 64, borderRadius: 32, overflow: 'hidden', borderWidth: sel ? 3 : 1, borderColor: sel ? colors.brand : colors.divider, backgroundColor: '#070707' }}>
                <ExThumb ex={itEx} size={64} radius={0} />
                {(isCardio ? !!cardioDone(it.exerciseId) : it.sets.every((s) => s.done)) ? <View style={{ position: 'absolute', right: 2, bottom: 2, backgroundColor: colors.brand, borderRadius: 9, padding: 2 }}><Check size={12} color={colors.onBrand} strokeWidth={3} /></View> : null}
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={{ height: 166, borderRadius: 24, backgroundColor: '#070707', borderWidth: 1, borderColor: colors.divider, alignItems: 'center', justifyContent: 'center', gap: 6, overflow: 'hidden' }}>
          {ex.type === 'cardio' ? <ExThumb ex={ex} size={138} radius={16} /> : ex.muscles[0] ? <Image source={muscleImages[ex.muscles[0]]} style={{ width: '100%', height: 138 }} resizeMode="cover" accessibilityIgnoresInvertColors /> : null}
          <T size={13} weight="500" color="secondary">{ex.muscles.map(muscleLabel).join(' · ') || t('Cardio')}</T>
        </View>

        <T size={20} weight="700" accessibilityRole="header">{t(ex.name)}</T>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          {[{ l: 'Tutorial', I: Play }, { l: 'Reemplazar', I: Repeat }, { l: 'Notas', I: Pencil }].map(({ l, I }) => (
            <Pressable key={l} accessibilityRole="button" accessibilityLabel={t(l)} onPress={() => notify('info', t('{{what}}: próximamente', { what: t(l) }))} style={{ flex: 1, minHeight: 48, borderRadius: 22, backgroundColor: colors.surface2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <I size={16} color={colors.textPrimary} /><T size={13} weight="500">{t(l)}</T>
            </Pressable>
          ))}
        </View>

        {ex.type === 'cardio' ? (
          <CardioPanel item={item} session={cardioDone(item.exerciseId)} onStart={() => router.push({ pathname: '/cardio/run', params: { exerciseId: item.exerciseId, ...(item.goal ? { goal: item.goal } : {}), ...(item.target ? { target: String(item.target) } : {}) } } as never)} />
        ) : (
        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 8, alignItems: 'center' }}>
            <T size={11} weight="600" color={colors.radioOff} style={{ width: 32, textAlign: 'center' }}>{t('SERIE')}</T>
            <T size={11} weight="600" color={colors.radioOff} style={{ flex: 1, textAlign: 'center' }}>{t('PREVIA')}</T>
            <T size={11} weight="600" color={colors.radioOff} style={{ width: 76, textAlign: 'center' }}>{t('KG')}</T>
            <T size={11} weight="600" color={colors.radioOff} style={{ width: 76, textAlign: 'center' }}>{t('REPS')}</T>
            <View style={{ width: 48 }} />
          </View>
          {item.sets.map((s, i) => {
            const isCur = i === current;
            return (
              <SetRow key={i} index={i} ex={exIndex} selected={isCur} onRemove={() => removeSet(exIndex, i)}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 8, borderRadius: 20, backgroundColor: isCur ? colors.card : 'transparent', borderWidth: isCur ? 2 : 0, borderColor: colors.brand }}>
                  <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: isCur ? colors.brand : colors.surface2, alignItems: 'center', justifyContent: 'center' }}>
                    <T size={15} weight="700" color={isCur ? colors.onBrand : colors.textPrimary}>{i + 1}</T>
                  </View>
                  <T size={13} color="secondary" numberOfLines={1} style={{ flex: 1, textAlign: 'center' }}>{`${fmtNum(s.weight)}×${s.reps}`}</T>
                  <Wheel value={s.weight} step={2.5} label={t('Peso de la serie {{n}}', { n: i + 1 })} suffix=" kg" active={isCur && !s.done} onChange={(v) => setWeight(exIndex, i, v)} />
                  <Wheel value={s.reps} step={1} min={1} label={t('Repeticiones de la serie {{n}}', { n: i + 1 })} active={isCur && !s.done} onChange={(v) => setReps(exIndex, i, v)} />
                  <Pressable
                    accessibilityRole="checkbox" accessibilityState={{ checked: s.done }} accessibilityLabel={t('Completar serie {{n}}', { n: i + 1 })}
                    onPress={() => toggleSet(exIndex, i)}
                    style={{ width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: s.done ? colors.brand : isCur ? 'transparent' : colors.surface2, borderWidth: isCur && !s.done ? 2 : 0, borderColor: colors.brand }}>
                    <Check size={24} color={s.done ? colors.onBrand : isCur ? colors.brand : colors.radioOff} strokeWidth={3} />
                  </Pressable>
                </View>
              </SetRow>
            );
          })}
          <Pressable accessibilityRole="button" accessibilityLabel={t('Añadir serie')} onPress={() => addSet(exIndex)} style={{ height: 48, borderRadius: 16, backgroundColor: colors.surface2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Plus size={20} color={colors.brand} /><T size={15} weight="600" color="brand">{t('Añadir serie')}</T>
          </Pressable>
        </View>
        )}
      </ScrollView>
      </ScrollLockContext.Provider>

      {restEndsAt ? (
        <View accessibilityLiveRegion="polite" style={{ position: 'absolute', left: 20, right: 20, bottom: 24, backgroundColor: colors.card, borderRadius: 20, borderWidth: 1.5, borderColor: 'rgba(48,226,202,0.5)', paddingHorizontal: 14, paddingVertical: 12, gap: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ flex: 1, minWidth: 96 }}>
              <T size={10} weight="600" color="secondary" numberOfLines={1} style={{ letterSpacing: 0.8 }}>{t('DESCANSO')}</T>
              <T size={28} weight="700" numberOfLines={1}>{fmtClock(remaining)}</T>
            </View>
            {[-15, 15].map((d) => (
              <Pressable key={d} accessibilityRole="button" accessibilityLabel={d > 0 ? t('Añadir 15 segundos') : t('Quitar 15 segundos')} onPress={() => adjustRest(d)} style={{ minHeight: 48, paddingHorizontal: 10, borderRadius: 14, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' }}>
                <T size={15} weight="600">{d > 0 ? '+15 s' : '−15 s'}</T>
              </Pressable>
            ))}
            <Pressable accessibilityRole="button" accessibilityLabel={t('Saltar descanso')} onPress={skipRest} style={{ minHeight: 48, paddingHorizontal: 12, borderRadius: 14, backgroundColor: colors.brand, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <SkipForward size={18} color={colors.onBrand} /><T size={15} weight="600" color={colors.onBrand}>{t('Saltar')}</T>
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
            <T size={20} weight="700" accessibilityRole="header">{t('¿Terminar el entreno?')}</T>
            <T size={15} color="secondary">{t('Se guardarán las series que hayas completado.')}</T>
            <Button label={t('Terminar y guardar')} onPress={() => { setConfirm(false); done(); }} />
            <Button label={t('Descartar entreno')} variant="danger" onPress={() => { setConfirm(false); discard(); }} />
            <Button label={t('Seguir entrenando')} variant="secondary" onPress={() => setConfirm(false)} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
