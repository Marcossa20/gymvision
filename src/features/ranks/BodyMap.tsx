// Mapa muscular (frente/espalda) coloreado por rango — RF8 (Figma 2:2, «Mapa muscular · por rango»).
// Las imágenes son las siluetas del Figma (página «Músculos · reserva»): una silueta gris y una máscara por
// músculo que se TINTA con el color del rango → mismo aspecto realista que el Figma, pero el color sale de
// useRankColors() y cambia con el modo daltonismo (Reto 1).
// El color se aplica con mezcla «color» + «luz suave» sobre la silueta: conserva el relieve del músculo.
// Debajo, la leyenda dice qué rango es cada color. Toque: la rejilla de zonas decide qué músculo se pulsa.
// Teoría (Reto 1): el nombre del rango también aparece en las tarjetas de debajo, no solo el color.
import React from 'react';
import { Image, Pressable, View, type GestureResponderEvent } from 'react-native';
import { T } from '../../components/ui';
import type { Muscle } from '../../data/seed';
import { RANK_NAMES } from '../../domain/ranks';
import { useRankColors, useTheme } from '../../theme/useTheme';
import { alpha } from '../gym/ui';
import type { MuscleRank } from './data';
import { MAP_GRID, MAP_ORDER } from './mapData';
import { MAP_IMAGES } from './mapImages';

const W = 146, H = 262; // tamaño de la figura en Figma

/** Músculo pulsado en (x, y); si cae en un hueco, busca el más cercano (zona táctil generosa). */
function hit(side: 'front' | 'back', x: number, y: number): Muscle | null {
  const rows = MAP_GRID[side];
  const cols = rows[0].length;
  const gx = Math.floor((x / W) * cols), gy = Math.floor((y / H) * rows.length);
  for (let r = 0; r <= 3; r++) {
    let best: { id: number; d: number } | null = null;
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      const c = rows[gy + dy]?.[gx + dx];
      const id = c ? parseInt(c, 36) : 0;
      const d = dx * dx + dy * dy;
      if (id && (!best || d < best.d)) best = { id, d };
    }
    if (best) return MAP_ORDER[best.id - 1] as Muscle;
  }
  return null;
}

function Figure({ side, ranks, onPress }: { side: 'front' | 'back'; ranks: Record<Muscle, MuscleRank>; onPress: (m: Muscle) => void }) {
  const palette = useRankColors();
  const imgs = MAP_IMAGES[side];
  const ranked = (Object.keys(imgs.muscles) as Muscle[]).filter((m) => ranks[m]?.rank);
  return (
    <Pressable
      onPress={(e: GestureResponderEvent) => { const m = hit(side, e.nativeEvent.locationX, e.nativeEvent.locationY); if (m) onPress(m); }}
      accessibilityRole="image"
      accessibilityLabel={`Mapa muscular, vista de ${side === 'front' ? 'frente' : 'espalda'}. Usa la lista de abajo para ver cada músculo.`}
      style={{ width: W, height: H, borderRadius: 12, overflow: 'hidden', backgroundColor: '#070707', isolation: 'isolate' }}
    >
      <Image source={imgs.base} style={{ position: 'absolute', width: W, height: H }} resizeMode="stretch" accessibilityIgnoresInvertColors />
      {ranked.map((m) => {
        const c = palette[ranks[m].rank!.tier];
        return (
          <React.Fragment key={m}>
            <Image source={imgs.muscles[m]} tintColor={c} style={{ position: 'absolute', width: W, height: H, mixBlendMode: 'color' }} resizeMode="stretch" accessibilityIgnoresInvertColors />
            <Image source={imgs.muscles[m]} tintColor={c} style={{ position: 'absolute', width: W, height: H, mixBlendMode: 'soft-light', opacity: 0.9 }} resizeMode="stretch" accessibilityIgnoresInvertColors />
          </React.Fragment>
        );
      })}
    </Pressable>
  );
}

export function BodyMap({ ranks, onPress }: { ranks: Record<Muscle, MuscleRank>; onPress: (m: Muscle) => void }) {
  const { colors } = useTheme();
  const palette = useRankColors();
  return (
    <View style={{ gap: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 18 }}>
        {(['front', 'back'] as const).map((side) => (
          <View key={side} style={{ alignItems: 'center', gap: 8 }}>
            <Figure side={side} ranks={ranks} onPress={onPress} />
            <T size={12} weight="500" color="secondary">{side === 'front' ? 'Frente' : 'Espalda'}</T>
          </View>
        ))}
      </View>
      {/* Leyenda: qué rango es cada color */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', columnGap: 12, rowGap: 8 }} accessible accessibilityLabel={`Leyenda: sin entrenar, ${RANK_NAMES.join(', ')}`}>
        <Legend color={alpha(colors.radioOff, 0.5)} label="Sin entrenar" />
        {RANK_NAMES.map((n, i) => <Legend key={n} color={palette[i]} label={n} />)}
      </View>
    </View>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: color }} />
      <T size={11.5} weight="500" color="secondary">{label}</T>
    </View>
  );
}
