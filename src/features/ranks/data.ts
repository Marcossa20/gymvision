// Rangos por músculo, por grupo y general a partir de los puntos por ejercicio.
// Contrato REPARTO §2.3: B solo LEE useWorkout.points; nunca lo escribe.
// Modo demostración (Laboratorio): puntos de ejemplo para enseñar el mapa y los modos de daltonismo
// sin tener que entrenar antes. Vive en un store propio de B.
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { exercises, type Exercise, type Muscle } from '../../data/seed';
import { rankFromPoints, type Rank } from '../../domain/ranks';
import { useWorkout } from '../../store/workout';

/** Grupos de la lista «Rangos por músculo» (Figma 2:2). */
export const MUSCLE_GROUPS: { id: string; name: string; muscles: Muscle[] }[] = [
  { id: 'brazos', name: 'Brazos', muscles: ['biceps', 'triceps', 'antebrazos'] },
  { id: 'pecho', name: 'Pecho', muscles: ['pecho'] },
  { id: 'espalda', name: 'Espalda', muscles: ['dorsales', 'trapecio', 'lumbar'] },
  { id: 'piernas', name: 'Piernas', muscles: ['cuadriceps', 'femoral', 'gluteos', 'gemelos', 'aductores', 'abductores'] },
  { id: 'hombros', name: 'Hombros', muscles: ['hombros'] },
];

/**
 * Datos de demostración: como si la app se llevara usando un mes. Valores elegidos para que los rangos
 * coincidan con el Figma (general Oro III al 72 %, Brazos Diamante II, Pecho Esmeralda I, Espalda Oro III,
 * Piernas Rubí I, Hombros Plata III).
 */
const DEMO_MUSCLE_POINTS: Partial<Record<Muscle, number>> = {
  biceps: 8700, triceps: 7000, pecho: 4934, hombros: 1200, dorsales: 2900, trapecio: 2500, lumbar: 2400,
  cuadriceps: 3200, gluteos: 2900, gemelos: 2900, abdominales: 4700,
};
const DEMO_GENERAL_POINTS = 2560; // Oro III · 72 % hacia Rubí
const DEMO_FACTOR = [1, 0.62, 0.8, 0.5, 0.72]; // varía el rango de cada ejercicio dentro de un mismo músculo

/** Modo demostración: activado por defecto para poder presentar la app; se desactiva en el Laboratorio. */
export const useRanksDemo = create<{ demo: boolean; toggle: () => void }>()(
  persist(
    (set) => ({ demo: true, toggle: () => set((s) => ({ demo: !s.demo })) }),
    { name: 'gv-demo', storage: createJSONStorage(() => AsyncStorage), partialize: (s) => ({ demo: s.demo }) },
  ),
);

export interface MuscleRank { muscle: Muscle; points: number; rank: Rank | null }

const rankOrNull = (p: number) => (p > 0 ? rankFromPoints(p) : null);

/** Puntos de cada ejercicio (reales o de demostración). */
export function useExercisePoints(): Record<string, number> {
  const real = useWorkout((s) => s.points);
  const demo = useRanksDemo((s) => s.demo);
  return useMemo(() => {
    if (!demo) return real;
    const out: Record<string, number> = {};
    exercises.forEach((e, i) => {
      const ps = e.muscles.map((m) => DEMO_MUSCLE_POINTS[m] ?? 0);
      const best = ps.length ? Math.max(...ps) : 0;
      if (best) out[e.id] = Math.round(best * DEMO_FACTOR[i % DEMO_FACTOR.length]);
    });
    return out;
  }, [real, demo]);
}

export const exerciseRank = (points: Record<string, number>, e: Exercise) => rankOrNull(points[e.id] ?? 0);

/** Rango de cada músculo = el mejor de los ejercicios que lo trabajan. */
export function useMuscleRanks() {
  const { i18n: inst } = useTranslation(); // los nombres de rango se recalculan al cambiar de idioma
  const points = useExercisePoints();
  const demo = useRanksDemo((s) => s.demo);
  return useMemo(() => {
    const byMuscle = {} as Record<Muscle, MuscleRank>;
    const all = new Set<Muscle>(MUSCLE_GROUPS.flatMap((g) => g.muscles).concat(['abdominales', 'cuello']));
    for (const m of all) {
      const p = demo
        ? DEMO_MUSCLE_POINTS[m] ?? 0
        : Math.max(0, ...exercises.filter((e) => e.muscles.includes(m)).map((e) => points[e.id] ?? 0));
      byMuscle[m] = { muscle: m, points: p, rank: rankOrNull(p) };
    }
    const avg = (ms: Muscle[]) => {
      const ranked = ms.map((m) => byMuscle[m].points).filter((p) => p > 0);
      return ranked.length ? ranked.reduce((a, b) => a + b, 0) / ranked.length : 0;
    };
    const groups = MUSCLE_GROUPS.map((g) => ({
      ...g,
      rank: rankOrNull(avg(g.muscles)),
      ranked: g.muscles.filter((m) => byMuscle[m].rank).length,
    }));
    const general = rankOrNull(demo ? DEMO_GENERAL_POINTS : avg([...all]));
    return { byMuscle, groups, general, points };
  }, [points, demo, inst.language]);
}
