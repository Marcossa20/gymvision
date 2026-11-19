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
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
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
    if (now.label !== before.label) notify('rango', t('¡Subes a {{label}} en Cardio!', { label: now.label }));
    else notify('serie', t('Cardio guardado'));
    leave();
  };

  const discard = () => {
    useCardio.getState().setPending(null);
    notify('info', t('Cardio descartado'), {
      actionLabel: t('Deshacer'),
      ms: 6000,
      onAction: () => {
        useCardio.getState().setPending(p);
        useCardio.getState().savePending();
        notify('serie', t('Cardio recuperado y guardado'));
      },
    });
    leave();
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, gap: 14 }}>
        <View style={{ alignItems: 'center', gap: 8 }}>
          <Image source={kind.thumb} style={{ width: 64, height: 64, borderRadius: 32 }} accessibilityIgnoresInvertColors />
          <T size={26} weight="700" style={{ textAlign: 'center' }} accessibilityRole="header">{t('Cardio completado')}</T>
          <T size={14} color="secondary" style={{ textAlign: 'center' }}>{t(exercise.name)} · {fmtDate(p.date)}</T>
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Stat icon={<Clock size={18} color={colors.brand} />} value={`${minutes} min`} label={t('Duración')} />
          {kind.usesSteps ? (
            <Stat icon={<PersonStanding size={18} color={colors.brand} />} value={fmtInt(p.steps)} label={t('Pasos')} />
          ) : (
            <Stat icon={<Flame size={18} color={colors.brand} />} value={`${fmtInt(p.kcal)} kcal`} label={t('Aprox.')} />
          )}
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Stat icon={<Route size={18} color={colors.brand} />} value={`${fmtDec(p.distanceKm)} km`} label={kind.usesSteps ? t('Distancia') : t('Distancia aprox.')} />
          {kind.usesSteps ? <Stat icon={<Flame size={18} color={colors.brand} />} value={`${fmtInt(p.kcal)} kcal`} label={t('Aprox.')} /> : <View style={{ flex: 1 }} />}
        </View>
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 22, borderWidth: 1.5, borderColor: colors.brand }}>
          <Image source={rankImages[after.tier]} style={{ width: 44, height: 44 }} resizeMode="contain" accessible accessibilityLabel={t('Rango {{label}}', { label: after.label })} />
          <View style={{ flex: 1, gap: 2 }}>
            <T size={15} weight="700">{t('Suma a tu rango de Cardio')}</T>
            <T size={13} color="secondary">{t('{{label}} · +{{n}} puntos esta sesión', { label: after.label, n: fmtInt(p.points) })}</T>
          </View>
        </Card>
      </ScrollView>
      <BottomActions>
        <Button label={t('Guardar cardio')} onPress={save} />
        {/* Acción destructiva: texto rojo + palabra explícita (no solo color), y se puede deshacer */}
        <Pressable accessibilityRole="button" accessibilityLabel={t('Descartar')} onPress={discard} style={({ pressed }) => ({ minHeight: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.divider, opacity: pressed ? 0.85 : 1 })}>
          <T size={17} weight="600" color={colors.danger}>{t('Descartar')}</T>
        </Pressable>
      </BottomActions>
    </SafeAreaView>
  );
}
