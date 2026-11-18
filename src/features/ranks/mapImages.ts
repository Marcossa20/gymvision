// GENERADO junto a mapData.ts: imágenes del Figma (silueta gris + una máscara por músculo que se tinta con el color del rango).
import type { ImageSourcePropType } from 'react-native';

interface SideImages { base: ImageSourcePropType; muscles: Record<string, ImageSourcePropType> }

export const MAP_IMAGES: Record<'front' | 'back', SideImages> = {
  front: {
    base: require('../../../assets/muscles/map/front-base.png'),
    muscles: {
      pecho: require('../../../assets/muscles/map/pecho.png'),
      hombros: require('../../../assets/muscles/map/hombros.png'),
      biceps: require('../../../assets/muscles/map/biceps.png'),
      antebrazos: require('../../../assets/muscles/map/antebrazos.png'),
      abdominales: require('../../../assets/muscles/map/abdominales.png'),
      cuadriceps: require('../../../assets/muscles/map/cuadriceps.png'),
      aductores: require('../../../assets/muscles/map/aductores.png'),
      abductores: require('../../../assets/muscles/map/abductores.png'),
      cuello: require('../../../assets/muscles/map/cuello.png'),
      trapecio: require('../../../assets/muscles/map/trapecio-f.png'),
    },
  },
  back: {
    base: require('../../../assets/muscles/map/back-base.png'),
    muscles: {
      dorsales: require('../../../assets/muscles/map/dorsales.png'),
      triceps: require('../../../assets/muscles/map/triceps.png'),
      trapecio: require('../../../assets/muscles/map/trapecio-b.png'),
      lumbar: require('../../../assets/muscles/map/lumbar.png'),
      gluteos: require('../../../assets/muscles/map/gluteos.png'),
      femoral: require('../../../assets/muscles/map/femoral.png'),
      gemelos: require('../../../assets/muscles/map/gemelos.png'),
    },
  },
};
