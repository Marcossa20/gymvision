// Teoría (Reto 3, discapacidad auditiva / ruido del gimnasio): ningún aviso depende solo del sonido.
// Cada evento = vibración (haptics.ts) + señal visual (banner) + sonido opcional (ajuste).
import { create } from 'zustand';
import { useSettings } from '../store/settings';
import { hapticCardio, hapticError, hapticFinDescanso, hapticQrLeido, hapticSerieGuardada, hapticSubidaRango } from './haptics';

export type AlertKind = 'serie' | 'descanso' | 'rango' | 'cardio' | 'qr' | 'error' | 'info';

interface AlertState {
  current: { id: number; kind: AlertKind; message: string; actionLabel?: string; onAction?: () => void } | null;
  show: (kind: AlertKind, message: string, opts?: { actionLabel?: string; onAction?: () => void; ms?: number }) => void;
  hide: () => void;
}

let timer: ReturnType<typeof setTimeout> | undefined;
let counter = 0;

export const useAlerts = create<AlertState>((set) => ({
  current: null,
  show: (kind, message, opts) => {
    if (timer) clearTimeout(timer);
    const id = ++counter;
    set({ current: { id, kind, message, actionLabel: opts?.actionLabel, onAction: opts?.onAction } });
    timer = setTimeout(() => set((s) => (s.current?.id === id ? { current: null } : s)), opts?.ms ?? 3500);
  },
  hide: () => set({ current: null }),
}));

const haptic: Record<AlertKind, () => void> = {
  serie: hapticSerieGuardada, descanso: hapticFinDescanso, rango: hapticSubidaRango,
  cardio: hapticCardio, qr: hapticQrLeido, error: hapticError, info: () => {},
};

/** Dispara un aviso con todos sus canales según los ajustes del usuario. */
export function notify(kind: AlertKind, message: string, opts?: { actionLabel?: string; onAction?: () => void; ms?: number }) {
  haptic[kind]();
  if (useSettings.getState().visualAlerts) useAlerts.getState().show(kind, message, opts);
  // TODO: sonido opcional (settings.sound) con expo-audio cuando se añada el asset.
}
