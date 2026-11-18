// Datos locales de Mi gimnasio: socio, gimnasio y taquilla (offline, RNF5).
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type LockerState = 'closed' | 'open';

interface GymState {
  gymName: string;
  memberNo: string;
  /** Secreto local con el que se firma el QR rotativo (simulado, sin servidor). */
  memberSecret: string;
  lockerNo: number;
  locker: LockerState;
  lockerOpenedAt: number | null;
  setLocker: (s: LockerState) => void;
}

/** La cerradura se vuelve a bloquear sola al cerrar la puerta: pasado este tiempo se muestra «Cerrada». */
export const LOCKER_RELOCK_MS = 2 * 60 * 1000;

export const useGym = create<GymState>()(
  persist(
    (set) => ({
      gymName: 'Gimnasio Centro',
      memberNo: '004281',
      memberSecret: Math.random().toString(36).slice(2, 12),
      lockerNo: 128,
      locker: 'closed',
      lockerOpenedAt: null,
      setLocker: (locker) => set({ locker, lockerOpenedAt: locker === 'open' ? Date.now() : null }),
    }),
    { name: 'gv-gym', storage: createJSONStorage(() => AsyncStorage), partialize: ({ setLocker: _s, ...rest }) => rest },
  ),
);

/** Estado efectivo de la taquilla (aplica el auto-bloqueo). */
export function useLockerState(): LockerState {
  const locker = useGym((s) => s.locker);
  const at = useGym((s) => s.lockerOpenedAt);
  return locker === 'open' && at !== null && Date.now() - at < LOCKER_RELOCK_MS ? 'open' : 'closed';
}
