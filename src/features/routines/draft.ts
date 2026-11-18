// Borrador de la rutina que se está creando/editando. Nada se guarda en la rutina real hasta pulsar «Guardar».
// Teoría (RNF3, tolerancia a errores): se puede salir sin guardar (con confirmación si hay cambios) y quitar ejercicios con «Deshacer».
import { create } from 'zustand';
import { exerciseById, type Muscle, type Routine, type RoutineExercise } from '../../data/seed';
import { useWorkout } from '../../store/workout';

interface Draft { id: string; isNew: boolean; name: string; days: number[]; exercises: RoutineExercise[] }

interface DraftState {
  draft: Draft | null;
  initial: string;
  load: (routineId: string) => void;
  setName: (name: string) => void;
  toggleDay: (d: number) => void;
  setSelection: (ids: string[]) => void;
  update: (index: number, patch: Partial<RoutineExercise>) => void;
  remove: (index: number) => RoutineExercise | undefined;
  insert: (index: number, item: RoutineExercise) => void;
  move: (from: number, to: number) => void;
  isDirty: () => boolean;
  save: () => Routine | null;
  clear: () => void;
}

const snap = (d: Draft | null) => JSON.stringify(d);

export const defaultExercise = (exerciseId: string): RoutineExercise => {
  const ex = exerciseById(exerciseId);
  return ex.type === 'cardio'
    ? { exerciseId, sets: 1, reps: 1, weight: 0, restSec: 0, goal: 'time', target: 30 }
    : { exerciseId, sets: 3, reps: 10, weight: 20, restSec: 90 };
};

export const useDraft = create<DraftState>((set, get) => ({
  draft: null,
  initial: '',
  load: (routineId) => {
    // Si ya hay un borrador de esta misma rutina (p. ej. al volver de «Añadir ejercicio») se conserva.
    if (get().draft && (get().draft!.id === routineId || (routineId === 'new' && get().draft!.isNew))) return;
    const r = useWorkout.getState().routines.find((x) => x.id === routineId);
    const draft: Draft = r
      ? { id: r.id, isNew: false, name: r.name, days: [...r.days], exercises: r.exercises.map((e) => ({ ...e })) }
      : { id: `r${Date.now()}`, isNew: true, name: '', days: [], exercises: [] };
    set({ draft, initial: snap(draft) });
  },
  setName: (name) => set((s) => ({ draft: s.draft && { ...s.draft, name } })),
  toggleDay: (d) => set((s) => s.draft ? { draft: { ...s.draft, days: s.draft.days.includes(d) ? s.draft.days.filter((x) => x !== d) : [...s.draft.days, d].sort() } } : s),
  setSelection: (ids) => set((s) => {
    if (!s.draft) return s;
    const kept = s.draft.exercises.filter((e) => ids.includes(e.exerciseId));
    const added = ids.filter((id) => !kept.some((e) => e.exerciseId === id)).map(defaultExercise);
    return { draft: { ...s.draft, exercises: [...kept, ...added] } };
  }),
  update: (index, patch) => set((s) => s.draft ? { draft: { ...s.draft, exercises: s.draft.exercises.map((e, i) => (i === index ? { ...e, ...patch } : e)) } } : s),
  remove: (index) => {
    const d = get().draft; if (!d) return undefined;
    const removed = d.exercises[index];
    set({ draft: { ...d, exercises: d.exercises.filter((_, i) => i !== index) } });
    return removed;
  },
  insert: (index, item) => set((s) => { if (!s.draft) return s; const ex = [...s.draft.exercises]; ex.splice(index, 0, item); return { draft: { ...s.draft, exercises: ex } }; }),
  move: (from, to) => set((s) => {
    if (!s.draft || from === to) return s;
    const ex = [...s.draft.exercises]; const [it] = ex.splice(from, 1); ex.splice(to, 0, it);
    return { draft: { ...s.draft, exercises: ex } };
  }),
  isDirty: () => snap(get().draft) !== get().initial,
  save: () => {
    const d = get().draft; if (!d) return null;
    const focus: Muscle[] = [];
    for (const e of d.exercises) for (const m of exerciseById(e.exerciseId).muscles) if (!focus.includes(m)) focus.push(m);
    const routine: Routine = { id: d.id, name: d.name.trim(), days: d.days, focus: focus.slice(0, 3), exercises: d.exercises };
    useWorkout.getState().saveRoutine(routine);
    set({ draft: null, initial: '' });
    return routine;
  },
  clear: () => set({ draft: null, initial: '' }),
}));
