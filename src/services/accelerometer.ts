// Teoría (El Ordenador, acelerómetro — RF7): sensor como entrada implícita; el usuario no interactúa,
// la app «nota» que anda y reacciona (cronómetro automático + vibración al empezar/terminar).
// Envoltorio de expo-sensors + hook reutilizable (Laboratorio y Cardio en curso).
import { useCallback, useEffect, useRef, useState } from 'react';
import { Accelerometer, type AccelerometerMeasurement } from 'expo-sensors';
import { createStepDetector, type AccelSample, type StepUpdate } from '../domain/steps';

/** 50 Hz: suficiente para pasos (≤ 3 Hz) sin gastar batería de más. */
export const SAMPLE_INTERVAL_MS = 20;

export async function isAccelerometerAvailable(): Promise<boolean> {
  try {
    return await Accelerometer.isAvailableAsync();
  } catch {
    return false;
  }
}

/** Se suscribe al acelerómetro; devuelve la función para parar. */
export function startAccelerometer(onSample: (s: AccelSample) => void, intervalMs = SAMPLE_INTERVAL_MS): () => void {
  Accelerometer.setUpdateInterval(intervalMs);
  const sub = Accelerometer.addListener((m: AccelerometerMeasurement) => {
    onSample({ x: m.x, y: m.y, z: m.z, t: Date.now() });
  });
  return () => sub.remove();
}

export interface StepCounterState {
  available: boolean | null;
  running: boolean;
  steps: number;
  walking: boolean;
  /** Tiempo andando (ms): el cronómetro solo avanza mientras walking = true. */
  activeMs: number;
  last: { x: number; y: number; z: number; magnitude: number; signal: number } | null;
}

/**
 * Cuenta pasos y mide el tiempo activo con pausa automática.
 * `onWalkingChange` se llama al empezar/dejar de andar (para háptica + aviso visual).
 * `uiHz` limita los re-render de la UI (el detector sigue procesando todas las muestras).
 */
export function useStepCounter(opts: { onWalkingChange?: (walking: boolean) => void; onStep?: (steps: number) => void; uiHz?: number } = {}) {
  const [state, setState] = useState<StepCounterState>({ available: null, running: false, steps: 0, walking: false, activeMs: 0, last: null });
  const detector = useRef(createStepDetector());
  const stopRef = useRef<(() => void) | null>(null);
  const activeMs = useRef(0);
  const lastT = useRef<number | null>(null);
  const lastUi = useRef(0);
  const cb = useRef(opts);
  cb.current = opts;

  useEffect(() => {
    let alive = true;
    void isAccelerometerAvailable().then((a) => alive && setState((s) => ({ ...s, available: a })));
    return () => {
      alive = false;
      stopRef.current?.();
    };
  }, []);

  const start = useCallback(() => {
    if (stopRef.current) return;
    lastT.current = null;
    const uiEvery = 1000 / (cb.current.uiHz ?? 10);
    stopRef.current = startAccelerometer((sample) => {
      const u: StepUpdate = detector.current.push(sample);
      if (u.walking && lastT.current !== null) activeMs.current += sample.t - lastT.current;
      lastT.current = sample.t;
      if (u.walkingChanged) cb.current.onWalkingChange?.(u.walking);
      if (u.step) cb.current.onStep?.(u.steps);
      if (u.step || u.walkingChanged || sample.t - lastUi.current >= uiEvery) {
        lastUi.current = sample.t;
        setState((s) => ({
          ...s, steps: u.steps, walking: u.walking, activeMs: activeMs.current,
          last: { x: sample.x, y: sample.y, z: sample.z, magnitude: u.magnitude, signal: u.signal },
        }));
      }
    });
    setState((s) => ({ ...s, running: true }));
  }, []);

  const stop = useCallback(() => {
    stopRef.current?.();
    stopRef.current = null;
    setState((s) => ({ ...s, running: false, walking: false }));
  }, []);

  const reset = useCallback(() => {
    detector.current.reset();
    activeMs.current = 0;
    lastT.current = null;
    setState((s) => ({ ...s, steps: 0, walking: false, activeMs: 0, last: null }));
  }, []);

  return { ...state, start, stop, reset };
}
