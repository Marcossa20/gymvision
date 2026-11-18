// Mapa muscular (frente/espalda) coloreado por rango — RF8.
// Teoría (Reto 1, daltonismo): el color sale de useRankColors() (cambia con el modo daltonismo) y nunca va solo:
// cada músculo con rango lleva además la forma de su rango (●◆★♦⬢✦) y la leyenda repite forma + nombre.
// Teoría (consistencia): el mismo mapa, el mismo código de colores que en las tarjetas y el detalle.
// Dibujado en SVG (no imagen fija) para poder recolorearlo con los datos y los ajustes del usuario.
import React from 'react';
import { View } from 'react-native';
import Svg, { Ellipse, G, Path, Rect, Text as SvgText } from 'react-native-svg';
import { T } from '../../components/ui';
import type { Muscle } from '../../data/seed';
import { RANK_NAMES, RANK_SHAPES } from '../../domain/ranks';
import { useRankColors, useTheme } from '../../theme/useTheme';
import type { MuscleRank } from './data';

type Shape =
  | { k: 'e'; cx: number; cy: number; rx: number; ry: number }
  | { k: 'r'; x: number; y: number; w: number; h: number; r: number }
  | { k: 'p'; d: string };

// Lienzo 146 × 262 (tamaño de la figura en Figma). Cada músculo: formas a ambos lados.
const mirror = (s: Shape): Shape => {
  if (s.k === 'e') return { ...s, cx: 146 - s.cx };
  if (s.k === 'r') return { ...s, x: 146 - s.x - s.w };
  let i = 0; // en M/L/Q todos los números van en parejas x y: se refleja cada x
  return { k: 'p', d: s.d.replace(/-?\d+(\.\d+)?/g, (n) => (i++ % 2 === 0 ? String(146 - Number(n)) : n)) };
};

const pair = (s: Shape) => [s, mirror(s)];

const FRONT: Partial<Record<Muscle, Shape[]>> = {
  cuello: [{ k: 'r', x: 66, y: 37, w: 14, h: 10, r: 4 }],
  trapecio: [{ k: 'p', d: 'M57 50 L66 43 L66 50 Z' }, { k: 'p', d: 'M89 50 L80 43 L80 50 Z' }],
  hombros: pair({ k: 'e', cx: 48, cy: 60, rx: 11, ry: 10 }),
  pecho: pair({ k: 'r', x: 55, y: 51, w: 17.5, h: 23, r: 7 }),
  biceps: pair({ k: 'e', cx: 41, cy: 84, rx: 7, ry: 14 }),
  antebrazos: pair({ k: 'e', cx: 35, cy: 114, rx: 6, ry: 15 }),
  abdominales: [{ k: 'r', x: 61, y: 77, w: 24, h: 44, r: 8 }],
  abductores: pair({ k: 'e', cx: 53, cy: 137, rx: 5, ry: 12 }),
  aductores: pair({ k: 'p', d: 'M66 132 Q72 132 72 140 L70 172 Q66 168 64 150 Z' }),
  cuadriceps: pair({ k: 'e', cx: 60, cy: 162, rx: 10, ry: 28 }),
};

const BACK: Partial<Record<Muscle, Shape[]>> = {
  trapecio: [{ k: 'p', d: 'M73 38 L90 52 L80 58 L73 84 L66 58 L56 52 Z' }],
  hombros: pair({ k: 'e', cx: 48, cy: 60, rx: 11, ry: 10 }),
  dorsales: pair({ k: 'p', d: 'M57 64 L71 66 L71 104 Q62 100 55 86 Z' }),
  triceps: pair({ k: 'e', cx: 41, cy: 84, rx: 7, ry: 14 }),
  antebrazos: pair({ k: 'e', cx: 35, cy: 114, rx: 6, ry: 15 }),
  lumbar: [{ k: 'r', x: 63, y: 104, w: 20, h: 20, r: 5 }],
  gluteos: pair({ k: 'e', cx: 63, cy: 138, rx: 11, ry: 12 }),
  femoral: pair({ k: 'e', cx: 61, cy: 174, rx: 10, ry: 23 }),
  gemelos: pair({ k: 'e', cx: 61, cy: 214, rx: 8, ry: 17 }),
};

/** Silueta base (partes sin músculo asignado). */
const BASE: Shape[] = [
  { k: 'e', cx: 73, cy: 21, rx: 13, ry: 16 }, // cabeza
  { k: 'r', x: 56, y: 46, w: 34, h: 82, r: 12 }, // tronco
  ...pair({ k: 'e', cx: 30, cy: 136, rx: 5, ry: 7 }), // manos
  { k: 'r', x: 51, y: 120, w: 44, h: 24, r: 10 }, // cadera
  ...pair({ k: 'e', cx: 60, cy: 162, rx: 11, ry: 30 }), // muslos
  ...pair({ k: 'e', cx: 61, cy: 214, rx: 8, ry: 20 }), // piernas
  ...pair({ k: 'e', cx: 60, cy: 242, rx: 8, ry: 5 }), // pies
  ...pair({ k: 'e', cx: 41, cy: 84, rx: 8, ry: 15 }), // brazos
  ...pair({ k: 'e', cx: 35, cy: 114, rx: 7, ry: 16 }),
];

function center(s: Shape) {
  if (s.k === 'e') return { x: s.cx, y: s.cy };
  if (s.k === 'r') return { x: s.x + s.w / 2, y: s.y + s.h / 2 };
  const nums = s.d.match(/-?\d+(\.\d+)?/g)!.map(Number);
  const xs = nums.filter((_, i) => i % 2 === 0);
  const ys = nums.filter((_, i) => i % 2 === 1);
  return { x: xs.reduce((a, b) => a + b, 0) / xs.length, y: ys.reduce((a, b) => a + b, 0) / ys.length };
}

function ShapeEl({ s, fill, stroke }: { s: Shape; fill: string; stroke: string }) {
  if (s.k === 'e') return <Ellipse cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry} fill={fill} stroke={stroke} strokeWidth={1.2} />;
  if (s.k === 'r') return <Rect x={s.x} y={s.y} width={s.w} height={s.h} rx={s.r} fill={fill} stroke={stroke} strokeWidth={1.2} />;
  return <Path d={s.d} fill={fill} stroke={stroke} strokeWidth={1.2} />;
}

function Figure({ side, ranks, onPress, width }: { side: 'front' | 'back'; ranks: Record<Muscle, MuscleRank>; onPress: (m: Muscle) => void; width: number }) {
  const { colors } = useTheme();
  const palette = useRankColors();
  const map = side === 'front' ? FRONT : BACK;
  const height = (width * 262) / 146;
  return (
    <Svg width={width} height={height} viewBox="0 0 146 262">
      {BASE.map((s, i) => <ShapeEl key={`b${i}`} s={s} fill={colors.divider} stroke={colors.bg} />)}
      {(Object.keys(map) as Muscle[]).map((m) => {
        const r = ranks[m]?.rank;
        const fill = r ? palette[r.tier] : colors.switchOff;
        return (
          <G key={m} onPress={() => onPress(m)}>
            {map[m]!.map((s, i) => <ShapeEl key={i} s={s} fill={fill} stroke={colors.bg} />)}
            {r
              ? map[m]!.map((s, i) => {
                  const c = center(s);
                  return <SvgText key={`t${i}`} x={c.x} y={c.y + 3} fontSize={8} fontWeight="bold" textAnchor="middle" fill={colors.bg}>{RANK_SHAPES[r.tier]}</SvgText>;
                })
              : null}
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
        <Legend color={colors.switchOff} shape="" label="Sin entrenar" />
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
