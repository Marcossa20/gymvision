// Mapa muscular (frente/espalda) coloreado por rango — RF8 (Figma 2:2, «Mapa muscular · por rango»).
// Las imágenes son las siluetas del Figma (página «Músculos · reserva»): una silueta gris y una máscara por
// músculo que se TINTA con el color del rango → mismo aspecto realista que el Figma, pero el color sale de
// useRankColors() y cambia con el modo daltonismo (Reto 1).
// Teoría (el color nunca va solo): cada músculo con rango lleva además el símbolo de su rango (●◆★♦⬢✦)
// y la leyenda repite símbolo + nombre. Toque: la rejilla de zonas decide qué músculo se pulsa.
import React from 'react';
import { Image, Pressable, View, type GestureResponderEvent } from 'react-native';
import { T } from '../../components/ui';
import type { Muscle } from '../../data/seed';
import { RANK_NAMES, RANK_SHAPES } from '../../domain/ranks';
import { useRankColors, useTheme } from '../../theme/useTheme';
import { alpha } from '../gym/ui';
import type { MuscleRank } from './data';
import { MAP_CENTROIDS, MAP_GRID, MAP_ORDER } from './mapData';
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
      style={{ width: W, height: H, borderRadius: 12, overflow: 'hidden', backgroundColor: '#070707' }}
    >
      <Image source={imgs.base} style={{ position: 'absolute', width: W, height: H }} resizeMode="stretch" accessibilityIgnoresInvertColors />
      {ranked.map((m) => (
        <Image key={m} source={imgs.muscles[m]} tintColor={palette[ranks[m].rank!.tier]} style={{ position: 'absolute', width: W, height: H, opacity: 0.82 }} resizeMode="stretch" accessibilityIgnoresInvertColors />
      ))}
      {ranked.flatMap((m) => (MAP_CENTROIDS[side][m] ?? []).map(([cx, cy], i) => (
        <View key={`${m}${i}`} pointerEvents="none" style={{ position: 'absolute', left: cx * W - 8, top: cy * H - 8, width: 16, height: 16, borderRadius: 8, backgroundColor: 'rgba(7,7,7,0.78)', alignItems: 'center', justifyContent: 'center' }}>
          <T size={9} weight="700" color="#FFFFFF">{RANK_SHAPES[ranks[m].rank!.tier]}</T>
        </View>
      )))}
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
      {/* Leyenda: símbolo + nombre + color */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', columnGap: 12, rowGap: 8 }} accessible accessibilityLabel={`Leyenda: sin entrenar, ${RANK_NAMES.join(', ')}`}>
        <Legend color={alpha(colors.radioOff, 0.5)} shape="" label="Sin entrenar" />
        {RANK_NAMES.map((n, i) => <Legend key={n} color={palette[i]} shape={RANK_SHAPES[i]} label={n} />)}
      </View>
    </View>
  );
}

function Legend({ color, shape, label }: { color: string; shape: string; label: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: color, alignItems: 'center', justifyContent: 'center' }}>
        {shape ? <T size={8} weight="700" color={colors.bg}>{shape}</T> : null}
      </View>
      <T size={11.5} weight="500" color="secondary">{label}</T>
    </View>
  );
}
