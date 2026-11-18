// Teoría (Reto 3, discapacidad auditiva / ruido del gimnasio): el sonido es un canal OPCIONAL más, nunca el único.
// Cada aviso ya vibra y muestra un banner; con Ajustes → Notificaciones → Sonido activado, además suena un pitido
// propio por evento (patrones distintos, como en la háptica). Mezcla con la música del usuario (no la corta) y respeta
// el modo silencio del móvil.
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import { useSettings } from '../store/settings';
import type { AlertKind } from './alerts';

const files: Partial<Record<AlertKind, number>> = {
  serie: require('../../assets/sounds/serie.wav'),
  descanso: require('../../assets/sounds/descanso.wav'),
  rango: require('../../assets/sounds/rango.wav'),
  cardio: require('../../assets/sounds/cardio.wav'),
  qr: require('../../assets/sounds/qr.wav'),
  taquilla: require('../../assets/sounds/taquilla.wav'),
  error: require('../../assets/sounds/error.wav'),
};

const players: Partial<Record<AlertKind, AudioPlayer>> = {};
let modeSet = false;

async function setMode() {
  if (modeSet) return;
  modeSet = true;
  try {
    await setAudioModeAsync({ playsInSilentMode: false, interruptionMode: 'mixWithOthers' });
  } catch {
    // sin ajuste de modo: se usa el del sistema
  }
}

/** Reproduce el pitido del aviso si el usuario tiene el sonido activado. Nunca lanza errores. */
export function playSound(kind: AlertKind) {
  if (!useSettings.getState().sound) return;
  const src = files[kind];
  if (src === undefined) return; // 'info' no suena
  void setMode();
  try {
    let p = players[kind];
    if (!p) {
      p = createAudioPlayer(src);
      players[kind] = p;
    }
    void p.seekTo(0);
    p.play();
  } catch {
    // audio no disponible (p. ej. permisos del sistema): el aviso sigue siendo visible y háptico
  }
}
