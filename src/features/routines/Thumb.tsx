import React from 'react';
import { Image, View, type ImageSourcePropType } from 'react-native';
import type { Equipment, Exercise, Muscle } from '../../data/seed';
import { muscleImages } from '../workout/muscleImages';

export const equipmentImages: Record<Equipment, ImageSourcePropType> = {
  cardio: require('../../../assets/equipment/cardio.jpg'),
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

export const muscleLabel = (m: Muscle) =>
  ({ biceps: 'Bíceps', triceps: 'Tríceps', cuadriceps: 'Cuádriceps', gluteos: 'Glúteos', abdominales: 'Abdominales' } as Record<string, string>)[m] ?? m.charAt(0).toUpperCase() + m.slice(1);

/** Miniatura del ejercicio: músculo trabajado (fuerza) o icono de cardio/equipamiento. */
export function ExThumb({ ex, size, radius = 14 }: { ex: Pick<Exercise, 'muscles' | 'equipment'>; size: number; radius?: number }) {
  const src = ex.muscles[0] ? muscleImages[ex.muscles[0]] : equipmentImages[ex.equipment];
  return (
    <View style={{ width: size, height: size, borderRadius: radius, overflow: 'hidden', backgroundColor: '#070707' }}>
      <Image source={src} style={{ width: size, height: size }} resizeMode="cover" accessibilityIgnoresInvertColors />
    </View>
  );
}
