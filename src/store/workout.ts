// Teoría (tolerancia a errores, RNF3): borrar una serie es deshacible (snackbar «Deshacer»).
// Teoría (RF6): el descanso arranca solo al registrar una serie y vive integrado en la pantalla de entreno.
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { exerciseById, registerExercise, routines as seedRoutines, type Exercise, type Muscle, type Routine } from '../data/seed';
import { notify } from '../services/alerts';
import { pointsFor, rankFromPoints } from '../domain/ranks';

export interface SetItem { weight: number; reps: number; done: boolean }
export interface ActiveExercise { exerciseId: string; restSec: number; sets: SetItem[]; /** Cardio: objetivo único (min | pasos | km). */ goal?: 'time' | 'steps' | 'distance'; target?: number }
export interface ActiveWorkout { routineId: string; name: string; startedAt: number; items: ActiveExercise[] }
export interface LastSets { date: number; sets: { weight: number; reps: number }[] }
/** Récord personal: más peso que tu mejor marca anterior en ese ejercicio. */
export interface PersonalRecord { exerciseId: string; weight: number; reps: number; delta: number }
export interface WorkoutRecord {
  id: string; name: string; date: number; durationMin: number; volume: number; sets: number; points: number;
  /** Opcionales: los entrenos antiguos y el modo demostración de Perfil no los tienen. */
  records?: PersonalRecord[];
  /** Reparto de series por músculo (0-100), de mayor a menor. */
  muscles?: { muscle: Muscle; pct: number }[];
  /** Músculo cuyo rango más avanzó hoy (puntos antes y después). */
  rankDelta?: { muscle: Muscle; before: number; after: number };
}

interface WorkoutState {
  routines: Routine[];
  customExercises: Exercise[];
  active: ActiveWorkout | null;
  restEndsAt: number | null;
  history: WorkoutRecord[];
  points: Record<string, number>; // puntos por ejercicio → rango
  /** Últimas series completadas por ejercicio («Última vez: 32 kg × 12 · hace 2 días · 3 series»). */
  lastSets: Record<string, LastSets>;
  /** Mejor peso por ejercicio, para detectar récords. */
  bestWeight: Record<string, number>;
  streak: number;
  lastUndo: { exIndex: number; setIndex: number; set: SetItem } | null;
  lastSummary: WorkoutRecord | null;
  rankedUp: { from: string; to: string } | null;

  start: (routineId: string) => void;
  startQuick: (exerciseId: string) => void;
  toggleSet: (ex: number, set: number) => void;
  setWeight: (ex: number, set: number, weight: number) => void;
  setReps: (ex: number, set: number, reps: number) => void;
  addSet: (ex: number) => void;
  removeSet: (ex: number, set: number) => void;
  undoRemove: () => void;
  adjustRest: (deltaSec: number) => void;
  skipRest: () => void;
  finish: () => WorkoutRecord | null;
  discard: () => void;
  addCustomExercise: (e: Exercise) => void;
  duplicateRoutine: (id: string) => void;
  deleteRoutine: (id: string) => Routine | undefined;
  restoreRoutine: (r: Routine) => void;
  saveRoutine: (r: Routine) => void;
}

