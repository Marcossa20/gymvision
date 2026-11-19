// Crear ejercicio (Figma 2055:426) — RF1.
// Teoría (RNF3, prevención de errores): menús desplegables en vez de teclear (reconocer antes que recordar) y
// validación con aviso claro antes de seguir. «Configurar ejercicio» crea el ejercicio, lo añade a la rutina
// y abre su configuración (series, reps y descanso): un solo flujo, sin pasos sueltos.
import React, { useState } from 'react';
import { Image, Pressable, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronDown, ChevronLeft } from 'lucide-react-native';
import { Button, T } from '../../components/ui';
import type { Equipment, Muscle } from '../../data/seed';
import { notify } from '../../services/alerts';
import { useWorkout } from '../../store/workout';
import { useTheme } from '../../theme/useTheme';
import { muscleImages } from '../workout/muscleImages';
import { Sheet } from './AddExerciseScreen';
import { useDraft } from './draft';
import { equipmentImages, equipmentLabels, equipLabel, muscleLabel } from './Thumb';
import { useTranslation } from 'react-i18next';

const MUSCLES = Object.keys(muscleImages) as Muscle[];
const EQUIPMENT = Object.keys(equipmentLabels) as Equipment[];

export function CreateExerciseScreen() {
  const { t } = useTranslation();
  const { colors, highContrast } = useTheme();
  const router = useRouter();
  const add = useWorkout((s) => s.addCustomExercise);
  const [name, setName] = useState('');
  const [muscle, setMuscle] = useState<Muscle | null>(null);
  const [equip, setEquip] = useState<Equipment | null>(null);
  const [notes, setNotes] = useState('');
  const [focus, setFocus] = useState<null | 'name' | 'notes'>(null);
  const [sheet, setSheet] = useState<null | 'muscle' | 'equip'>(null);
  const border = { borderWidth: highContrast ? 2 : 1, borderColor: highContrast ? colors.border : colors.divider };
  const focusBorder = (f: 'name' | 'notes') => (focus === f ? { borderWidth: 2, borderColor: colors.brand } : border);
  const cardio = equip === 'cardio';

  const submit = () => {
    if (!name.trim()) return notify('error', t('Ponle un nombre al ejercicio'));
    if (!equip) return notify('error', t('Elige el equipamiento'));
    if (!cardio && !muscle) return notify('error', t('Elige el músculo principal'));
    const id = `custom-${Date.now()}`;
    add({ id, name: name.trim(), muscles: cardio || !muscle ? [] : [muscle], equipment: equip, type: cardio ? 'cardio' : 'fuerza', notes: notes.trim() || undefined });
    notify('info', t('Ejercicio creado'));
    // Se añade a la rutina que se está editando y se abre su configuración.
    const d = useDraft.getState();
    if (d.draft) {
      const index = d.draft.exercises.length;
      d.setSelection([...d.draft.exercises.map((e) => e.exerciseId), id]);
      if (notes.trim()) useDraft.getState().update(index, { notes: notes.trim() });
      router.replace({ pathname: '/routines/configure', params: { index: String(index) } });
    } else router.back();
  };

  const select = (label: string, onPress: () => void, left: React.ReactNode, value: string | null, placeholder: string) => (
    <Pressable accessibilityRole="button" accessibilityLabel={`${label}: ${value ?? placeholder}`} onPress={onPress}
      style={[{ minHeight: 60, borderRadius: 16, backgroundColor: colors.card, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12 }, border]}>
      {left}
      <T size={16} weight="600" color={value ? 'primary' : 'secondary'} style={{ flex: 1 }}>{value ?? placeholder}</T>
      <ChevronDown size={20} color={colors.textSecondary} />
    </Pressable>
  );
  const thumb = (src: number | undefined, round?: boolean) => (
    <View style={{ width: 44, height: 44, borderRadius: round ? 22 : 12, overflow: 'hidden', backgroundColor: colors.surface2 }}>
      {src !== undefined ? <Image source={src} style={{ width: 44, height: 44 }} accessibilityIgnoresInvertColors /> : null}
    </View>
  );

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 }}>
        <Pressable accessibilityRole="button" accessibilityLabel={t('Volver')} onPress={() => router.back()} style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}><ChevronLeft size={28} color={colors.textPrimary} /></Pressable>
        <T size={18} weight="600" accessibilityRole="header" style={{ flex: 1, textAlign: 'center' }}>{t('Crear ejercicio')}</T>
        <View style={{ width: 48 }} />
      </View>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120, gap: 18 }}>
        <View style={{ gap: 8 }}>
          <T size={14} weight="500" color="secondary">{t('Nombre del ejercicio')}</T>
          <TextInput accessibilityLabel={t('Nombre del ejercicio')} value={name} onChangeText={setName} maxLength={60} placeholder={t('Ej. Remo en máquina Hammer')} placeholderTextColor={colors.radioOff}
            onFocus={() => setFocus('name')} onBlur={() => setFocus(null)} selectionColor={colors.brand}
            style={[{ height: 56, borderRadius: 16, backgroundColor: colors.card, paddingHorizontal: 16, fontSize: 16, fontFamily: 'Inter_500Medium', color: colors.textPrimary }, focusBorder('name')]} />
        </View>
        {!cardio ? (
          <View style={{ gap: 8 }}>
            <T size={14} weight="500" color="secondary">{t('Músculo principal')}</T>
            {select(t('Músculo principal'), () => setSheet('muscle'), thumb(muscle ? (muscleImages[muscle] as number) : undefined, true), muscle ? muscleLabel(muscle) : null, t('Elige un músculo'))}
          </View>
        ) : null}
        <View style={{ gap: 8 }}>
          <T size={14} weight="500" color="secondary">{t('Equipamiento')}</T>
          {select(t('Equipamiento'), () => setSheet('equip'), thumb(equip ? (equipmentImages[equip] as number) : undefined, true), equip ? equipLabel(equip) : null, t('Elige el equipamiento'))}
        </View>
        <View style={{ gap: 8 }}>
          <T size={14} weight="500" color="secondary">{t('Notas (opcional)')}</T>
          <TextInput accessibilityLabel={t('Notas (opcional)')} value={notes} onChangeText={setNotes} maxLength={200} multiline textAlignVertical="top" placeholder={t('Ej. Pausa de 1 s abajo, banco a 30°')} placeholderTextColor={colors.radioOff}
            onFocus={() => setFocus('notes')} onBlur={() => setFocus(null)} selectionColor={colors.brand}
            style={[{ minHeight: 96, borderRadius: 16, backgroundColor: colors.card, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 14, fontSize: 15, fontFamily: 'Inter_400Regular', color: colors.textPrimary }, focusBorder('notes')]} />
        </View>
      </ScrollView>
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingBottom: 24, paddingTop: 12, backgroundColor: colors.bg }}>
        <Button label={t('Configurar ejercicio')} onPress={submit} />
      </View>

      <Sheet title={t('Músculo principal')} visible={sheet === 'muscle'} onClose={() => setSheet(null)}>
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
