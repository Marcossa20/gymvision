// Teoría (Reto 1 y 2, La Persona): todos los colores y tamaños salen de aquí,
// así un único ajuste (tema, alto contraste, tamaño de texto, daltonismo) cambia toda la app al instante.

export type ThemeMode = 'dark' | 'light' | 'system';
export type ColorBlindMode = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';

export interface Palette {
  bg: string;
  card: string;
  /** Superficie secundaria: mosaicos de icono, chips y botones sobre tarjeta (Figma #222228). */
  surface2: string;
  brand: string;
  onBrand: string;
  textPrimary: string;
  textSecondary: string;
  divider: string;
  switchOff: string;
  radioOff: string;
  border: string; // borde definido (alto contraste)
  danger: string;
  success: string;
}

export const dark: Palette = {
  bg: '#0B0B0D',
  card: '#18181C',
  surface2: '#222228',
  brand: '#30E2CA',
  onBrand: '#0B0B0D',
  textPrimary: '#FFFFFF',
  textSecondary: '#999CA8',
  divider: '#292930',
  switchOff: '#33333B',
  radioOff: '#6B6E7A',
  border: 'transparent',
  danger: '#FF6B7A',
  success: '#4ADE80',
};

export const light: Palette = {
  bg: '#F4F4F6',
  card: '#FFFFFF',
  surface2: '#E6E6EC',
  brand: '#0B7A6D',
  onBrand: '#FFFFFF',
  textPrimary: '#0B0B0D',
  textSecondary: '#5A5C66',
  divider: '#E0E0E6',
  switchOff: '#C9C9D1',
  radioOff: '#33353D',
  border: 'transparent',
  danger: '#B3261E',
  success: '#157A3C',
};

// Alto contraste: bordes negros definidos, texto secundario más oscuro/claro (AAA).
export const darkHC: Palette = {
  ...dark,
  textSecondary: '#D4D6DE',
  divider: '#6B6E7A',
  border: '#FFFFFF',
};
export const lightHC: Palette = {
  ...light,
  bg: '#FFFFFF',
  brand: '#005A50',
  textSecondary: '#1F2026',
  divider: '#0B0B0D',
  border: '#0B0B0D',
};

// Paletas de rangos v2 (Bronce, Plata, Oro, Rubí, Esmeralda, Diamante), validadas con ΔE ≥ 20.
export const rankPalettes: Record<ColorBlindMode, string[]> = {
  none: ['#9B6A39', '#B2B8C2', '#E4A826', '#D23A4E', '#1FA85C', '#2E7CE0'],
  protanopia: ['#A6761D', '#D7D7D8', '#F0E442', '#C0557B', '#76B0F9', '#004297'],
  deuteranopia: ['#876C1B', '#D0D8E2', '#E69F00', '#C44672', '#56B4E9', '#034795'],
  tritanopia: ['#6F5A20', '#D6D9DB', '#AD5604', '#E23800', '#009E73', '#E59CC6'],
};

// Tamaño de texto ajustable en 4 niveles (se combina con el del sistema vía allowFontScaling).
export const textScales = [1, 1.15, 1.3, 1.5] as const;
export type TextScaleLevel = 0 | 1 | 2 | 3;
export const textScaleLabels = ['Normal', 'Grande', 'Muy grande', 'Máximo'];

export const radius = { card: 16, button: 14, chip: 999 };
export const minTouch = 48; // RNF1: objetivos táctiles ≥ 48 dp
