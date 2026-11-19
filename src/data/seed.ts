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
  notes?: string; // notas propias al crear el ejercicio (Figma «Crear ejercicio»)
}

export type CardioGoal = 'time' | 'steps' | 'distance';

export interface RoutineExercise {
  exerciseId: string;
  sets: number;
  reps: number;
  weight: number;
  restSec: number;
  notes?: string;
  /** Cardio: un único objetivo (tiempo en min | pasos | distancia en km). */
  goal?: CardioGoal;
  target?: number;
}

export interface Routine {
  id: string;
  name: string;
  /** Días de entrenamiento: 0 = lunes … 6 = domingo. */
  days: number[];
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
  { id: 'press-banca', name: 'Press de banca con barra', muscles: ['pecho', 'triceps'], equipment: 'barra', type: 'fuerza' },
  { id: 'press-pecho-maquina', name: 'Press de pecho (máquina)', muscles: ['pecho', 'triceps'], equipment: 'maquina', type: 'fuerza', machineCode: 'PB-0102' },
  { id: 'fondos-paralelas', name: 'Fondos en paralelas', muscles: ['pecho', 'triceps'], equipment: 'calistenia', type: 'fuerza' },
  { id: 'flexiones', name: 'Flexiones', muscles: ['pecho', 'triceps'], equipment: 'sin-equipamiento', type: 'fuerza' },
  { id: 'dominadas', name: 'Dominadas', muscles: ['dorsales', 'biceps'], equipment: 'calistenia', type: 'fuerza' },
  { id: 'remo-polea', name: 'Remo en polea baja', muscles: ['dorsales', 'trapecio'], equipment: 'polea', type: 'fuerza', machineCode: 'PB-0176' },
  { id: 'remo-mancuerna', name: 'Remo con mancuerna a una mano', muscles: ['dorsales'], equipment: 'mancuerna', type: 'fuerza' },
  { id: 'peso-muerto-rumano', name: 'Peso muerto rumano', muscles: ['femoral', 'gluteos', 'lumbar'], equipment: 'barra', type: 'fuerza' },
  { id: 'hiperextensiones', name: 'Hiperextensiones', muscles: ['lumbar', 'gluteos'], equipment: 'calistenia', type: 'fuerza' },
  { id: 'encogimientos', name: 'Encogimientos con mancuernas', muscles: ['trapecio'], equipment: 'mancuerna', type: 'fuerza' },
  { id: 'cuello-banda', name: 'Extensión de cuello con banda', muscles: ['cuello'], equipment: 'banda-elastica', type: 'fuerza' },
  { id: 'press-militar', name: 'Press militar con mancuernas', muscles: ['hombros', 'triceps'], equipment: 'mancuerna', type: 'fuerza' },
  { id: 'pajaros', name: 'Pájaros con mancuernas', muscles: ['hombros'], equipment: 'mancuerna', type: 'fuerza' },
  { id: 'remo-menton', name: 'Remo al mentón con barra', muscles: ['hombros', 'trapecio'], equipment: 'barra', type: 'fuerza' },
  { id: 'face-pull', name: 'Face pull con banda', muscles: ['hombros', 'trapecio'], equipment: 'banda-elastica', type: 'fuerza' },
  { id: 'curl-martillo', name: 'Curl martillo', muscles: ['biceps', 'antebrazos'], equipment: 'mancuerna', type: 'fuerza' },
  { id: 'curl-barra-z', name: 'Curl con barra Z', muscles: ['biceps'], equipment: 'barra', type: 'fuerza' },
  { id: 'press-frances', name: 'Press francés con barra Z', muscles: ['triceps'], equipment: 'barra', type: 'fuerza' },
  { id: 'fondos-banco', name: 'Fondos en banco', muscles: ['triceps'], equipment: 'calistenia', type: 'fuerza' },
  { id: 'curl-muneca', name: 'Curl de muñeca con mancuerna', muscles: ['antebrazos'], equipment: 'mancuerna', type: 'fuerza' },
  { id: 'zancadas', name: 'Zancadas con mancuernas', muscles: ['cuadriceps', 'gluteos'], equipment: 'mancuerna', type: 'fuerza' },
  { id: 'curl-femoral', name: 'Curl femoral tumbado (máquina)', muscles: ['femoral'], equipment: 'maquina', type: 'fuerza', machineCode: 'PB-0467' },
  { id: 'extension-cuadriceps', name: 'Extensión de cuádriceps (máquina)', muscles: ['cuadriceps'], equipment: 'maquina', type: 'fuerza', machineCode: 'PB-0471' },
  { id: 'hip-thrust', name: 'Hip thrust', muscles: ['gluteos'], equipment: 'barra', type: 'fuerza' },
  { id: 'gemelos-maquina', name: 'Elevación de gemelos de pie (máquina)', muscles: ['gemelos'], equipment: 'maquina', type: 'fuerza', machineCode: 'PB-0482' },
  { id: 'aductores-maquina', name: 'Aductores (máquina)', muscles: ['aductores'], equipment: 'maquina', type: 'fuerza', machineCode: 'PB-0493' },
  { id: 'abductores-maquina', name: 'Abductores (máquina)', muscles: ['abductores'], equipment: 'maquina', type: 'fuerza', machineCode: 'PB-0494' },
  { id: 'plancha', name: 'Plancha', muscles: ['abdominales'], equipment: 'sin-equipamiento', type: 'fuerza' },
  { id: 'crunch-maquina', name: 'Crunch en máquina', muscles: ['abdominales'], equipment: 'maquina', type: 'fuerza', machineCode: 'PB-0510' },
  { id: 'elevacion-piernas', name: 'Elevación de piernas colgado', muscles: ['abdominales'], equipment: 'calistenia', type: 'fuerza' },
  { id: 'escaladora', name: 'Escaladora', muscles: [], equipment: 'cardio', type: 'cardio' },
];

