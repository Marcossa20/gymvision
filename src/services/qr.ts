// Teoría (El Ordenador, cámara/QR — RF4): reconocimiento antes que recuerdo; el usuario no busca el
// ejercicio en un catálogo, apunta a la máquina y la app lo abre (menos carga de memoria).
// Tolerancia a errores: si el QR está dañado hay código manual con el mismo formato (PB-0142).
import { exerciseByCode } from '../data/seed';
import type { Exercise } from '../data/seed';

/** Formato del código de máquina: 2 letras, guion y 4 cifras (PB-0142). */
export const MACHINE_CODE = /\b([A-Z]{2})-?(\d{4})\b/i;

/**
 * Extrae el código de máquina de lo que haya en el QR o lo que teclee el usuario.
 * Acepta «PB-0142», «pb0142», «gymvision://machine/PB-0142» o una URL que lo contenga.
 */
export function parseMachineCode(raw: string): string | null {
  const m = MACHINE_CODE.exec(raw.trim());
  return m ? `${m[1].toUpperCase()}-${m[2]}` : null;
}

export type MachineLookup =
  | { ok: true; code: string; exercise: Exercise }
  | { ok: false; code: string | null; reason: 'format' | 'not-found' };

/** Código → ejercicio (contrato REPARTO §2.1: exerciseByCode de seed.ts). */
export function lookupMachine(raw: string): MachineLookup {
  const code = parseMachineCode(raw);
  if (!code) return { ok: false, code: null, reason: 'format' };
  const exercise = exerciseByCode(code);
  return exercise ? { ok: true, code, exercise } : { ok: false, code, reason: 'not-found' };
}

/** Ruta del registro de series de esa máquina (la implementa A). */
export const machineRoute = (exerciseId: string) => `/workout/machine/${exerciseId}`;

/**
 * onBarcodeScanned se dispara muchas veces por segundo con el mismo QR:
 * este guard deja pasar una lectura y bloquea las repetidas durante `cooldownMs`.
 */
export function createScanGuard(cooldownMs = 2000) {
  let lastData = '';
  let lastT = -Infinity;
  return (data: string, now = Date.now()) => {
    if (data === lastData && now - lastT < cooldownMs) return false;
    if (now - lastT < 600) return false; // evita ráfagas al mover la cámara entre dos QR
    lastData = data;
    lastT = now;
    return true;
  };
}
