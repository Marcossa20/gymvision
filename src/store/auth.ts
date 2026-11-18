// STUB (contrato REPARTO.md §2.5): Miguel Ángel (B) es el dueño de este archivo y lo sustituye por el login local real.
// Hasta entonces `loggedIn` es true para que el shell de la app no bloquee a nadie.
import { create } from 'zustand';

interface AuthState {
  loggedIn: boolean;
}

export const useAuth = create<AuthState>(() => ({ loggedIn: true }));
