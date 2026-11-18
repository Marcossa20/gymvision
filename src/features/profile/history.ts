// Historial para Perfil: lee useWorkout.history (solo lectura, contrato §2.3) o, en modo
// demostración (Laboratorio), un historial de ejemplo con series por ejercicio como el del Figma.
import { useMemo } from 'react';
import { exercises, routines, type Muscle } from '../../data/seed';
import { useWorkout } from '../../store/workout';
import { useRanksDemo } from '../ranks/data';

export interface SetRow { weight: number; reps: number; record?: boolean }
export interface ExerciseLog { name: string; muscle: Muscle; sets: SetRow[] }
export interface HistoryItem {
  id: string;
  name: string;
  date: number;
  durationMin: number;
  volume: number;
  sets: number;
  muscles: Muscle[];
  /** Series por ejercicio (solo en demo hasta que el historial real las guarde — issue #4). */
  exercises?: ExerciseLog[];
  records: number;
}

const DAY = 86400000;

function demoHistory(now: number): HistoryItem[] {
  const pick = (name: string, muscle: Muscle, sets: [number, number, boolean?][]): ExerciseLog =>
    ({ name, muscle, sets: sets.map(([weight, reps, record]) => ({ weight, reps, record })) });
  const templates: Omit<HistoryItem, 'id' | 'date' | 'volume' | 'sets' | 'records'>[] = [
    { name: 'Pecho y tríceps', durationMin: 71, muscles: ['pecho', 'triceps'], exercises: [
      pick('Press de pecho inclinado (máquina)', 'pecho', [[70, 10, true], [70, 9], [70, 8], [70, 6]]),
      pick('Aperturas en máquina (contractora)', 'pecho', [[45, 12], [45, 11], [50, 9]]),
      pick('Extensión de tríceps en polea', 'triceps', [[30, 12], [32.5, 10], [35, 9, true], [35, 8]]),
      pick('Press francés con barra Z', 'triceps', [[25, 12], [25, 10], [25, 9]]),
      pick('Extensión sobre la cabeza (cuerda)', 'triceps', [[20, 15], [22.5, 12], [25, 10], [25, 9]]),
    ] },
    { name: 'Pierna', durationMin: 68, muscles: ['cuadriceps', 'gluteos'], exercises: [
      pick('Prensa de piernas (máquina)', 'cuadriceps', [[160, 12], [180, 10], [200, 8, true]]),
      pick('Sentadilla con barra', 'cuadriceps', [[80, 10], [90, 8], [90, 8]]),
      pick('Hip thrust', 'gluteos', [[100, 12], [110, 10], [110, 10]]),
    ] },
    { name: 'Espalda y bíceps', durationMin: 84, muscles: ['dorsales', 'biceps'], exercises: [
      pick('Jalón al pecho agarre prono (máquina)', 'dorsales', [[55, 12], [60, 10], [60, 9]]),
      pick('Remo con barra', 'dorsales', [[60, 10], [65, 8], [65, 8]]),
      pick('Curl con barra', 'biceps', [[30, 12], [32.5, 10], [32.5, 8]]),
    ] },
    { name: 'Hombros', durationMin: 54, muscles: ['hombros'], exercises: [
      pick('Press militar con mancuernas', 'hombros', [[22, 10], [22, 9], [24, 7, true]]),
      pick('Elevaciones laterales en polea baja', 'hombros', [[10, 15], [10, 14], [12, 12]]),
    ] },
  ];
  // 24 entrenos en algo más de un mes (4–5 por semana), el último hoy.
  const offsets = [0, 1, 2, 4, 5, 7, 8, 9, 11, 12, 14, 15, 16, 18, 19, 21, 22, 23, 25, 26, 28, 29, 32, 34];
  return offsets.map((d, i) => {
    const t = templates[i % templates.length];
    const scale = 1 - i * 0.008;
    const exs = t.exercises!.map((e) => ({ ...e, sets: e.sets.map((s) => ({ ...s, weight: Math.round(s.weight * scale * 2) / 2, record: i < 4 ? s.record : undefined })) }));
    const all = exs.flatMap((e) => e.sets);
    return {
      ...t, exercises: exs, id: `demo-${i}`, date: now - d * DAY - 3600000 * 2,
      volume: Math.round(all.reduce((a, s) => a + s.weight * s.reps, 0)), sets: all.length, records: all.filter((s) => s.record).length,
    };
  });
}

/** Músculos de un entreno real: los de la rutina con ese nombre (WorkoutRecord no guarda la rutina). */
function musclesFor(name: string): Muscle[] {
  const r = routines.find((x) => x.name === name);
  if (!r) return [];
  if (r.focus.length) return r.focus;
  return [...new Set(r.exercises.flatMap((e) => exercises.find((x) => x.id === e.exerciseId)?.muscles ?? []))];
}

export function useHistory(): HistoryItem[] {
  const history = useWorkout((s) => s.history);
  const demo = useRanksDemo((s) => s.demo);
  return useMemo(() => {
    if (demo) return demoHistory(Date.now());
    // Récord (aprox.): entreno con más volumen que todos los anteriores.
    const sorted = [...history].sort((a, b) => a.date - b.date);
    let best = 0;
    const rec = new Map<string, number>();
    for (const h of sorted) { rec.set(h.id, h.volume > best && best > 0 ? 1 : 0); best = Math.max(best, h.volume); }
    return history
      .map((h) => ({ id: h.id, name: h.name, date: h.date, durationMin: h.durationMin, volume: h.volume, sets: h.sets, muscles: musclesFor(h.name), records: rec.get(h.id) ?? 0 }))
      .sort((a, b) => b.date - a.date);
  }, [history, demo]);
}
