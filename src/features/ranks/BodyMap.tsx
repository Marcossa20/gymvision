// Mapa muscular (frente/espalda) coloreado por rango — RF8.
// Teoría (Reto 1, daltonismo): el color sale de useRankColors() (cambia con el modo daltonismo) y nunca va solo:
// cada músculo con rango lleva además la forma de su rango (●◆★♦⬢✦) y la leyenda repite forma + nombre.
// Teoría (consistencia): el mismo mapa, el mismo código de colores que en las tarjetas y el detalle.
// Dibujado en SVG (no imagen fija) para poder recolorearlo con los datos y los ajustes del usuario.
import React from 'react';
import { View } from 'react-native';
import Svg, { Ellipse, G, Path, Text as SvgText } from 'react-native-svg';
import { T } from '../../components/ui';
import type { Muscle } from '../../data/seed';
import { RANK_NAMES, RANK_SHAPES } from '../../domain/ranks';
import { useRankColors, useTheme } from '../../theme/useTheme';
import { alpha } from '../gym/ui';
import type { MuscleRank } from './data';

// Lienzo 146 × 262. Cada músculo se dibuja una vez (mitad izquierda) y se refleja con mirror().
// Solo se usan órdenes M/L/Q/Z con coordenadas absolutas (así el reflejo es cambiar cada x por 146 − x).
const mirror = (d: string) => {
  let i = 0;
  return d.replace(/-?\d+(\.\d+)?/g, (n) => (i++ % 2 === 0 ? String(146 - Number(n)) : n));
};
const both = (d: string) => [d, mirror(d)];

const FRONT: Partial<Record<Muscle, string[]>> = {
  cuello: both('M73 37 L66 39 Q65 44 67 48 L73 50 Z'),
  trapecio: both('M67 48 L58 51 Q62 53 66 56 Z'),
  hombros: both('M54 51 Q43 51 39 63 Q38 72 46 75 Q55 70 58 57 Z'),
  pecho: both('M73 54 L58 55 Q52 64 56 73 Q65 79 73 73 Z'),
  biceps: both('M42 77 Q37 86 38 96 L47 97 Q51 87 48 76 Z'),
  antebrazos: both('M36 99 Q32 111 33 124 L41 126 Q45 113 45 100 Z'),
  abdominales: both('M73 77 L62 77 Q60 91 61 105 Q62 117 67 125 L73 127 Z'),
  abductores: both('M54 129 Q49 141 51 153 L57 154 Q59 142 58 131 Z'),
  cuadriceps: both('M57 138 Q51 160 54 186 L66 187 Q69 161 67 140 Z'),
  aductores: both('M68 143 L73 143 L72 177 Q69 181 67 186 Q69 162 68 143 Z'),
};

const BACK: Partial<Record<Muscle, string[]>> = {
  hombros: both('M54 51 Q43 51 39 63 Q38 72 46 75 Q55 70 58 57 Z'),
  dorsales: both('M73 92 L62 68 Q54 75 55 91 Q58 105 73 109 Z'),
  trapecio: both('M73 39 L66 45 Q58 50 56 55 L62 66 Q67 78 73 94 Z'),
  triceps: both('M42 77 Q37 86 38 96 L47 97 Q51 87 48 76 Z'),
  antebrazos: both('M36 99 Q32 111 33 124 L41 126 Q45 113 45 100 Z'),
  lumbar: both('M73 109 L63 106 Q61 117 63 126 L73 128 Z'),
  gluteos: both('M73 128 L59 127 Q52 136 54 147 Q63 155 73 151 Z'),
  femoral: both('M56 153 Q50 169 53 188 L68 188 Q71 169 70 155 Z'),
  gemelos: both('M54 194 Q50 212 55 233 L67 233 Q70 212 67 195 Z'),
};

/** Músculos centrales: un único símbolo de rango en el eje (no uno por mitad). */
const CENTER = new Set<Muscle>(['cuello', 'abdominales', 'lumbar', 'trapecio']);

