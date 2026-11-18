// Teoría: una acción principal por pantalla (RNF1) — «Ver» destaca sobre el resto; Gestalt: agrupación en tarjetas.
import React, { useState } from 'react';
import { Image, Pressable, ScrollView, View, useWindowDimensions, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowRight, ChevronRight, Library, Plus } from 'lucide-react-native';
import { Button, Card, T } from '../../components/ui';
import { exerciseById, WEEK_NAMES } from '../../data/seed';
import { useWorkout } from '../../store/workout';
import { useTheme } from '../../theme/useTheme';
import { muscleImages } from './muscleImages';
import { useTranslation } from 'react-i18next';

export function Header() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const streak = useWorkout((s) => s.streak);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, height: 55 }}>
      <Image source={require('../../../assets/brand/logo.png')} style={{ width: 50, height: 35 }} resizeMode="contain" accessibilityIgnoresInvertColors />
      <T size={23} weight="700" accessibilityRole="header">GymVision</T>
      <View accessible accessibilityLabel={t('Racha de {{n}} días', { n: streak })} style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.card, borderRadius: 20, paddingVertical: 7, paddingHorizontal: 12 }}>
        <T size={13}>🔥</T>
        <T size={13} weight="700" color="brand">{streak}</T>
      </View>
    </View>
  );
}

export function EntrenarScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const routines = useWorkout((s) => s.routines);
  const active = useWorkout((s) => s.active);
  const { width } = useWindowDimensions();
  const [page, setPage] = useState(0);
  const cardW = width - 40;
  const plans = [...routines].sort((a, b) => (a.days.length ? 0 : 1) - (b.days.length ? 0 : 1)).slice(0, 3);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => setPage(Math.round(e.nativeEvent.contentOffset.x / (cardW + 12)));

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24, gap: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <T size={26} weight="700" accessibilityRole="header">{t('Tu plan')}</T>
          <Pressable accessibilityRole="button" accessibilityLabel={t('Más planes')} onPress={() => router.push('/routines')} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 48 }}>
            <T size={15} weight="500" color="brand">{t('Más planes')}</T>
            <ArrowRight size={18} color={colors.brand} />
          </Pressable>
        </View>

        {active ? (
          <Card style={{ padding: 16, gap: 12 }}>
            <T size={15} color="secondary">{t('Entreno en curso')}</T>
            <T size={22} weight="700">{t(active.name)}</T>
            <Button label={t('Continuar')} onPress={() => router.push('/workout/active')} icon={<ArrowRight size={20} color={colors.onBrand} />} />
          </Card>
        ) : null}

        <ScrollView horizontal pagingEnabled={false} snapToInterval={cardW + 12} decelerationRate="fast" showsHorizontalScrollIndicator={false} onScroll={onScroll} scrollEventThrottle={16} contentContainerStyle={{ gap: 12 }}>
          {plans.map((r) => (
            <Card key={r.id} style={{ width: cardW, borderRadius: 28, overflow: 'hidden' }}>
              <View style={{ height: 176, backgroundColor: '#070707', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 14 }}>
                {r.focus.slice(0, 3).map((m) => (
                  <Image key={m} source={muscleImages[m]} accessibilityLabel={m} style={{ width: 95, height: 170, borderRadius: 14 }} resizeMode="cover" />
                ))}
                {r.days.length ? (
                  <View style={{ position: 'absolute', left: 16, top: 16, backgroundColor: colors.surface2, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 }}>
                    <T size={13} weight="500" color="#FFFFFF">{t(WEEK_NAMES[r.days[0]])}</T>
                  </View>
                ) : null}
              </View>
              <View style={{ padding: 20, paddingTop: 16, gap: 4 }}>
                <T size={34} weight="700" style={{ letterSpacing: 0.68 }}>{t(r.name).toUpperCase()}</T>
                <T size={15} color="secondary">{t('{{min}} min · {{n}} ejercicios', { min: estimateMinutes(r), n: r.exercises.length })}</T>
                <View style={{ height: 8 }} />
                <Button label={t('Ver')} onPress={() => router.push({ pathname: '/workout/[routineId]', params: { routineId: r.id } })} icon={<ArrowRight size={20} color={colors.onBrand} />} />
              </View>
            </Card>
          ))}
        </ScrollView>

        <View accessibilityElementsHidden style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, height: 8, alignItems: 'center' }}>
          {plans.map((r, i) => <View key={r.id} style={{ width: i === page ? 18 : 6, height: 6, borderRadius: 3, backgroundColor: i === page ? colors.brand : colors.switchOff }} />)}
        </View>

        <T size={16} weight="500" color="secondary" style={{ textAlign: 'center' }}>{t('¿Buscas otra forma de entrenar?')}</T>

        <Card onPress={() => router.push('/routines')} accessibilityLabel={t('Ir a mis rutinas. Consulta tus rutinas guardadas')} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 20, minHeight: 76 }}>
          <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' }}><Library size={24} color={colors.brand} /></View>
          <View style={{ flex: 1, gap: 2 }}>
            <T size={16} weight="600">{t('Ir a mis rutinas')}</T>
            <T size={13} color="secondary">{t('Consulta tus rutinas guardadas')}</T>
          </View>
          <ChevronRight size={22} color={colors.textSecondary} />
        </Card>

        <Card onPress={() => router.push('/routines/edit/new')} accessibilityLabel={t('Crea tu rutina')} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 20, minHeight: 76, borderColor: colors.brand, borderWidth: 1.5 }}>
          <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' }}><Plus size={24} color={colors.brand} /></View>
          <T size={16} weight="600" style={{ flex: 1 }}>{t('Crea tu rutina')}</T>
          <ChevronRight size={22} color={colors.textSecondary} />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

/** Estimación simple: series × (40 s de trabajo + descanso). */
export function estimateMinutes(r: { exercises: { sets: number; restSec: number }[] }) {
  return Math.round(r.exercises.reduce((t, e) => t + e.sets * (40 + e.restSec), 0) / 60);
}

export { exerciseById };
