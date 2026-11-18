// Teoría: RF1 (crear y organizar rutinas, ordenables arrastrando) · RNF3 (confirmar al descartar cambios) · RNF1 (objetivos ≥ 48 dp).
import React, { useEffect, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronRight, GripVertical, Pencil, Plus, X } from 'lucide-react-native';
import { Button, T } from '../../components/ui';
import { exerciseById, WEEK_LETTERS } from '../../data/seed';
import { fmtNum } from '../../domain/format';
import { notify } from '../../services/alerts';
import { useTheme } from '../../theme/useTheme';
import { useDraft } from './draft';
import { DraggableList, ROW_H } from './DraggableList';
import { ExThumb } from './Thumb';
import { useTranslation } from 'react-i18next';

const unitFor = (g?: string) => (g === 'steps' ? 'pasos' : g === 'distance' ? 'km' : 'min');

export function RoutineEditScreen() {
  const { t } = useTranslation();
  const { colors, highContrast } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { draft, load, setName, toggleDay, move, save, isDirty, clear } = useDraft();
  const [scroll, setScroll] = useState(true);
  const dragEnd = useRef(0); // en web, soltar tras arrastrar también dispara «click»: se ignora durante un instante
  const [confirmExit, setConfirmExit] = useState(false);
  useEffect(() => { load(id); }, [id, load]);
  if (!draft) return null;

  const close = () => (isDirty() ? setConfirmExit(true) : (clear(), router.back()));
  const doSave = () => {
    if (!draft.name.trim()) { notify('error', t('Ponle un nombre al entrenamiento')); return; }
    if (draft.exercises.length === 0) { notify('error', t('Añade al menos un ejercicio')); return; }
    save();
    notify('info', t('Rutina guardada'));
    router.replace('/routines');
  };

  const border = { borderWidth: highContrast ? 2 : 1, borderColor: highContrast ? colors.border : colors.divider };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 }}>
        <Pressable accessibilityRole="button" accessibilityLabel={t('Cerrar')} onPress={close} style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}><X size={26} color={colors.textPrimary} /></Pressable>
        <T size={18} weight="600" accessibilityRole="header" style={{ flex: 1, textAlign: 'center' }}>{draft.isNew ? 'Nuevo entrenamiento' : 'Editar rutina'}</T>
        <Pressable accessibilityRole="button" accessibilityLabel={t('Guardar')} onPress={doSave} style={{ minWidth: 64, height: 48, alignItems: 'center', justifyContent: 'center' }}><T size={16} weight="600" color="brand">{t('Guardar')}</T></Pressable>
      </View>

      <ScrollView scrollEnabled={scroll} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 120, gap: 18 }}>
        <View style={{ gap: 8 }}>
          <T size={14} weight="500" color="secondary">{t('Nombre del entrenamiento')}</T>
          <View style={[{ height: 56, borderRadius: 16, backgroundColor: colors.card, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 8 }, border]}>
            <TextInput
              accessibilityLabel={t('Nombre del entrenamiento')} value={draft.name} onChangeText={setName} placeholder={t('Ej. Torso')} placeholderTextColor={colors.radioOff} maxLength={40}
              style={{ flex: 1, fontSize: 18, fontFamily: 'Inter_600SemiBold', color: colors.textPrimary, paddingVertical: 0 }}
            />
            <Pencil size={20} color={colors.textSecondary} />
          </View>
        </View>

        <View style={{ gap: 8 }}>
          <T size={14} weight="500" color="secondary">{t('Días de entrenamiento')}</T>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {WEEK_LETTERS.map((l, d) => {
              const on = draft.days.includes(d);
              return (
                <Pressable key={l} accessibilityRole="checkbox" accessibilityState={{ checked: on }} accessibilityLabel={t(['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'][d])} onPress={() => toggleDay(d)}
                  style={[{ width: 44, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? colors.brand : colors.card }, on ? null : border]}>
                  <T size={16} weight={on ? '700' : '500'} color={on ? colors.onBrand : 'secondary'}>{t(l)}</T>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <T size={18} weight="600">{t('Ejercicios · {{n}}', { n: draft.exercises.length })}</T>
            <T size={12} color={colors.radioOff}>{t('Arrastra para ordenar')}</T>
          </View>

          <DraggableList
            count={draft.exercises.length} onMove={move} onDragState={(d) => { setScroll(!d); if (!d) dragEnd.current = Date.now(); }}
            renderRow={(i, handle, dragging) => {
              const e = draft.exercises[i];
              const ex = exerciseById(e.exerciseId);
              const sub = ex.type === 'cardio' ? t('Objetivo: {{v}}', { v: `${fmtNum(e.target ?? 0)} ${t(unitFor(e.goal))}` }) : `${e.sets} × ${e.reps} · ${e.restSec} s · ${fmtNum(e.weight)} kg`;
              return (
                <Pressable
                  accessibilityRole="button" accessibilityLabel={t('{{name}}. {{sub}}. Posición {{i}} de {{n}}', { name: t(ex.name), sub, i: i + 1, n: draft.exercises.length })}
                  accessibilityActions={[{ name: 'moveUp', label: t('Subir') }, { name: 'moveDown', label: t('Bajar') }]}
                  onAccessibilityAction={(a) => { if (a.nativeEvent.actionName === 'moveUp' && i > 0) move(i, i - 1); if (a.nativeEvent.actionName === 'moveDown' && i < draft.exercises.length - 1) move(i, i + 1); }}
                  onPress={() => { if (Date.now() - dragEnd.current > 400) router.push({ pathname: '/routines/configure', params: { index: String(i) } }); }}
                  style={[{ height: ROW_H, borderRadius: 18, backgroundColor: colors.card, flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 4, paddingRight: 12, shadowColor: '#000', shadowOpacity: dragging ? 0.5 : 0, shadowRadius: 10 }, border, dragging ? { borderColor: colors.brand } : null]}
                >
                  <View {...handle} accessibilityLabel={t('Arrastrar para ordenar')} style={{ width: 40, height: ROW_H, alignItems: 'center', justifyContent: 'center' }}>
                    <GripVertical size={22} color={colors.textSecondary} />
                  </View>
                  <ExThumb ex={ex} size={56} />
                  <View style={{ flex: 1, gap: 2 }}>
                    <T size={15} weight="600" numberOfLines={2}>{t(ex.name)}</T>
                    <T size={13} color="secondary" numberOfLines={1}>{sub}</T>
                  </View>
                  <ChevronRight size={20} color={colors.textSecondary} />
                </Pressable>
              );
            }}
          />

          <Pressable accessibilityRole="button" accessibilityLabel={t('Añadir ejercicio')} onPress={() => router.push('/routines/add')}
            style={{ height: 56, borderRadius: 28, borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.brand, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Plus size={22} color={colors.brand} /><T size={16} weight="600" color="brand">{t('Añadir ejercicio')}</T>
          </Pressable>
        </View>
      </ScrollView>

      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingBottom: 24, paddingTop: 12, backgroundColor: colors.bg }}>
        <Button label={t('Guardar entrenamiento')} onPress={doSave} />
      </View>

      <Modal transparent animationType="fade" visible={confirmExit} onRequestClose={() => setConfirmExit(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 24 }}>
          <View style={{ backgroundColor: colors.card, borderRadius: 24, padding: 20, gap: 14 }}>
            <T size={20} weight="700" accessibilityRole="header">{t('¿Descartar los cambios?')}</T>
            <T size={15} color="secondary">{t('Has modificado el entrenamiento y todavía no lo has guardado.')}</T>
            <Button label={t('Descartar cambios')} variant="danger" onPress={() => { setConfirmExit(false); clear(); router.back(); }} />
            <Button label={t('Seguir editando')} variant="secondary" onPress={() => setConfirmExit(false)} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
