// Datos semilla locales (offline). Los ejercicios y rutinas son los que aparecen en las pantallas de Figma.

export type Muscle =
  | 'pecho' | 'hombros' | 'biceps' | 'antebrazos' | 'abdominales' | 'cuadriceps' | 'aductores'
  | 'abductores' | 'cuello' | 'trapecio' | 'dorsales' | 'triceps' | 'lumbar' | 'gluteos' | 'femoral' | 'gemelos';
export type Equipment = 'cardio' | 'sin-equipamiento' | 'calistenia' | 'barra' | 'mancuerna' | 'maquina' | 'polea' | 'banda-elastica';

export interface Exercise {
  id: string;
  name: string;
  muscles: Muscle[];
  equipment: Equipment;
  type: 'fuerza' | 'cardio';
  machineCode?: string; // código manual / QR
}

export interface RoutineExercise {
  exerciseId: string;
  sets: number;
  reps: number;
  weight: number;
  restSec: number;
}

export interface Routine {
  id: string;
  name: string;
  day?: string;
  focus: Muscle[];
  exercises: RoutineExercise[];
}

export const exercises: Exercise[] = [
  { id: 'press-inclinado', name: 'Press de banca inclinado (mancuerna)', muscles: ['pecho', 'hombros'], equipment: 'mancuerna', type: 'fuerza' },
  { id: 'jalon-pecho', name: 'Jalón al pecho agarre prono (máquina)', muscles: ['dorsales'], equipment: 'maquina', type: 'fuerza', machineCode: 'PB-0142' },
  { id: 'pec-deck', name: 'Aperturas de pecho en Pec Deck (máquina)', muscles: ['pecho'], equipment: 'maquina', type: 'fuerza', machineCode: 'PB-0087' },
  { id: 'elevaciones-laterales', name: 'Elevaciones laterales en polea baja', muscles: ['hombros'], equipment: 'polea', type: 'fuerza', machineCode: 'PB-0213' },
  { id: 'remo-barra', name: 'Remo con barra', muscles: ['dorsales', 'trapecio'], equipment: 'barra', type: 'fuerza' },
  { id: 'curl-biceps', name: 'Curl de bíceps con mancuernas', muscles: ['biceps'], equipment: 'mancuerna', type: 'fuerza' },
  { id: 'extension-triceps', name: 'Extensión de tríceps en polea', muscles: ['triceps'], equipment: 'polea', type: 'fuerza', machineCode: 'PB-0301' },
  { id: 'sentadilla', name: 'Sentadilla con barra', muscles: ['cuadriceps', 'gluteos'], equipment: 'barra', type: 'fuerza' },
  { id: 'prensa', name: 'Prensa de piernas (máquina)', muscles: ['cuadriceps', 'gluteos'], equipment: 'maquina', type: 'fuerza', machineCode: 'PB-0455' },
  { id: 'caminata', name: 'Caminata', muscles: [], equipment: 'cardio', type: 'cardio' },
  { id: 'correr', name: 'Correr', muscles: [], equipment: 'cardio', type: 'cardio' },
  { id: 'bicicleta', name: 'Bicicleta', muscles: [], equipment: 'cardio', type: 'cardio' },
  { id: 'eliptica', name: 'Elíptica', muscles: [], equipment: 'cardio', type: 'cardio' },
  { id: 'remo-cardio', name: 'Remo', muscles: [], equipment: 'cardio', type: 'cardio' },
];

const re = (exerciseId: string, sets = 3, reps = 10, weight = 20, restSec = 90): RoutineExercise => ({ exerciseId, sets, reps, weight, restSec });

export const routines: Routine[] = [
  { id: 'torso', name: 'TORSO', day: 'Lunes', focus: ['pecho', 'hombros', 'dorsales'],
    exercises: [re('press-inclinado', 4, 10, 22.5), re('pec-deck', 3, 12, 40), re('jalon-pecho', 4, 10, 50), re('remo-barra', 3, 10, 45), re('elevaciones-laterales', 3, 15, 7.5, 60)] },
  { id: 'pierna', name: 'PIERNA', day: 'Miércoles', focus: ['cuadriceps', 'gluteos'], exercises: [re('sentadilla', 4, 8, 60, 120), re('prensa', 4, 12, 120)] },
  { id: 'espalda-biceps', name: 'ESPALDA Y BÍCEPS', day: 'Viernes', focus: ['dorsales', 'biceps'], exercises: [re('jalon-pecho', 4, 10, 50), re('remo-barra', 3, 10, 45), re('curl-biceps', 3, 12, 12.5)] },
  { id: 'hombros-brazos', name: 'HOMBROS Y BRAZOS', focus: ['hombros', 'triceps'], exercises: [re('elevaciones-laterales', 4, 15, 7.5, 60), re('extension-triceps', 3, 12, 25), re('curl-biceps', 3, 12, 12.5)] },
];

export const exerciseById = (id: string) => exercises.find((e) => e.id === id)!;
export const exerciseByCode = (code: string) =>
  exercises.find((e) => e.machineCode?.toLowerCase() === code.trim().toLowerCase());
