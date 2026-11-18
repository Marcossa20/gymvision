// Teoría (gamificación, RF8): rangos con forma+nombre además del color (el color nunca va solo).
// TODO: no hay algoritmo oficial; función pura con umbrales en tabla para poder ajustarla.

export const RANK_NAMES = ['Bronce', 'Plata', 'Oro', 'Rubí', 'Esmeralda', 'Diamante'] as const;
export const RANK_SHAPES = ['●', '◆', '★', '♦', '⬢', '✦'] as const; // forma de apoyo al color
export type RankName = (typeof RANK_NAMES)[number];

export interface Rank {
  tier: number; // 0..5
  level: 1 | 2 | 3;
  progress: number; // 0..1 hacia el siguiente
  label: string; // «Oro III»
}

const ROMAN = ['I', 'II', 'III'] as const;
const STEPS = RANK_NAMES.length * 3; // 18 escalones

/** Umbral de puntos por escalón (tabla de configuración). */
export const POINTS_PER_STEP = [0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700, 3250, 3850, 4500, 5200, 5950, 6750, 7600, 8500];

/** 1RM estimado (Epley). */
export const estimate1RM = (weight: number, reps: number) => (reps <= 1 ? weight : weight * (1 + reps / 30));

/** Puntos de un ejercicio: 1RM relativo al peso corporal ×100 (simplificado). */
export function pointsFor(weight: number, reps: number, bodyWeight = 75) {
  return Math.round((estimate1RM(weight, reps) / bodyWeight) * 1000);
}

export function rankFromPoints(points: number): Rank {
  let step = 0;
  for (let i = 0; i < STEPS; i++) if (points >= POINTS_PER_STEP[i]) step = i;
  const next = POINTS_PER_STEP[step + 1];
  const progress = next === undefined ? 1 : (points - POINTS_PER_STEP[step]) / (next - POINTS_PER_STEP[step]);
  const tier = Math.floor(step / 3);
  const level = ((step % 3) + 1) as 1 | 2 | 3;
  return { tier, level, progress: Math.min(1, Math.max(0, progress)), label: `${RANK_NAMES[tier]} ${ROMAN[level - 1]}` };
}
