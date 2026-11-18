// Teoría: los ajustes se aplican al instante y en toda la app (contexto global) y se guardan en el móvil (offline, RNF5).
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ColorBlindMode, TextScaleLevel, ThemeMode } from '../theme/tokens';

export type WeightUnit = 'kg' | 'lb';
export type Language = 'es' | 'en' | 'fr' | 'de' | 'it' | 'pt';

export interface SettingsState {
  theme: ThemeMode;
  highContrast: boolean;
  textScale: TextScaleLevel;
  colorBlind: ColorBlindMode;
  unit: WeightUnit;
  language: Language;
  // Reto 3: ningún aviso depende solo del sonido
  vibration: boolean;
  sound: boolean;
  visualAlerts: boolean;
  reminders: boolean;
  set: <K extends keyof Omit<SettingsState, 'set'>>(key: K, value: SettingsState[K]) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'dark',
      highContrast: false,
      textScale: 0,
      colorBlind: 'none',
      unit: 'kg',
      language: 'es',
      vibration: true,
      sound: false,
      visualAlerts: true,
      reminders: true,
      set: (key, value) => set({ [key]: value } as Partial<SettingsState>),
    }),
    { name: 'gv-settings', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
