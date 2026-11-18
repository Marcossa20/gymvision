// Rangos (Figma 2:2) + tarjetas desplegadas Brazos/Espalda/Piernas (Figma 2018:2, 2018:359, 2018:538) — RF8.
// Teoría (gamificación): nivel general arriba, mapa y lista con barra hacia el siguiente rango (meta visible).
// Teoría (Gestalt + divulgación progresiva): los grupos se despliegan para ver cada músculo sin saturar la pantalla.
// Teoría (Reto 1): todos los colores de rango vienen de useRankColors(); el nombre y la insignia acompañan siempre al color.
import React, { useState } from 'react';
import { LayoutAnimation, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronDown, ChevronRight } from 'lucide-react-native';
import { Card, T } from '../../components/ui';
import type { Muscle } from '../../data/seed';
import { nextRankLabel } from '../../domain/ranks';
import { useRankColors, useTheme } from '../../theme/useTheme';
import { alpha } from '../gym/ui';
import { Header } from '../workout/EntrenarScreen';
import { BodyMap } from './BodyMap';
import { useMuscleRanks, type MuscleRank } from './data';
import { MUSCLE_LABELS } from './muscles';
import { Bar, RankBadge } from './RankBits';

export function RanksScreen() {
  const { colors } = useTheme();
  const palette = useRankColors();
  const router = useRouter();
  const { byMuscle, groups, general } = useMuscleRanks();
  const [open, setOpen] = useState<string | null>(null);
  const goMuscle = (m: Muscle) => router.push(`/ranks/${m}` as never);
  const gColor = general ? palette[general.tier] : colors.textSecondary;
  const next = general ? nextRankLabel(general) : null;

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}>
        <View style={{ height: 1, backgroundColor: colors.divider }} />
        {/* Nivel general */}
        <View style={{ paddingTop: 18, paddingBottom: 6 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18, borderRadius: 20, borderWidth: 1, borderColor: alpha(gColor, 0.35), backgroundColor: general ? alpha(gColor, 0.12) : colors.card }}>
            <View style={{ flex: 1, gap: 7 }}>
              <T size={11} weight="600" color={gColor} style={{ letterSpacing: 1.3 }}>TU NIVEL GENERAL</T>
              <T size={30} weight="700" style={{ letterSpacing: -0.5 }}>{general ? general.label : 'Sin rango'}</T>
              <T size={12.5} weight="500" color="secondary">
                {general ? (next ? `${Math.round(general.progress * 100)}% hacia ${next}` : 'Rango máximo') : 'Entrena para conseguir tu primer rango'}
              </T>
              <Bar progress={general?.progress ?? 0} color={gColor} />
            </View>
            <RankBadge rank={general} size={76} />
          </View>
        </View>

        {/* Mapa muscular */}
        <Card style={{ paddingHorizontal: 18, paddingTop: 16, paddingBottom: 18, gap: 16, borderRadius: 20 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', columnGap: 12, rowGap: 2 }}>
            <T size={15} weight="700" accessibilityRole="header">Mapa muscular · por rango</T>
            <T size={12} weight="500" color="secondary">Toca un músculo</T>
          </View>
          <BodyMap ranks={byMuscle} onPress={goMuscle} />
          {!general ? <T size={12.5} color="secondary" style={{ textAlign: 'center' }}>Aún sin rangos: entrena, o activa «Cargar datos de ejemplo» en el Laboratorio.</T> : null}
        </Card>

        <View style={{ paddingTop: 20, paddingBottom: 12 }}>
          <T size={17} weight="700" accessibilityRole="header">Rangos por músculo</T>
        </View>

        <View style={{ gap: 11 }}>
          {groups.map((g) => {
            const color = g.rank ? palette[g.rank.tier] : colors.textSecondary;
            const multi = g.muscles.length > 1;
            const isOpen = open === g.id;
            const onPress = () => {
              if (!multi) return goMuscle(g.muscles[0]);
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              setOpen(isOpen ? null : g.id);
            };
            return (
              <View key={g.id} style={{ borderRadius: 16, borderWidth: 1, borderColor: g.rank ? alpha(color, 0.45) : colors.divider, backgroundColor: g.rank ? alpha(color, 0.13) : colors.card, overflow: 'hidden' }}>
                <Pressable
                  onPress={onPress}
                  accessibilityRole="button"
                  accessibilityState={multi ? { expanded: isOpen } : undefined}
                  accessibilityLabel={`${g.name}, ${g.rank ? g.rank.label : 'sin rango'}, ${g.ranked} de ${g.muscles.length} con rango`}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingLeft: 12, paddingRight: 16, paddingVertical: 11, minHeight: 74 }}
                >
                  <RankBadge rank={g.rank} size={52} />
                  <View style={{ flex: 1, gap: 7 }}>
                    <View style={{ gap: 2 }}>
                      <T size={16} weight="600">{g.name}</T>
                      <T size={13} weight="600" color={color}>{g.rank ? g.rank.label : 'Sin rango'}</T>
                    </View>
                    <Bar progress={g.rank?.progress ?? 0} color={color} />
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 6 }}>
                    <T size={14} weight="700">{g.ranked}/{g.muscles.length}</T>
                    {multi ? (isOpen ? <ChevronDown size={18} color={colors.textSecondary} /> : <ChevronRight size={18} color={colors.textSecondary} />) : null}
                  </View>
                </Pressable>
                {isOpen ? (
                  <View style={{ paddingBottom: 8 }}>
                    <View style={{ height: 1, backgroundColor: colors.divider }} />
                    <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 24, paddingRight: 16, paddingTop: 12, paddingBottom: 4 }}>
                      <T size={10.5} weight="600" color="secondary" style={{ flex: 1, letterSpacing: 0.8 }}>RANGO POR MÚSCULO</T>
                      <T size={12} weight="500" color="secondary">{g.ranked} de {g.muscles.length} con rango</T>
                    </View>
                    {g.muscles.map((m) => <MuscleRow key={m} r={byMuscle[m]} onPress={() => goMuscle(m)} />)}
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MuscleRow({ r, onPress }: { r: MuscleRank; onPress: () => void }) {
  const { colors } = useTheme();
  const palette = useRankColors();
  const color = r.rank ? palette[r.rank.tier] : colors.textSecondary;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${MUSCLE_LABELS[r.muscle]}, ${r.rank ? r.rank.label : 'sin rango'}`} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingLeft: 24, paddingRight: 16, paddingVertical: 10, minHeight: 56 }}>
      <RankBadge rank={r.rank} size={40} />
      <View style={{ flex: 1, gap: 2 }}>
        <T size={15} weight="600">{MUSCLE_LABELS[r.muscle]}</T>
        <T size={12.5} weight={r.rank ? '600' : '500'} color={color}>{r.rank ? r.rank.label : 'Sin rango · aún sin entrenar'}</T>
        <Bar progress={r.rank?.progress ?? 0} color={color} />
      </View>
    </Pressable>
  );
}
