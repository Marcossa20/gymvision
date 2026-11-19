import React from 'react';
import { Image, View, type ImageSourcePropType } from 'react-native';
import i18n from 'i18next';
import type { Equipment, Exercise, Muscle } from '../../data/seed';
import { muscleImages } from '../workout/muscleImages';
import { exerciseImages } from './exerciseImages';

export const equipmentImages: Record<Equipment, ImageSourcePropType> = {
  cardio: require('../../../assets/cardio/correr.png'),
  'sin-equipamiento': require('../../../assets/equipment/sin-equipamiento.jpg'),
  calistenia: require('../../../assets/equipment/calistenia.jpg'),
  barra: require('../../../assets/equipment/barra.jpg'),
  mancuerna: require('../../../assets/equipment/mancuerna.jpg'),
  maquina: require('../../../assets/equipment/maquina.jpg'),
  polea: require('../../../assets/equipment/polea.jpg'),
  'banda-elastica': require('../../../assets/equipment/banda-elastica.jpg'),
};

export const equipmentLabels: Record<Equipment, string> = {
  cardio: 'Cardio', 'sin-equipamiento': 'Sin equipamiento', calistenia: 'Calistenia', barra: 'Barra',
  mancuerna: 'Mancuerna', maquina: 'Máquina', polea: 'Polea', 'banda-elastica': 'Banda elástica',
};

const MUSCLE_NAMES: Record<Muscle, string> = {
  pecho: 'Pecho', hombros: 'Hombros', biceps: 'Bíceps', antebrazos: 'Antebrazos', abdominales: 'Abdominales', cuadriceps: 'Cuádriceps',
  aductores: 'Aductores', abductores: 'Abductores', cuello: 'Cuello', trapecio: 'Trapecio', dorsales: 'Dorsales', triceps: 'Tríceps',
  lumbar: 'Lumbar', gluteos: 'Glúteos', femoral: 'Femoral', gemelos: 'Gemelos',
};
/** Nombre del músculo traducido (los componentes que lo usan ya se re-renderizan al cambiar de idioma). */
export const muscleLabel = (m: Muscle) => i18n.t(MUSCLE_NAMES[m]);
export const equipLabel = (q: Equipment) => i18n.t(equipmentLabels[q]);

/** Miniatura del ejercicio: músculo trabajado (fuerza) o icono de cardio/equipamiento. */
export function ExThumb({ ex, size, radius = 14 }: { ex: Pick<Exercise, 'muscles' | 'equipment'> & { id?: string }; size: number; radius?: number }) {
  const src = (ex.id && exerciseImages[ex.id]) || (ex.muscles[0] ? muscleImages[ex.muscles[0]] : equipmentImages[ex.equipment]);
  return (
    <View style={{ width: size, height: size, borderRadius: radius, overflow: 'hidden', backgroundColor: '#070707' }}>
      <Image source={src} style={{ width: size, height: size }} resizeMode="cover" accessibilityIgnoresInvertColors />
    </View>
  );
}
