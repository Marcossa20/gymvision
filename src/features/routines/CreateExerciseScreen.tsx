import React, { useState } from 'react';
import { Image, Pressable, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { Button, T } from '../../components/ui';
import type { Equipment, Muscle } from '../../data/seed';
import { notify } from '../../services/alerts';
import { useWorkout } from '../../store/workout';
import { useTheme } from '../../theme/useTheme';
import { muscleImages } from '../workout/muscleImages';
import { equipmentImages, equipmentLabels, muscleLabel } from './Thumb';

const MUSCLES = Object.keys(muscleImages) as Muscle[];
const EQUIPMENT = Object.keys(equipmentLabels) as Equipment[];

export function CreateExerciseScreen() {
  const { colors, highContrast } = useTheme();
  const router = useRouter();
  const add = useWorkout((s) => s.addCustomExercise);
  const [name, setName] = useState('');
  const [muscles, setMuscles] = useState<Muscle[]>([]);
  const [equip, setEquip] = useState<Equipment | null>(null);
  const border = { borderWidth: highContrast ? 2 : 1, borderColor: highContrast ? colors.border : colors.divider };
  const cardio = equip === 'cardio';

  const submit = () => {
    if (!name.trim()) return notify('error', 'Ponle un nombre al ejercicio');
    if (!equip) return notify('error', 'Elige el equipamiento');
    if (!cardio && muscles.length === 0) return notify('error', 'Elige al menos un músculo');
    add({ id: `custom-${Date.now()}`, name: name.trim(), muscles: cardio ? [] : muscles, equipment: equip, type: cardio ? 'cardio' : 'fuerza' });
    notify('info', 'Ejercicio creado');
    router.back();
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 }}>
        <Pressable accessibilityRole="button" accessibilityLabel="Volver" onPress={() => router.back()} style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}><ChevronLeft size={28} color={colors.textPrimary} /></Pressable>
        <T size={18} weight="600" accessibilityRole="header" style={{ flex: 1, textAlign: 'center' }}>Crear ejercicio</T>
        <View style={{ width: 48 }} />
      </View>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120, gap: 18 }}>
        <View style={{ gap: 8 }}>
          <T size={14} weight="500" color="secondary">Nombre del ejercicio</T>
          <TextInput accessibilityLabel="Nombre del ejercicio" value={name} onChangeText={setName} maxLength={60} placeholder="Ej. Remo en máquina Hammer" placeholderTextColor={colors.radioOff}
            style={[{ height: 56, borderRadius: 16, backgroundColor: colors.card, paddingHorizontal: 16, fontSize: 16, fontFamily: 'Inter_500Medium', color: colors.textPrimary }, border]} />
        </View>
        <View style={{ gap: 8 }}>
          <T size={14} weight="500" color="secondary">Equipamiento</T>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {EQUIPMENT.map((q) => {
              const on = equip === q;
              return (
                <Pressable key={q} accessibilityRole="radio" accessibilityState={{ selected: on }} accessibilityLabel={equipmentLabels[q]} onPress={() => setEquip(q)}
                  style={{ minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 10, borderRadius: 14, borderWidth: on ? 2 : 1, borderColor: on ? colors.brand : colors.divider, backgroundColor: colors.card }}>
                  <Image source={equipmentImages[q]} style={{ width: 32, height: 32, borderRadius: 8 }} accessibilityIgnoresInvertColors />
                  <T size={14} weight={on ? '700' : '500'}>{equipmentLabels[q]}</T>
                </Pressable>
              );
            })}
          </View>
        </View>
        {!cardio ? (
          <View style={{ gap: 8 }}>
            <T size={14} weight="500" color="secondary">Músculos que trabaja</T>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {MUSCLES.map((m) => {
                const on = muscles.includes(m);
                return (
                  <Pressable key={m} accessibilityRole="checkbox" accessibilityState={{ checked: on }} accessibilityLabel={muscleLabel(m)} onPress={() => setMuscles((s) => (on ? s.filter((x) => x !== m) : [...s, m]))}
                    style={{ minHeight: 48, justifyContent: 'center', paddingHorizontal: 14, borderRadius: 24, backgroundColor: on ? colors.brand : colors.card, borderWidth: on ? 0 : 1, borderColor: colors.divider }}>
                    <T size={14} weight={on ? '700' : '500'} color={on ? colors.onBrand : 'primary'}>{(on ? '✓ ' : '') + muscleLabel(m)}</T>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}
      </ScrollView>
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingBottom: 24, paddingTop: 12, backgroundColor: colors.bg }}>
        <Button label="Crear ejercicio" onPress={submit} />
      </View>
    </SafeAreaView>
  );
}
