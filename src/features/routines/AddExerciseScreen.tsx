// Teoría (RF1): al elegir un ejercicio se ve el rango del usuario o «sin rango» (reconocer antes que recordar).
// El rango siempre lleva forma + texto, no solo color (Reto 1).
import React, { useEffect, useMemo, useState } from 'react';
import { Image, Modal, Pressable, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Check, ChevronDown, ChevronLeft, Plus, Search } from 'lucide-react-native';
import { Button, T } from '../../components/ui';
import { exercises, type Equipment, type Muscle } from '../../data/seed';
import { RANK_SHAPES, rankFromPoints } from '../../domain/ranks';
import { useWorkout } from '../../store/workout';
import { useRankColors, useTheme } from '../../theme/useTheme';
import { muscleImages } from '../workout/muscleImages';
import { useDraft } from './draft';
import { equipmentImages, equipmentLabels, equipLabel, ExThumb, muscleLabel } from './Thumb';
import { useTranslation } from 'react-i18next';

const MUSCLES = Object.keys(muscleImages) as Muscle[];
const EQUIPMENT = Object.keys(equipmentLabels) as Equipment[];

export function Sheet({ title, visible, onClose, children }: { title: string; visible: boolean; onClose: () => void; children: React.ReactNode }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <Pressable accessibilityLabel={t('Cerrar')} onPress={onClose} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }} />
      <View style={{ backgroundColor: colors.card, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, maxHeight: '75%', gap: 12 }}>
        <T size={20} weight="700" accessibilityRole="header">{title}</T>
        <ScrollView contentContainerStyle={{ gap: 8, paddingBottom: 8 }}>{children}</ScrollView>
        <Button label={t('Cerrar')} variant="secondary" onPress={onClose} />
      </View>
    </Modal>
  );
}

