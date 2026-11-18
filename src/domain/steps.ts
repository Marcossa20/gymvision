// Teoría (El Ordenador, acelerómetro — RF7): el móvil detecta que el usuario anda y el cronómetro
// arranca/pausa solo, sin tocar la pantalla (una acción menos con las manos ocupadas).
// Detector de pasos propio y puro (sin E/S): se puede probar con muestras grabadas y ajustar en STEP_CONFIG.
//
// Algoritmo:
//  1. Módulo de la aceleración |a| (en g), independiente de cómo se lleve el móvil.
//  2. Se resta la gravedad con una media móvil lenta (paso alto) → solo queda el «rebote» del paso.
//  3. Filtro paso bajo (media exponencial) para quitar vibraciones de alta frecuencia.
//  4. Pico = cruce ascendente del umbral con histéresis + tiempo mínimo entre pasos
//     (cadencia humana al andar/correr ≈ 1,2–2,5 Hz, se admite hasta ~3,3 Hz).
//  5. «Andando» = varios pasos recientes; «parado» = un rato sin pasos.

export interface AccelSample {
  x: number;
  y: number;
  z: number;
  /** Marca de tiempo en ms. */
  t: number;
}

export interface StepConfig {
  /** Peso de la media lenta que estima la gravedad (0..1, más pequeño = más lento). */
  gravityAlpha: number;
  /** Peso del filtro paso bajo (0..1, más grande = menos suavizado). */
  smoothAlpha: number;
  /** Umbral de pico en g (sobre la señal sin gravedad). */
  threshold: number;
  /** Nivel por debajo del cual la señal se «rearma» para el siguiente pico (histéresis). */
  rearm: number;
  /** Tiempo mínimo entre dos pasos (ms). 300 ms ≈ 3,3 pasos/s. */
  minStepMs: number;
  /** Pasos necesarios en la ventana para considerar que anda. */
  walkStartSteps: number;
  /** Ventana para walkStartSteps (ms). */
  walkWindowMs: number;
  /** Sin pasos durante este tiempo → parado (ms). */
  stopAfterMs: number;
}

export const STEP_CONFIG: StepConfig = {
  gravityAlpha: 0.02,
  smoothAlpha: 0.35,
  threshold: 0.11,
  rearm: 0.03,
  minStepMs: 300,
  walkStartSteps: 3,
  walkWindowMs: 3000,
  stopAfterMs: 2000,
};

export interface StepUpdate {
  /** Se ha detectado un paso en esta muestra. */
  step: boolean;
  /** Pasos totales desde el último reset. */
  steps: number;
  /** El usuario está andando (con histéresis). */
  walking: boolean;
  /** Cambió el estado andando/parado en esta muestra. */
  walkingChanged: boolean;
  /** Señal filtrada sin gravedad (g), útil para depurar/visualizar. */
  signal: number;
  /** Módulo bruto (g). */
  magnitude: number;
}

export function createStepDetector(config: StepConfig = STEP_CONFIG) {
  let gravity: number | null = null;
  let smooth = 0;
  let armed = true;
  let lastStepT = -Infinity;
  let steps = 0;
  let walking = false;
  let recent: number[] = []; // marcas de tiempo de los últimos pasos

  function push(s: AccelSample): StepUpdate {
    const magnitude = Math.sqrt(s.x * s.x + s.y * s.y + s.z * s.z);
    gravity = gravity === null ? magnitude : gravity + config.gravityAlpha * (magnitude - gravity);
    smooth = smooth + config.smoothAlpha * (magnitude - gravity - smooth);

    let step = false;
    if (armed && smooth > config.threshold && s.t - lastStepT >= config.minStepMs) {
      step = true;
      armed = false;
      lastStepT = s.t;
      steps++;
      recent.push(s.t);
    } else if (!armed && smooth < config.rearm) {
      armed = true;
    }

    recent = recent.filter((t) => s.t - t <= config.walkWindowMs);
    const was = walking;
    if (!walking && recent.length >= config.walkStartSteps) walking = true;
    else if (walking && s.t - lastStepT > config.stopAfterMs) {
      walking = false;
      recent = []; // si no, los pasos antiguos de la ventana lo reactivarían al instante
    }

    return { step, steps, walking, walkingChanged: was !== walking, signal: smooth, magnitude };
  }

  function reset() {
    gravity = null;
    smooth = 0;
    armed = true;
    lastStepT = -Infinity;
    steps = 0;
    walking = false;
    recent = [];
  }

  return { push, reset };
}

export type StepDetector = ReturnType<typeof createStepDetector>;
