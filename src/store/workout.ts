// Teoría (tolerancia a errores, RNF3): borrar una serie es deshacible (snackbar «Deshacer»).
// Teoría (RF6): el descanso arranca solo al registrar una serie y vive integrado en la pantalla de entreno.
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { exerciseById, routines as seedRoutines, type Routine } from '../data/seed';
import { notify } from '../services/alerts';
import { pointsFor, rankFromPoints } from '../domain/ranks';

export interface SetItem { weight: number; reps: number; done: boolean }
export interface ActiveExercise { exerciseId: string; restSec: number; sets: SetItem[] }
export interface ActiveWorkout { routineId: string; name: string; startedAt: number; items: ActiveExercise[] }
export interface WorkoutRecord { id: string; name: string; date: number; durationMin: number; volume: number; sets: number; points: number }

interface WorkoutState {
  routines: Routine[];
  active: ActiveWorkout | null;
  restEndsAt: number | null;
  history: WorkoutRecord[];
  points: Record<string, number>; // puntos por ejercicio → rango
  streak: number;
  lastUndo: { exIndex: number; setIndex: number; set: SetItem } | null;
  lastSummary: WorkoutRecord | null;
  rankedUp: { from: string; to: string } | null;

  start: (routineId: string) => void;
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
  deleteRoutine: (id: string) => Routine | undefined;
  restoreRoutine: (r: Routine) => void;
  saveRoutine: (r: Routine) => void;
}

export const useWorkout = create<WorkoutState>()(
  persist(
    (set, get) => ({
      routines: seedRoutines,
      active: null,
      restEndsAt: null,
      history: [],
      points: {},
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
              exerciseId: e.exerciseId, restSec: e.restSec,
              sets: Array.from({ length: e.sets }, () => ({ weight: e.weight, reps: e.reps, done: false })),
            })),
          },
        });
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
        const { active: a, history, points, streak } = get(); if (!a) return null;
        let volume = 0, sets = 0, gained = 0;
        const newPoints = { ...points };
        let rankedUp: { from: string; to: string } | null = null;
        for (const it of a.items) for (const s of it.sets) if (s.done) {
          volume += s.weight * s.reps; sets++;
          const p = pointsFor(s.weight, s.reps);
          const before = rankFromPoints(newPoints[it.exerciseId] ?? 0);
          newPoints[it.exerciseId] = Math.max(newPoints[it.exerciseId] ?? 0, p);
          const after = rankFromPoints(newPoints[it.exerciseId]);
          gained += Math.max(0, after.tier * 3 + after.level - (before.tier * 3 + before.level));
          if (after.label !== before.label && !rankedUp) rankedUp = { from: before.label, to: after.label };
        }
        const rec: WorkoutRecord = {
          id: String(Date.now()), name: a.name, date: Date.now(),
          durationMin: Math.max(1, Math.round((Date.now() - a.startedAt) / 60000)), volume: Math.round(volume), sets, points: gained,
        };
        set({ active: null, restEndsAt: null, history: [rec, ...history], points: newPoints, streak: streak + 1, lastSummary: rec, rankedUp });
        return rec;
      },

      discard: () => set({ active: null, restEndsAt: null }),

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
      partialize: (s) => ({ routines: s.routines, history: s.history, points: s.points, streak: s.streak, active: s.active, restEndsAt: s.restEndsAt }),
    },
  ),
);

function patchSet(set: (p: Partial<WorkoutState>) => void, get: () => WorkoutState, ex: number, si: number, patch: Partial<SetItem>) {
  const a = get().active; if (!a) return;
  set({ active: { ...a, items: a.items.map((it, i) => i !== ex ? it : { ...it, sets: it.sets.map((x, j) => j === si ? { ...x, ...patch } : x) }) } });
}

export { exerciseById };
