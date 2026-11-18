// Registro local de las sesiones de cardio (contrato REPARTO §2.2: lo guarda B aquí; A no lo toca).
// Teoría (RNF3, tolerancia a errores): la sesión terminada queda «pendiente» hasta que el usuario la
// guarda o la descarta, y descartar se puede deshacer.
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CardioGoal } from '../features/cardio/catalog';

export interface CardioSession {
  id: string;
  exerciseId: string;
  date: number;
  activeMs: number;
  steps: number;
  distanceKm: number;
  kcal: number;
  points: number;
  goal?: CardioGoal;
  target?: number;
}

interface CardioState {
  sessions: CardioSession[];
  /** Puntos acumulados → rango de Cardio. */
  points: number;
  /** Sesión terminada aún sin guardar (pantalla Resumen). */
  pending: CardioSession | null;
  setPending: (s: CardioSession | null) => void;
  savePending: () => CardioSession | null;
}

export const useCardio = create<CardioState>()(
  persist(
    (set, get) => ({
      sessions: [],
      points: 0,
      pending: null,
      setPending: (pending) => set({ pending }),
      savePending: () => {
        const p = get().pending;
        if (!p) return null;
        set((s) => ({ sessions: [p, ...s.sessions], points: s.points + p.points, pending: null }));
        return p;
      },
    }),
    { name: 'gv-cardio', storage: createJSONStorage(() => AsyncStorage), partialize: (s) => ({ sessions: s.sessions, points: s.points, pending: s.pending }) },
  ),
);
