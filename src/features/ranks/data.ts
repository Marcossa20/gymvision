// Rangos por músculo, por grupo y general a partir de los puntos por ejercicio.
// Contrato REPARTO §2.3: B solo LEE useWorkout.points; nunca lo escribe.
// Modo demostración (Laboratorio): puntos de ejemplo para enseñar el mapa y los modos de daltonismo
// sin tener que entrenar antes. Vive en un store propio de B.
import { useMemo } from 'react';
import { create } from 'zustand';
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

/** Puntos de ejemplo por músculo (parecidos a los del Figma). */
const DEMO_MUSCLE_POINTS: Partial<Record<Muscle, number>> = {
  biceps: 8300, triceps: 6900, pecho: 5300, hombros: 1500, dorsales: 3600, trapecio: 2500, lumbar: 3100,
  cuadriceps: 2750, gluteos: 3000, femoral: 800, gemelos: 7000, abdominales: 4700,
};

export const useRanksDemo = create<{ demo: boolean; toggle: () => void }>((set) => ({
  demo: false,
  toggle: () => set((s) => ({ demo: !s.demo })),
}));

export interface MuscleRank { muscle: Muscle; points: number; rank: Rank | null }

const rankOrNull = (p: number) => (p > 0 ? rankFromPoints(p) : null);

/** Puntos de cada ejercicio (reales o de demostración). */
export function useExercisePoints(): Record<string, number> {
  const real = useWorkout((s) => s.points);
  const demo = useRanksDemo((s) => s.demo);
  return useMemo(() => {
    if (!demo) return real;
    const out: Record<string, number> = {};
    for (const e of exercises) {
      const ps = e.muscles.map((m) => DEMO_MUSCLE_POINTS[m] ?? 0);
      if (ps.length) out[e.id] = Math.max(...ps);
    }
    return out;
  }, [real, demo]);
}

export const exerciseRank = (points: Record<string, number>, e: Exercise) => rankOrNull(points[e.id] ?? 0);

/** Rango de cada músculo = el mejor de los ejercicios que lo trabajan. */
export function useMuscleRanks() {
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
    const general = rankOrNull(avg([...all]));
    return { byMuscle, groups, general, points };
  }, [points, demo]);
}
