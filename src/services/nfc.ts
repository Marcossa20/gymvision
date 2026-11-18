// Teoría (El Ordenador, NFC — RF3): abrir la taquilla acercando el móvil, sin llave ni candado.
// Interacción de proximidad = gesto físico natural, sin menús ni teclear (menos carga cognitiva).
// Plan B obligatorio: simulateLockTag() para demostrar el flujo sin etiqueta NFC o en móviles sin NFC.
import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import type NfcManagerType from 'react-native-nfc-manager';
import type { NfcTech as NfcTechType, Ndef as NdefType, TagEvent } from 'react-native-nfc-manager';

// Carga perezosa: en Expo Go (sin el módulo nativo) la app no debe romperse, solo informar.
type NfcModule = { default: typeof NfcManagerType; NfcTech: typeof NfcTechType; Ndef: typeof NdefType };
let mod: NfcModule | null | undefined;
function nfc(): NfcModule | null {
  if (mod !== undefined) return mod;
  // En Expo Go el módulo nativo no existe y la librería lanza al cargarse: ni se intenta.
  if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) return (mod = null);
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    mod = require('react-native-nfc-manager') as NfcModule;
  } catch {
    mod = null;
  }
  return mod;
}

export type NfcStatus = 'unsupported' | 'disabled' | 'ready';

/** Formato del texto NDEF grabado en la etiqueta de la cerradura: «GV-LOCKER:027». */
export const LOCKER_PAYLOAD = /^GV-LOCKER:(\d{1,4})$/i;

export interface LockTag {
  lockerId: string;
  /** Id hardware de la etiqueta (si hay). */
  tagId?: string;
  simulated: boolean;
}

let started = false;

export async function getNfcStatus(): Promise<NfcStatus> {
  const m = nfc();
  if (!m || Platform.OS === 'web') return 'unsupported';
  try {
    if (!(await m.default.isSupported())) return 'unsupported';
    if (!started) {
      await m.default.start();
      started = true;
    }
    // En iOS isEnabled no aplica (siempre activo si hay soporte).
    if (Platform.OS === 'android' && !(await m.default.isEnabled())) return 'disabled';
    return 'ready';
  } catch {
    return 'unsupported';
  }
}

/** Interpreta la etiqueta: texto NDEF «GV-LOCKER:n»; si no lo tiene, usa el id de la etiqueta (cualquier pegatina NFC vale para la demo). */
export function parseLockTag(tag: TagEvent | null, Ndef?: typeof NdefType): LockTag | null {
  if (!tag) return null;
  for (const rec of tag.ndefMessage ?? []) {
    try {
      const text = Ndef ? Ndef.text.decodePayload(Uint8Array.from(rec.payload)) : '';
      const match = LOCKER_PAYLOAD.exec(text.trim());
      if (match) return { lockerId: String(Number(match[1])), tagId: tag.id, simulated: false };
    } catch {
      // registro no textual: se ignora
    }
  }
  if (tag.id) return { lockerId: lockerFromTagId(tag.id), tagId: tag.id, simulated: false };
  return null;
}

/** Nº de taquilla estable (1..120) derivado del id hardware, para etiquetas sin grabar. */
function lockerFromTagId(id: string) {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return String((h % 120) + 1);
}

/**
 * Espera a que el usuario acerque el móvil a la cerradura.
 * Se puede cancelar con cancelNfc() (o al salir de la pantalla). Lanza Error con mensaje en español.
 */
export async function readLockTag(timeoutMs = 30000): Promise<LockTag> {
  const m = nfc();
  if (!m) throw new Error('Este móvil o esta build no tiene NFC. Usa «Simular cerradura».');
  const status = await getNfcStatus();
  if (status === 'unsupported') throw new Error('Este móvil no tiene NFC. Usa «Simular cerradura».');
  if (status === 'disabled') throw new Error('Activa el NFC en los ajustes del móvil.');

  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const read = (async () => {
      await m.default.requestTechnology([m.NfcTech.Ndef, m.NfcTech.NfcA], {
        alertMessage: 'Acerca la parte de arriba del móvil a la cerradura',
      });
      const tag = await m.default.getTag();
      const parsed = parseLockTag(tag, m.Ndef);
      if (!parsed) throw new Error('Etiqueta no reconocida. Prueba otra vez.');
      if (Platform.OS === 'ios') await m.default.setAlertMessageIOS('Taquilla abierta').catch(() => {});
      return parsed;
    })();
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error('No se detectó la cerradura. Inténtalo de nuevo.')), timeoutMs);
    });
    return await Promise.race([read, timeout]);
  } catch (e) {
    const msg = e instanceof Error && e.message ? e.message : '';
    // Cancelación del usuario / del sistema → mensaje genérico
    if (!msg || /cancel/i.test(msg)) throw new Error('Lectura cancelada.');
    throw e instanceof Error ? e : new Error('Error al leer la cerradura.');
  } finally {
    if (timer) clearTimeout(timer);
    await cancelNfc();
  }
}

export async function cancelNfc() {
  const m = nfc();
  if (!m) return;
  try {
    await m.default.cancelTechnologyRequest();
  } catch {
    // no había sesión abierta
  }
}

/** Plan B (dev / demo): simula acercar el móvil a la cerradura. */
export async function simulateLockTag(lockerId = '27', delayMs = 700): Promise<LockTag> {
  await new Promise((r) => setTimeout(r, delayMs));
  return { lockerId, simulated: true };
}
