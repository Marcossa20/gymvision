// Datos de cada tipo de cardio: si usa el acelerómetro (pasos), imagen, y estimaciones simples
// de distancia/calorías. La zancada sale de la altura del perfil (caminar ≈ 0,415 × altura; correr ≈ 0,62 × altura).
import type { ImageSourcePropType } from 'react-native';

export type CardioGoal = 'time' | 'steps' | 'distance';

export interface CardioKind {
  /** Solo Caminata y Correr usan pasos (acelerómetro); el resto, tiempo o distancia (CLAUDE.md §5). */
  usesSteps: boolean;
  /** Imagen grande en «Cardio · En curso». */
  image: ImageSourcePropType;
  /** Miniatura en «Cardio · Resumen». */
  thumb: ImageSourcePropType;
  /** Zancada como fracción de la altura, para pasar pasos a distancia. */
  strideFactor?: number;
  /** Velocidad media estimada (km/h) para los que no cuentan pasos. */
  speedKmh?: number;
  /** kcal por minuto activo (aprox.). */
  kcalPerMin: number;
}

const img = {
  caminata: require('../../../assets/cardio/caminata.png'),
  cinta: require('../../../assets/cardio/cinta.png'),
  correr: require('../../../assets/cardio/correr.png'),
  bicicleta: require('../../../assets/cardio/bicicleta.png'),
  eliptica: require('../../../assets/cardio/eliptica.png'),
  remo: require('../../../assets/cardio/remo.png'),
  escaladora: require('../../../assets/cardio/escaladora.png'),
};

export const CARDIO: Record<string, CardioKind> = {
  // En Figma «Caminata · En curso» muestra la cinta (caminar en el gimnasio) y el resumen la silueta andando.
  caminata: { usesSteps: true, image: img.cinta, thumb: img.caminata, strideFactor: 0.415, kcalPerMin: 5.9 },
  correr: { usesSteps: true, image: img.correr, thumb: img.correr, strideFactor: 0.62, kcalPerMin: 11 },
  bicicleta: { usesSteps: false, image: img.bicicleta, thumb: img.bicicleta, speedKmh: 20, kcalPerMin: 8 },
  eliptica: { usesSteps: false, image: img.eliptica, thumb: img.eliptica, speedKmh: 8, kcalPerMin: 9 },
  'remo-cardio': { usesSteps: false, image: img.remo, thumb: img.remo, speedKmh: 10, kcalPerMin: 9 },
  escaladora: { usesSteps: false, image: img.escaladora, thumb: img.escaladora, speedKmh: 3, kcalPerMin: 10 },
};

export const cardioKind = (exerciseId: string): CardioKind => CARDIO[exerciseId] ?? CARDIO.caminata;

export interface CardioMetrics {
  activeMs: number;
  steps: number;
  distanceKm: number;
  kcal: number;
}

export function computeMetrics(kind: CardioKind, activeMs: number, steps: number, heightCm = 170): CardioMetrics {
  const min = activeMs / 60000;
  const distanceKm = kind.usesSteps ? (steps * (heightCm / 100) * (kind.strideFactor ?? 0.415)) / 1000 : ((kind.speedKmh ?? 0) * min) / 60;
  return { activeMs, steps, distanceKm, kcal: Math.round(min * kind.kcalPerMin) };
}

/** Progreso 0..1 hacia el objetivo (solo uno: tiempo en min, pasos o distancia en km). */
export function goalProgress(goal: CardioGoal | undefined, target: number | undefined, m: CardioMetrics) {
  if (!goal || !target) return null;
  const v = goal === 'time' ? m.activeMs / 60000 : goal === 'steps' ? m.steps : m.distanceKm;
  return Math.min(1, v / target);
}

/**
 * Puntos de cardio de una sesión (gamificación, RF8). TODO: sin algoritmo oficial; tabla simple:
 * 2 puntos por minuto activo + 1 por cada 100 pasos, con un tope por sesión.
 */
export function cardioPointsFor(m: CardioMetrics) {
  return Math.min(400, Math.round((m.activeMs / 60000) * 2 + m.steps / 100));
}