export function AddExerciseScreen() {
  const { t } = useTranslation();
  const { colors, highContrast } = useTheme();
  const rankColors = useRankColors();
  const router = useRouter();
  const { routineId, save: saveParam } = useLocalSearchParams<{ routineId?: string; save?: string }>();
  const { draft, load, setSelection, save } = useDraft();
  const points = useWorkout((s) => s.points);
  const history = useWorkout((s) => s.history);
  const [query, setQuery] = useState('');
  const [muscle, setMuscle] = useState<Muscle | null>(null);
  const [equip, setEquip] = useState<Equipment | null>(null);
  const [sheet, setSheet] = useState<null | 'muscle' | 'equip'>(null);
  const [sel, setSel] = useState<string[] | null>(null);

  useEffect(() => { if (routineId) load(routineId); }, [routineId, load]);
  useEffect(() => { if (draft && sel === null) setSel(draft.exercises.map((e) => e.exerciseId)); }, [draft, sel]);
  // Un ejercicio recién creado entra en la rutina desde «Crear ejercicio»: se refleja aquí al volver.
  useEffect(() => {
    if (draft) setSel((s) => (s === null ? s : Array.from(new Set([...s, ...draft.exercises.map((e) => e.exerciseId)]))));
  }, [draft?.exercises.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return exercises.filter((e) => (!q || e.name.toLowerCase().includes(q)) && (!muscle || e.muscles.includes(muscle)) && (!equip || e.equipment === equip));
  }, [query, muscle, equip]);

  if (!draft || sel === null) return null;
  const filtering = !!query || !!muscle || !!equip;
  const recentIds = Array.from(new Set([...sel, ...Object.keys(points)]));
  const list = filtering ? filtered : exercises.filter((e) => recentIds.includes(e.id)).concat(exercises.filter((e) => !recentIds.includes(e.id)));
  const toggle = (id: string) => setSel((s) => (s!.includes(id) ? s!.filter((x) => x !== id) : [...s!, id]));
  const border = { borderWidth: highContrast ? 2 : 1, borderColor: highContrast ? colors.border : colors.divider };
  void history;

  const done = () => {
    setSelection(sel);
    if (saveParam === '1') save(); // llegada desde «Detalle de rutina»: se guarda directamente
    router.back();
  };

  const filterBtn = (label: string, active: boolean, onPress: () => void) => (
    <Pressable accessibilityRole="button" accessibilityLabel={t('Filtro {{name}}', { name: label })} accessibilityState={{ selected: active }} onPress={onPress}
      style={[{ flex: 1, minHeight: 48, borderRadius: 14, backgroundColor: active ? colors.card : colors.switchOff, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 8 }, active && { borderWidth: 2, borderColor: colors.brand }]}>
      <T size={15} weight={active ? '700' : '500'} numberOfLines={1}>{label}</T>
      <ChevronDown size={18} color={active ? colors.brand : colors.textPrimary} />
    </Pressable>
  );

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 }}>
        <Pressable accessibilityRole="button" accessibilityLabel={t('Volver')} onPress={() => router.back()} style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}><ChevronLeft size={28} color={colors.textPrimary} /></Pressable>
        <T size={18} weight="600" accessibilityRole="header" style={{ flex: 1, textAlign: 'center' }}>{t('Añadir ejercicio')}</T>
        <Pressable accessibilityRole="button" accessibilityLabel={t('Crear ejercicio')} onPress={() => router.push('/routines/create-exercise')} style={{ minWidth: 64, height: 48, alignItems: 'center', justifyContent: 'center' }}><T size={16} weight="600" color="brand">{t('Crear')}</T></Pressable>
      </View>

      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 120, gap: 14 }}>
        <View style={[{ height: 52, borderRadius: 16, backgroundColor: colors.card, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16 }, border]}>
          <Search size={20} color={colors.textSecondary} />
          <TextInput accessibilityLabel={t('Buscar ejercicio')} value={query} onChangeText={setQuery} placeholder={t('Buscar ejercicio')} placeholderTextColor={colors.radioOff} style={{ flex: 1, fontSize: 16, fontFamily: 'Inter_400Regular', color: colors.textPrimary, paddingVertical: 0 }} />
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {filterBtn(muscle ? muscleLabel(muscle) : t('Músculos'), !!muscle, () => setSheet('muscle'))}
          {filterBtn(equip ? equipLabel(equip) : t('Equipamiento'), !!equip, () => setSheet('equip'))}
        </View>
        <T size={20} weight="700" accessibilityRole="header">{filtering ? (equip === 'cardio' ? t('Resultados') : t('Resultados · {{n}}', { n: list.length })) : t('Recientes')}</T>
        {list.length === 0 ? <T size={15} color="secondary">{t('No hay ejercicios con ese filtro.')}</T> : null}
        <View style={{ gap: 8 }}>
          {list.map((e) => {
            const on = sel.includes(e.id);
            const r = points[e.id] !== undefined ? rankFromPoints(points[e.id]) : null;
            return (
              <Pressable key={e.id} accessibilityRole="checkbox" accessibilityState={{ checked: on }} accessibilityLabel={t('{{name}}. {{rank}}. {{state}}', { name: t(e.name), rank: r ? r.label : t('sin rango'), state: on ? t('Añadido') : t('No añadido') })} onPress={() => toggle(e.id)}
                style={[{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 8, borderRadius: 18, backgroundColor: colors.card }, on ? { borderWidth: 1.5, borderColor: colors.brand } : border]}>
                <ExThumb ex={e} size={56} />
                <View style={{ flex: 1, gap: 2 }}>
                  <T size={14} weight="600">{t(e.name)}</T>
                  <T size={13} color="secondary">{e.muscles.length ? e.muscles.map(muscleLabel).join(', ') : t('Cardio')}</T>
                </View>
                <View style={{ alignItems: 'center', minWidth: 52 }}>
                  <T size={r ? 20 : 15} color={r ? rankColors[r.tier] : colors.radioOff}>{r ? RANK_SHAPES[r.tier] : '–'}</T>
                  <T size={10.5} color="secondary" numberOfLines={1}>{r ? r.label : t('sin rango')}</T>
                </View>
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: on ? colors.brand : colors.switchOff, alignItems: 'center', justifyContent: 'center' }}>
                  {on ? <Check size={22} color={colors.onBrand} strokeWidth={3} /> : <Plus size={22} color={colors.textPrimary} />}
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingBottom: 24, paddingTop: 12, backgroundColor: colors.bg }}>
        <Button label={sel.length === 1 ? t('Listo · 1 ejercicio') : t('Listo · {{n}} ejercicios', { n: sel.length })} onPress={done} />
      </View>

      <Sheet title={t('Músculos')} visible={sheet === 'muscle'} onClose={() => setSheet(null)}>
        <Pressable accessibilityRole="radio" accessibilityState={{ selected: !muscle }} onPress={() => { setMuscle(null); setSheet(null); }} style={{ minHeight: 48, justifyContent: 'center' }}><T size={16} weight={!muscle ? '700' : '500'}>{t('Todos los músculos')}</T></Pressable>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {MUSCLES.map((m) => (
            <Pressable key={m} accessibilityRole="radio" accessibilityState={{ selected: muscle === m }} accessibilityLabel={muscleLabel(m)} onPress={() => { setMuscle(m); setSheet(null); }}
              style={{ width: '30%', alignItems: 'center', gap: 4, padding: 6, borderRadius: 14, borderWidth: muscle === m ? 2 : 1, borderColor: muscle === m ? colors.brand : colors.divider }}>
              <Image source={muscleImages[m]} style={{ width: 64, height: 64, borderRadius: 10 }} accessibilityIgnoresInvertColors />
              <T size={12} weight={muscle === m ? '700' : '500'} numberOfLines={1}>{muscleLabel(m)}</T>
            </Pressable>
          ))}
        </View>
      </Sheet>
      <Sheet title={t('Equipamiento')} visible={sheet === 'equip'} onClose={() => setSheet(null)}>
        <Pressable accessibilityRole="radio" accessibilityState={{ selected: !equip }} onPress={() => { setEquip(null); setSheet(null); }} style={{ minHeight: 48, justifyContent: 'center' }}><T size={16} weight={!equip ? '700' : '500'}>{t('Todo el equipamiento')}</T></Pressable>
        {EQUIPMENT.map((q) => (
          <Pressable key={q} accessibilityRole="radio" accessibilityState={{ selected: equip === q }} accessibilityLabel={equipLabel(q)} onPress={() => { setEquip(q); setSheet(null); }}
            style={{ minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 6, borderRadius: 14, borderWidth: equip === q ? 2 : 1, borderColor: equip === q ? colors.brand : colors.divider }}>
            <Image source={equipmentImages[q]} style={{ width: 52, height: 52, borderRadius: 10 }} accessibilityIgnoresInvertColors />
            <T size={16} weight={equip === q ? '700' : '500'}>{equipLabel(q)}</T>
          </Pressable>
        ))}
      </Sheet>
    </SafeAreaView>
  );
}
