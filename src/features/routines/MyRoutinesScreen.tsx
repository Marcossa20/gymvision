// Teoría (RNF3): eliminar pide confirmación explícita y además se puede deshacer; el menú se abre con pulsación larga
// y también con una acción de accesibilidad («Más opciones»).
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Calendar, ChevronLeft, Dumbbell, ChevronRight, Copy, EllipsisVertical, Pencil, Plus, Trash2 } from 'lucide-react-native';
import { Button, T } from '../../components/ui';
import { WEEK_LETTERS, WEEK_NAMES, type Routine } from '../../data/seed';
import { notify } from '../../services/alerts';
import { useWorkout } from '../../store/workout';
import { useTheme } from '../../theme/useTheme';
import { estimateMinutes } from '../workout/EntrenarScreen';
import { useDraft } from './draft';
import { ExThumb } from './Thumb';
import { alpha } from '../gym/ui';
import { exerciseById } from '../../data/seed';
import { useTranslation } from 'react-i18next';

type Mode = null | { kind: 'menu' | 'confirm' | 'days'; routine: Routine };

export function MyRoutinesScreen() {
  const { t } = useTranslation();
  const { colors, highContrast } = useTheme();
  const router = useRouter();
  const routines = useWorkout((s) => s.routines);
  const { deleteRoutine, restoreRoutine, duplicateRoutine, saveRoutine } = useWorkout.getState();
  const [mode, setMode] = useState<Mode>(null);
  const [days, setDays] = useState<number[]>([]);
  const border = { borderWidth: highContrast ? 2 : 1, borderColor: highContrast ? colors.border : colors.divider };
  const close = () => setMode(null);

  const eliminar = (r: Routine) => {
    deleteRoutine(r.id);
    close();
    notify('info', t('«{{name}}» eliminada', { name: r.name }), { actionLabel: t('Deshacer'), onAction: () => restoreRoutine(r), ms: 5000 });
  };

  const item = (icon: React.ReactNode, label: string, onPress: () => void, danger?: boolean) => (
    <Pressable accessibilityRole="button" accessibilityLabel={t(label)} onPress={onPress} style={{ minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
      {icon}<T size={17} weight="500" color={danger ? colors.danger : 'primary'}>{t(label)}</T>
    </Pressable>
  );

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 }}>
        <Pressable accessibilityRole="button" accessibilityLabel={t('Volver')} onPress={() => (router.canGoBack() ? router.back() : router.replace('/entrenar'))} style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}><ChevronLeft size={28} color={colors.textPrimary} /></Pressable>
        <T size={18} weight="600" accessibilityRole="header" style={{ flex: 1, textAlign: 'center' }}>{t('Mis rutinas')}</T>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 120, gap: 14 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <T size={20} weight="700">{routines.length === 1 ? t('1 rutina') : t('{{n}} rutinas', { n: routines.length })}</T>
          {routines.length ? <T size={13} color={colors.radioOff}>{t('Toca una para verla')}</T> : null}
        </View>

        {routines.length === 0 ? (
          <View style={{ alignItems: 'center', gap: 10, paddingTop: 120, paddingHorizontal: 12 }}>
            <View style={{ width: 88, height: 88, borderRadius: 44, backgroundColor: alpha(colors.brand, 0.14), alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
              <Dumbbell size={36} color={colors.brand} />
            </View>
            <T size={20} weight="700" style={{ textAlign: 'center' }}>{t('Aún no tienes rutinas')}</T>
            <T size={14} color="secondary" style={{ textAlign: 'center' }}>{t('Crea tu primera rutina: elige ejercicios, días y descansos. Funciona sin conexión.')}</T>
          </View>
        ) : null}

        <View style={{ gap: 10 }}>
          {routines.map((r) => {
            const first = exerciseById(r.exercises[0]?.exerciseId ?? 'press-inclinado');
            const sub = t('{{n}} ejercicios · {{min}} min', { n: r.exercises.length, min: estimateMinutes(r) });
            return (
              <Pressable
                key={r.id} accessibilityRole="button" accessibilityLabel={t('{{name}}. {{sub}}. {{days}}', { name: r.name, sub, days: r.days.length ? t('Días: {{list}}', { list: r.days.map((d) => t(WEEK_NAMES[d])).join(', ') }) : t('Sin día asignado') })}
                accessibilityActions={[{ name: 'more', label: t('Más opciones') }]} onAccessibilityAction={() => setMode({ kind: 'menu', routine: r })}
                onPress={() => router.push({ pathname: '/workout/[routineId]', params: { routineId: r.id } })} onLongPress={() => setMode({ kind: 'menu', routine: r })}
                style={[{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 12, borderRadius: 22, backgroundColor: colors.card }, border]}
              >
                <ExThumb ex={r.focus.length ? { muscles: [r.focus[0]], equipment: first.equipment } : first} size={76} radius={16} />
                <View style={{ flex: 1, gap: 6 }}>
                  <T size={18} weight="700">{t(r.name)}</T>
                  <T size={13} color="secondary">{sub}</T>
                  {r.days.length ? (
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                      {r.days.map((d) => (
                        <View key={d} style={{ width: 26, height: 26, borderRadius: 8, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center' }}>
                          <T size={12} weight="700" color={colors.onBrand}>{t(WEEK_LETTERS[d])}</T>
                        </View>
                      ))}
                    </View>
                  ) : <T size={12} weight="500" color={colors.radioOff}>{t('Sin día asignado')}</T>}
                </View>
                {/* Botón visible de «Más opciones» (editar, duplicar, días, eliminar): la pulsación larga no se descubre sola. */}
                <Pressable accessibilityRole="button" accessibilityLabel={t('Más opciones de {{name}}', { name: r.name })} onPress={() => setMode({ kind: 'menu', routine: r })}
                  style={{ width: 44, height: 48, alignItems: 'center', justifyContent: 'center' }}>
                  <EllipsisVertical size={22} color={colors.textSecondary} />
                </Pressable>
                <ChevronRight size={22} color={colors.textSecondary} />
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingBottom: 24, paddingTop: 12, backgroundColor: colors.bg }}>
        <Button label={routines.length === 0 ? t('Crea tu rutina') : t('Añadir rutina')} icon={routines.length === 0 ? undefined : <Plus size={22} color={colors.onBrand} />} onPress={() => { useDraft.getState().clear(); router.push({ pathname: '/routines/edit/[id]', params: { id: 'new' } }); }} />
      </View>

      {/* Menú de la rutina (hoja inferior) */}
      <Modal transparent animationType="slide" visible={mode?.kind === 'menu'} onRequestClose={close}>
        <Pressable accessibilityLabel={t('Cerrar menú')} onPress={close} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }} />
        {mode?.kind === 'menu' ? (
          <View style={{ backgroundColor: colors.card, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, paddingBottom: 28, gap: 4 }}>
            <T size={22} weight="700" accessibilityRole="header">{t(mode.routine.name)}</T>
            <T size={13} color="secondary" style={{ marginBottom: 8 }}>{t('{{n}} ejercicios', { n: mode.routine.exercises.length }) + (mode.routine.days.length ? ' · ' + mode.routine.days.map((d) => t(WEEK_LETTERS[d])).join(' / ') : '')}</T>
            {item(<Pencil size={22} color={colors.brand} />, 'Editar rutina', () => { const r = mode.routine; close(); useDraft.getState().clear(); router.push({ pathname: '/routines/edit/[id]', params: { id: r.id } }); })}
            {item(<Copy size={22} color={colors.brand} />, 'Duplicar', () => { duplicateRoutine(mode.routine.id); close(); notify('info', t('Rutina duplicada')); })}
            {item(<Calendar size={22} color={colors.brand} />, 'Cambiar días', () => { setDays(mode.routine.days); setMode({ kind: 'days', routine: mode.routine }); })}
            {item(<Trash2 size={22} color={colors.danger} />, 'Eliminar rutina', () => setMode({ kind: 'confirm', routine: mode.routine }), true)}
            <View style={{ height: 8 }} />
            <Button label={t('Cancelar')} variant="secondary" onPress={close} />
          </View>
        ) : null}
      </Modal>

      {/* Cambiar días */}
      <Modal transparent animationType="slide" visible={mode?.kind === 'days'} onRequestClose={close}>
        <Pressable accessibilityLabel={t('Cerrar')} onPress={close} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }} />
        {mode?.kind === 'days' ? (
          <View style={{ backgroundColor: colors.card, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, paddingBottom: 28, gap: 14 }}>
            <T size={20} weight="700" accessibilityRole="header">{t('Días de «{{name}}»', { name: mode.routine.name })}</T>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              {WEEK_LETTERS.map((l, d) => {
                const on = days.includes(d);
                return (
                  <Pressable key={l} accessibilityRole="checkbox" accessibilityState={{ checked: on }} accessibilityLabel={t(WEEK_NAMES[d])} onPress={() => setDays((s) => (on ? s.filter((x) => x !== d) : [...s, d].sort()))}
                    style={{ width: 42, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? colors.brand : colors.switchOff }}>
                    <T size={16} weight={on ? '700' : '500'} color={on ? colors.onBrand : 'secondary'}>{l}</T>
                  </Pressable>
                );
              })}
            </View>
            <Button label={t('Guardar días')} onPress={() => { saveRoutine({ ...mode.routine, days }); close(); notify('info', t('Días actualizados')); }} />
            <Button label={t('Cancelar')} variant="secondary" onPress={close} />
          </View>
        ) : null}
      </Modal>

      {/* Confirmar eliminación */}
      <Modal transparent animationType="fade" visible={mode?.kind === 'confirm'} onRequestClose={close}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', padding: 24 }}>
          {mode?.kind === 'confirm' ? (
            <View style={{ backgroundColor: colors.card, borderRadius: 24, padding: 20, gap: 12 }}>
              <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,107,122,0.15)', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={22} color={colors.danger} /></View>
              <T size={20} weight="700" accessibilityRole="header">{t('¿Eliminar «{{name}}»?', { name: mode.routine.name })}</T>
              <T size={15} color="secondary">{t('Se borrará de este móvil. Los entrenos que ya hiciste con ella se conservan en tu historial.')}</T>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Button label={t('Cancelar')} variant="secondary" onPress={close} style={{ flex: 1 }} />
                <Button label={t('Eliminar')} variant="danger" onPress={() => eliminar(mode.routine)} style={{ flex: 1 }} />
              </View>
            </View>
          ) : null}
        </View>
      </Modal>
    </SafeAreaView>
  );
}
