// Teoría (privacidad + RNF5): los datos personales se guardan solo en el móvil.
// Sexo y altura se usan para calcular los rangos (Editar perfil).
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Sex = 'masculino' | 'femenino';

export interface ProfileData {
  name: string;
  username: string;
  sex: Sex;
  heightCm: number;
  photoUri: string | null;
}

interface ProfileState extends ProfileData {
  set: (p: Partial<ProfileData>) => void;
}

export const useProfile = create<ProfileState>()(
  persist(
    (set) => ({
      name: 'Miguel Ángel',
      username: 'miguelmota',
      sex: 'masculino',
      heightCm: 170,
      photoUri: null,
      set: (p) => set(p),
    }),
    { name: 'gv-profile', storage: createJSONStorage(() => AsyncStorage), partialize: ({ set: _s, ...rest }) => rest },
  ),
);