const re = (exerciseId: string, sets = 3, reps = 10, weight = 20, restSec = 90): RoutineExercise => ({ exerciseId, sets, reps, weight, restSec });

export const routines: Routine[] = [
  { id: 'torso', name: 'Torso', days: [0, 3], focus: ['pecho', 'hombros', 'dorsales'],
    exercises: [re('press-inclinado', 4, 10, 22.5), re('pec-deck', 3, 12, 40), re('jalon-pecho', 4, 10, 50), re('remo-barra', 3, 10, 45), re('elevaciones-laterales', 3, 15, 7.5, 60)] },
  { id: 'pierna', name: 'Pierna', days: [1, 4], focus: ['cuadriceps', 'gluteos'], exercises: [re('sentadilla', 4, 8, 60, 120), re('prensa', 4, 12, 120)] },
  { id: 'espalda-biceps', name: 'Espalda y bíceps', days: [2], focus: ['dorsales', 'biceps'], exercises: [re('jalon-pecho', 4, 10, 50), re('remo-barra', 3, 10, 45), re('curl-biceps', 3, 12, 12.5)] },
  { id: 'hombros-brazos', name: 'Hombros y brazos', days: [], focus: ['hombros', 'triceps'], exercises: [re('elevaciones-laterales', 4, 15, 7.5, 60), re('extension-triceps', 3, 12, 25), re('curl-biceps', 3, 12, 12.5)] },
];

export const exerciseById = (id: string) => exercises.find((e) => e.id === id)!;
export const exerciseByCode = (code: string) =>
  exercises.find((e) => e.machineCode?.toLowerCase() === code.trim().toLowerCase());

export const WEEK_LETTERS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'] as const;
export const WEEK_NAMES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'] as const;

/** Registra un ejercicio creado por el usuario en el catálogo en memoria. */
export function registerExercise(e: Exercise) {
  if (!exercises.some((x) => x.id === e.id)) exercises.push(e);
}