export const useWorkout = create<WorkoutState>()(
  persist(
    (set, get) => ({
      routines: seedRoutines,
      customExercises: [],
      active: null,
      restEndsAt: null,
      history: [],
      points: {},
      lastSets: {},
      bestWeight: {},
      streak: 3,
      lastUndo: null,
      lastSummary: null,
      rankedUp: null,

      start: (routineId) => {
        const r = get().routines.find((x) => x.id === routineId);
        if (!r) return;
        set({
          restEndsAt: null, lastUndo: null, rankedUp: null,
          active: {
            routineId, name: r.name, startedAt: Date.now(),
            items: r.exercises.map((e) => ({
              exerciseId: e.exerciseId, restSec: e.restSec, goal: e.goal, target: e.target,
              sets: Array.from({ length: e.sets }, () => ({ weight: e.weight, reps: e.reps, done: false })),
            })),
          },
        });
      },

      // Entreno rápido: se llega aquí al escanear una máquina (REPARTO.md §2.1). Si ya hay entreno, se añade el ejercicio.
      startQuick: (exerciseId) => {
        const a = get().active;
        const newItem: ActiveExercise = { exerciseId, restSec: 90, sets: Array.from({ length: 3 }, () => ({ weight: 20, reps: 10, done: false })) };
        if (a) {
          if (!a.items.some((i) => i.exerciseId === exerciseId)) set({ active: { ...a, items: [...a.items, newItem] } });
          return;
        }
        set({ restEndsAt: null, lastUndo: null, rankedUp: null, active: { routineId: 'quick', name: 'Entreno rápido', startedAt: Date.now(), items: [newItem] } });
      },

      toggleSet: (ex, si) => {
        const a = get().active;
        if (!a) return;
        const item = a.items[ex];
        const s = item.sets[si];
        const done = !s.done;
        const items = a.items.map((it, i) => i !== ex ? it : { ...it, sets: it.sets.map((x, j) => j === si ? { ...x, done } : x) });
        set({ active: { ...a, items }, restEndsAt: done ? Date.now() + item.restSec * 1000 : get().restEndsAt });
        if (done) notify('serie', `Serie guardada · ${s.weight} kg × ${s.reps}`);
      },

      setWeight: (ex, si, weight) => patchSet(set, get, ex, si, { weight: Math.max(0, Math.round(weight * 2) / 2) }),
      setReps: (ex, si, reps) => patchSet(set, get, ex, si, { reps: Math.max(1, reps) }),

      addSet: (ex) => {
        const a = get().active; if (!a) return;
        const last = a.items[ex].sets.at(-1) ?? { weight: 20, reps: 10, done: false };
        set({ active: { ...a, items: a.items.map((it, i) => i === ex ? { ...it, sets: [...it.sets, { ...last, done: false }] } : it) } });
      },

      removeSet: (ex, si) => {
        const a = get().active; if (!a || a.items[ex].sets.length <= 1) return;
        const removed = a.items[ex].sets[si];
        set({
          active: { ...a, items: a.items.map((it, i) => i === ex ? { ...it, sets: it.sets.filter((_, j) => j !== si) } : it) },
          lastUndo: { exIndex: ex, setIndex: si, set: removed },
        });
        notify('info', 'Serie eliminada', { actionLabel: 'Deshacer', onAction: () => get().undoRemove(), ms: 5000 });
      },

      undoRemove: () => {
        const { active: a, lastUndo: u } = get(); if (!a || !u) return;
        set({
          lastUndo: null,
          active: { ...a, items: a.items.map((it, i) => { if (i !== u.exIndex) return it; const sets = [...it.sets]; sets.splice(u.setIndex, 0, u.set); return { ...it, sets }; }) },
        });
      },

      adjustRest: (d) => { const r = get().restEndsAt; if (r) set({ restEndsAt: Math.max(Date.now(), r + d * 1000) }); },
      skipRest: () => set({ restEndsAt: null }),

      finish: () => {
        const { active: a, history, points, streak, lastSets, bestWeight } = get(); if (!a) return null;
        const newBest = { ...bestWeight };
        const records: PersonalRecord[] = [];
        const musclePoints = (map: Record<string, number>, m: Muscle) => Math.max(0, ...Object.entries(map).filter(([id]) => exerciseById(id)?.muscles.includes(m)).map(([, v]) => v));
        const newLast = { ...lastSets };
        let volume = 0, sets = 0, gained = 0;
        const newPoints = { ...points };
        let rankedUp: { from: string; to: string } | null = null;
        for (const it of a.items) {
          const done = it.sets.filter((x) => x.done).map((x) => ({ weight: x.weight, reps: x.reps }));
          if (done.length) newLast[it.exerciseId] = { date: Date.now(), sets: done };
          if (done.length) {
            const top = done.reduce((b, x) => (x.weight > b.weight ? x : b));
            const prev = newBest[it.exerciseId];
            if (prev !== undefined && top.weight > prev) records.push({ exerciseId: it.exerciseId, weight: top.weight, reps: top.reps, delta: top.weight - prev });
            newBest[it.exerciseId] = Math.max(prev ?? 0, top.weight);
          }
        }
        for (const it of a.items) for (const s of it.sets) if (s.done) {
          volume += s.weight * s.reps; sets++;
          const p = pointsFor(s.weight, s.reps);
          const before = rankFromPoints(newPoints[it.exerciseId] ?? 0);
          newPoints[it.exerciseId] = Math.max(newPoints[it.exerciseId] ?? 0, p);
          const after = rankFromPoints(newPoints[it.exerciseId]);
          gained += Math.max(0, after.tier * 3 + after.level - (before.tier * 3 + before.level));
          if (after.label !== before.label && !rankedUp) rankedUp = { from: before.label, to: after.label };
        }
        // Músculos trabajados: reparto de las series completadas entre los músculos de cada ejercicio.
        const setsByMuscle: Partial<Record<Muscle, number>> = {};
        let muscleTotal = 0;
        for (const it of a.items) {
          const n = it.sets.filter((x) => x.done).length;
          if (!n) continue;
          for (const m of exerciseById(it.exerciseId).muscles) { setsByMuscle[m] = (setsByMuscle[m] ?? 0) + n; muscleTotal += n; }
        }
        const muscles = (Object.entries(setsByMuscle) as [Muscle, number][])
          .sort((x, y) => y[1] - x[1]).slice(0, 4).map(([muscle, n]) => ({ muscle, pct: Math.round((n / Math.max(1, muscleTotal)) * 100) }));
        // Músculo cuyo rango más avanzó (puntos = mejor ejercicio que lo trabaja).
        let rankDelta: WorkoutRecord['rankDelta'];
        for (const m of Object.keys(setsByMuscle) as Muscle[]) {
          const b = musclePoints(points, m), af = musclePoints(newPoints, m);
          if (af > b && (!rankDelta || af - b > rankDelta.after - rankDelta.before)) rankDelta = { muscle: m, before: b, after: af };
        }
        const rec: WorkoutRecord = {
          id: String(Date.now()), name: a.name, date: Date.now(),
          durationMin: Math.max(1, Math.round((Date.now() - a.startedAt) / 60000)), volume: Math.round(volume), sets, points: gained,
          records, muscles, rankDelta,
        };
        set({ active: null, restEndsAt: null, history: [rec, ...history], points: newPoints, lastSets: newLast, bestWeight: newBest, streak: streak + 1, lastSummary: rec, rankedUp });
        return rec;
      },

      discard: () => set({ active: null, restEndsAt: null }),

      addCustomExercise: (e) => { registerExercise(e); set({ customExercises: [...get().customExercises, e] }); },
      duplicateRoutine: (id) => {
        const r = get().routines.find((x) => x.id === id); if (!r) return;
        set({ routines: [...get().routines, { ...r, id: `r${Date.now()}`, name: `${r.name} (copia)`, days: [], exercises: r.exercises.map((e) => ({ ...e })) }] });
      },
      deleteRoutine: (id) => {
        const r = get().routines.find((x) => x.id === id);
        set({ routines: get().routines.filter((x) => x.id !== id) });
        return r;
      },
      restoreRoutine: (r) => set({ routines: [...get().routines, r] }),
      saveRoutine: (r) => {
        const exists = get().routines.some((x) => x.id === r.id);
        set({ routines: exists ? get().routines.map((x) => (x.id === r.id ? r : x)) : [...get().routines, r] });
      },
    }),
    {
      name: 'gv-workout', storage: createJSONStorage(() => AsyncStorage),
      // v1: las rutinas pasan de `day` (texto) a `days` (array de 0..6). Se normalizan las guardadas con el formato antiguo.
      version: 1,
      migrate: (persisted, version) => {
        const s = persisted as Partial<WorkoutState>;
        if (version < 1) s.routines = (s.routines ?? seedRoutines).map((r) => ({ ...r, days: Array.isArray(r.days) ? r.days : [] }));
        return s as WorkoutState;
      },
      onRehydrateStorage: () => (state) => { state?.customExercises.forEach(registerExercise); },
      partialize: (s) => ({ routines: s.routines, customExercises: s.customExercises, history: s.history, points: s.points, lastSets: s.lastSets, bestWeight: s.bestWeight, streak: s.streak, active: s.active, restEndsAt: s.restEndsAt }),
    },
  ),
);

function patchSet(set: (p: Partial<WorkoutState>) => void, get: () => WorkoutState, ex: number, si: number, patch: Partial<SetItem>) {
  const a = get().active; if (!a) return;
  set({ active: { ...a, items: a.items.map((it, i) => i !== ex ? it : { ...it, sets: it.sets.map((x, j) => j === si ? { ...x, ...patch } : x) }) } });
}

export { exerciseById };