/** Silueta base: cuerpo entero de una pieza para que las zonas sin músculo no queden «vacías». */
const BASE_HALF = [
  'M73 46 Q62 47 54 51 Q50 56 52 70 Q54 90 57 106 Q58 120 56 132 L73 138 Z', // tronco
  'M52 53 Q42 53 38 64 Q35 80 36 95 L46 97 Q48 82 54 70 Z', // brazo
  'M36 97 Q32 111 32 125 L41 127 Q45 113 46 99 Z', // antebrazo
  'M55 134 Q49 160 52 190 L68 190 Q72 160 73 138 Z', // muslo
  'M53 192 Q50 214 54 240 L66 240 Q69 214 68 192 Z', // pierna
];

const labelPos = (d: string) => {
  const n = d.match(/-?\d+(\.\d+)?/g)!.map(Number);
  const xs = n.filter((_, i) => i % 2 === 0);
  const ys = n.filter((_, i) => i % 2 === 1);
  return { x: xs.reduce((a, b) => a + b, 0) / xs.length, y: ys.reduce((a, b) => a + b, 0) / ys.length };
};

function Figure({ side, ranks, onPress, width }: { side: 'front' | 'back'; ranks: Record<Muscle, MuscleRank>; onPress: (m: Muscle) => void; width: number }) {
  const { colors } = useTheme();
  const palette = useRankColors();
  const map = side === 'front' ? FRONT : BACK;
  const height = (width * 262) / 146;
  const base = alpha(colors.divider, 0.55);
  const idle = alpha(colors.radioOff, 0.5);
  return (
    <Svg width={width} height={height} viewBox="0 0 146 262">
      <Ellipse cx={73} cy={20} rx={12} ry={15} fill={base} />
      <Path d="M67 34 L79 34 L79 48 L67 48 Z" fill={base} />
      {BASE_HALF.flatMap(both).map((d, i) => <Path key={`b${i}`} d={d} fill={base} />)}
      <Ellipse cx={34} cy={133} rx={5} ry={7} fill={base} />
      <Ellipse cx={112} cy={133} rx={5} ry={7} fill={base} />
      <Ellipse cx={60} cy={247} rx={9} ry={5} fill={base} />
      <Ellipse cx={86} cy={247} rx={9} ry={5} fill={base} />
      {(Object.keys(map) as Muscle[]).map((m) => {
        const r = ranks[m]?.rank;
        const fill = r ? palette[r.tier] : idle;
        const paths = map[m]!;
        const labels = r ? (CENTER.has(m) ? [{ x: 73, y: labelPos(paths[0]).y }] : paths.map(labelPos)) : [];
        return (
          <G key={m} onPress={() => onPress(m)}>
            {paths.map((d, i) => <Path key={i} d={d} fill={fill} stroke={colors.bg} strokeWidth={1.1} strokeLinejoin="round" />)}
            {labels.map((p, i) => (
              <SvgText key={`t${i}`} x={p.x} y={p.y + 3} fontSize={8} fontWeight="bold" textAnchor="middle" fill={colors.bg}>{RANK_SHAPES[r!.tier]}</SvgText>
            ))}
          </G>
        );
      })}
    </Svg>
  );
}

export function BodyMap({ ranks, onPress }: { ranks: Record<Muscle, MuscleRank>; onPress: (m: Muscle) => void }) {
  const { colors } = useTheme();
  const palette = useRankColors();
  const w = 146;
  return (
    <View style={{ gap: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 18 }}>
        {(['front', 'back'] as const).map((side) => (
          <View key={side} style={{ alignItems: 'center', gap: 8 }}>
            <View style={{ width: w, height: 262, borderRadius: 12, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <Figure side={side} ranks={ranks} onPress={onPress} width={w - 8} />
            </View>
            <T size={12} weight="500" color="secondary">{side === 'front' ? 'Frente' : 'Espalda'}</T>
          </View>
        ))}
      </View>
      {/* Leyenda: forma + nombre + color */}
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
