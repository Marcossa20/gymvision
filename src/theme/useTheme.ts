import { useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { useSettings } from '../store/settings';
import { brandByMode, dark, darkHC, light, lightHC, rankPalettes, textScales, type Palette, type ThemeVariant } from './tokens';

export interface Theme {
  colors: Palette;
  isDark: boolean;
  highContrast: boolean;
  /** Multiplica un tamaño de fuente base por el ajuste de texto del usuario. */
  fs: (size: number) => number;
}

export function useTheme(): Theme {
  const mode = useSettings((s) => s.theme);
  const hc = useSettings((s) => s.highContrast);
  const level = useSettings((s) => s.textScale);
  const system = useColorScheme();
  const isDark = mode === 'system' ? system !== 'light' : mode === 'dark';
  const cb = useSettings((s) => s.colorBlind);
  const variant: ThemeVariant = isDark ? (hc ? 'darkHC' : 'dark') : hc ? 'lightHC' : 'light';
  // Daltonismo: además de la paleta de rangos, cambia el color de marca de toda la interfaz.
  const colors = useMemo<Palette>(() => {
    const base = { dark, darkHC, light, lightHC }[variant];
    return cb === 'none' ? base : { ...base, brand: brandByMode[cb][variant] };
  }, [variant, cb]);
  const scale = textScales[level];
  return { colors, isDark, highContrast: hc, fs: (size) => Math.round(size * scale) };
}

// Teoría (Reto 1, daltonismo): cambia la paleta de datos (rangos, mapa, gráficas) y, en useTheme, el color de marca.
export function useRankColors(): string[] {
  const mode = useSettings((s) => s.colorBlind);
  return rankPalettes[mode];
}
