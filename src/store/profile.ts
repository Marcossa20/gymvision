// Teoría (privacidad + RNF5): los datos personales se guardan solo en el móvil.
// Versión mínima; Editar perfil (sexo, altura…) la completará.
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ProfileState {
  name: string;
  set: (p: Partial<Omit<ProfileState, 'set'>>) => void;
}

export const useProfile = create<ProfileState>()(
  persist(
    (set) => ({
      name: 'Miguel',
      set: (p) => set(p),
    }),
    { name: 'gv-profile', storage: createJSONStorage(() => AsyncStorage), partialize: ({ set: _s, ...rest }) => rest },
  ),
);
