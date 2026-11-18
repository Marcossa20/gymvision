// Teoría: una acción principal por pantalla (RNF1) — «Ver» destaca sobre el resto; Gestalt: agrupación en tarjetas.
import React, { useState } from 'react';
import { Image, Pressable, ScrollView, View, useWindowDimensions, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowRight, ChevronRight, Library, Plus } from 'lucide-react-native';
import { Button, Card, T } from '../../components/ui';
import { exerciseById } from '../../data/seed';
import { useWorkout } from '../../store/workout';
import { useTheme } from '../../theme/useTheme';
import { muscleImages } from './muscleImages';

export function Header() {
  const { colors } = useTheme();
  const streak = useWorkout((s) => s.streak);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, height: 55 }}>
      <Image source={require('../../../assets/brand/logo.png')} style={{ width: 50, height: 35 }} resizeMode="contain" accessibilityIgnoresInvertColors />
      <T size={23} weight="700" accessibilityRole="header">GymVision</T>
      <View accessible accessibilityLabel={`Racha de ${streak} días`} style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.card, borderRadius: 20, paddingVertical: 7, paddingHorizontal: 12 }}>
        <T size={13}>🔥</T>
        <T size={13} weight="700" color="brand">{streak}</T>
      </View>
    </View>
  );
}

export function EntrenarScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const routines = useWorkout((s) => s.routines);
  const active = useWorkout((s) => s.active);
  const { width } = useWindowDimensions();
  const [page, setPage] = useState(0);
  const cardW = width - 40;
  const plans = routines.filter((r) => r.day || routines.indexOf(r) < 3).slice(0, 3);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => setPage(Math.round(e.nativeEvent.contentOffset.x / (cardW + 12)));

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24, gap: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <T size={26} weight="700" accessibilityRole="header">Tu plan</T>
          <Pressable accessibilityRole="button" accessibilityLabel="Más planes" onPress={() => router.push('/routines')} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 48 }}>
            <T size={15} weight="500" color="brand">Más planes</T>
            <ArrowRight size={18} color={colors.brand} />
          </Pressable>
        </View>

        {active ? (
          <Card style={{ padding: 16, gap: 12 }}>
            <T size={15} color="secondary">Entreno en curso</T>
            <T size={22} weight="700">{active.name}</T>
            <Button label="Continuar" onPress={() => router.push('/workout/active')} icon={<ArrowRight size={20} color={colors.onBrand} />} />
          </Card>
        ) : null}

        <ScrollView horizontal pagingEnabled={false} snapToInterval={cardW + 12} decelerationRate="fast" showsHorizontalScrollIndicator={false} onScroll={onScroll} scrollEventThrottle={16} contentContainerStyle={{ gap: 12 }}>
          {plans.map((r) => (
            <Card key={r.id} style={{ width: cardW, borderRadius: 28, overflow: 'hidden' }}>
              <View style={{ height: 176, backgroundColor: '#070707', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 14 }}>
                {r.focus.slice(0, 3).map((m) => (
                  <Image key={m} source={muscleImages[m]} accessibilityLabel={m} style={{ width: 95, height: 170, borderRadius: 14 }} resizeMode="cover" />
                ))}
                {r.day ? (
                  <View style={{ position: 'absolute', left: 16, top: 16, backgroundColor: '#222228', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 }}>
                    <T size={13} weight="500" color="#FFFFFF">{r.day}</T>
                  </View>
                ) : null}
              </View>
              <View style={{ padding: 20, paddingTop: 16, gap: 4 }}>
                <T size={34} weight="700" style={{ letterSpacing: 0.68 }}>{r.name}</T>
                <T size={15} color="secondary">{`${estimateMinutes(r)} min · ${r.exercises.length} ejercicios`}</T>
                <View style={{ height: 8 }} />
                <Button label="Ver" onPress={() => router.push({ pathname: '/workout/[routineId]', params: { routineId: r.id } })} icon={<ArrowRight size={20} color={colors.onBrand} />} />
              </View>
            </Card>
          ))}
        </ScrollView>

        <View accessibilityElementsHidden style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, height: 8, alignItems: 'center' }}>
          {plans.map((r, i) => <View key={r.id} style={{ width: i === page ? 18 : 6, height: 6, borderRadius: 3, backgroundColor: i === page ? colors.brand : colors.switchOff }} />)}
        </View>

        <T size={16} weight="500" color="secondary" style={{ textAlign: 'center' }}>¿Buscas otra forma de entrenar?</T>

        <Card onPress={() => router.push('/routines')} accessibilityLabel="Ir a mis rutinas. Consulta tus rutinas guardadas" style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 20, minHeight: 76 }}>
          <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: '#222228', alignItems: 'center', justifyContent: 'center' }}><Library size={24} color={colors.brand} /></View>
          <View style={{ flex: 1, gap: 2 }}>
            <T size={16} weight="600">Ir a mis rutinas</T>
            <T size={13} color="secondary">Consulta tus rutinas guardadas</T>
          </View>
          <ChevronRight size={22} color={colors.textSecondary} />
        </Card>

        <Card onPress={() => router.push('/routines/edit/new')} accessibilityLabel="Crea tu rutina" style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 20, minHeight: 76, borderColor: colors.brand, borderWidth: 1.5 }}>
          <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: '#222228', alignItems: 'center', justifyContent: 'center' }}><Plus size={24} color={colors.brand} /></View>
          <T size={16} weight="600" style={{ flex: 1 }}>Crea tu rutina</T>
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
