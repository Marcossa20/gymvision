// Teoría (La Persona, háptica): feedback sin mirar la pantalla; cada evento tiene un patrón distinto y reconocible.
// Reto 3 (auditiva): la vibración nunca va sola, cada aviso emite además una señal visual (ver services/alerts.ts).
import { Platform, Vibration } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSettings } from '../store/settings';

const enabled = () => useSettings.getState().vibration;

/** Patrón [espera, vibra, espera, vibra…] en ms (Android); en iOS se emula con impactos. */
function pattern(ms: number[]) {
  if (!enabled()) return;
  Vibration.vibrate(ms);
}

async function iosPulses(count: number, gap: number, style: Haptics.ImpactFeedbackStyle) {
  for (let i = 0; i < count; i++) {
    await Haptics.impactAsync(style);
    if (i < count - 1) await new Promise((r) => setTimeout(r, gap));
  }
}

function run(androidMs: number[], ios: () => Promise<void> | void) {
  if (!enabled()) return;
  if (Platform.OS === 'android') pattern(androidMs);
  else void ios();
}

/** Serie guardada: 1 pulso corto (~40 ms). */
export const hapticSerieGuardada = () =>
  run([0, 40], () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));

/** Fin de descanso: 3 pulsos medios. */
export const hapticFinDescanso = () =>
  run([0, 120, 100, 120, 100, 120], () => iosPulses(3, 120, Haptics.ImpactFeedbackStyle.Medium));

/** Subida de rango: corto-corto-largo. */
export const hapticSubidaRango = () =>
  run([0, 50, 80, 50, 80, 300], async () => {
    await iosPulses(2, 80, Haptics.ImpactFeedbackStyle.Light);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  });

/** Inicio/fin de cardio: 2 pulsos cortos. */
export const hapticCardio = () =>
  run([0, 50, 100, 50], () => iosPulses(2, 100, Haptics.ImpactFeedbackStyle.Light));

/** Error / acción no válida: 1 pulso largo (~300 ms). */
export const hapticError = () =>
  run([0, 300], () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error));

/** Código QR leído: 1 pulso corto. */
export const hapticQrLeido = () =>
  run([0, 40], () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));

/** Selección/tick de ajuste de peso al deslizar. */
export const hapticTick = () => {
  if (enabled() && Platform.OS !== 'web') void Haptics.selectionAsync();
};
