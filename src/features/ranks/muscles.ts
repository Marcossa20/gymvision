// Nombres visibles de los músculos (los ids de seed.ts van sin tildes).
import type { Muscle } from '../../data/seed';

export const MUSCLE_LABELS: Record<Muscle, string> = {
  pecho: 'Pecho', hombros: 'Hombros', biceps: 'Bíceps', antebrazos: 'Antebrazos', abdominales: 'Abdominales',
  cuadriceps: 'Cuádriceps', aductores: 'Aductores', abductores: 'Abductores', cuello: 'Cuello', trapecio: 'Trapecio',
  dorsales: 'Dorsales', triceps: 'Tríceps', lumbar: 'Lumbar', gluteos: 'Glúteos', femoral: 'Femoral', gemelos: 'Gemelos',
};
