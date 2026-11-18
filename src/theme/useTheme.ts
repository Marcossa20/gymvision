import { useColorScheme } from 'react-native';
import { useSettings } from '../store/settings';
import { dark, darkHC, light, lightHC, rankPalettes, textScales, type Palette } from './tokens';

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
  const colors = isDark ? (hc ? darkHC : dark) : hc ? lightHC : light;
  const scale = textScales[level];
  return { colors, isDark, highContrast: hc, fs: (size) => Math.round(size * scale) };
}

// Teoría (Reto 1, daltonismo): solo cambia la paleta de datos (rangos, mapa, gráficas), no la marca.
export function useRankColors(): string[] {
  const mode = useSettings((s) => s.colorBlind);
  return rankPalettes[mode];
}
