// Cuenta local simulada (CLAUDE.md §1: sin servidor). Contrato REPARTO §2.5: el shell lee useAuth().loggedIn.
// Las cuentas se guardan solo en el móvil; la contraseña se guarda con sal + hash (simulación: NO es
// seguridad real, solo evita guardarla en claro). «Enviar enlace» es una pantalla simulada.
// Para cerrar sesión (Ajustes → Cuenta y seguridad, pantalla de A): useAuth.getState().logout().
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Account {
  name: string;
  username: string;
  email: string;
  salt: string;
  hash: string;
}

function fnv1a(s: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(16).padStart(8, '0');
}
/** Hash iterado con sal (simulación local). */
export function hashPassword(password: string, salt: string) {
  let h = `${salt}:${password}`;
  for (let i = 0; i < 2000; i++) h = fnv1a(h + salt) + fnv1a(h + password);
  return h;
}
const newSalt = () => Math.random().toString(36).slice(2, 12);
const norm = (email: string) => email.trim().toLowerCase();

/** Cuenta de demostración para la exposición (credenciales en el README/PR, no en la UI). */
const DEMO_SALT = 'gvdemo2026';
const DEMO: Account = { name: 'Miguel Ángel', username: 'miguelmota', email: 'miguel@correo.com', salt: DEMO_SALT, hash: hashPassword('Gymvision1', DEMO_SALT) };

/** Validaciones compartidas por Crear cuenta y Nueva contraseña. */
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const USERNAME_RE = /^[a-z0-9._]{3,20}$/;
export const passwordRules = (p: string, repeat?: string) => ({
  length: p.length >= 8,
  lettersAndNumbers: /[a-zA-Z]/.test(p) && /\d/.test(p),
  upperAndNumber: /[A-Z]/.test(p) && /\d/.test(p),
  match: repeat === undefined ? true : p.length > 0 && p === repeat,
});
/** 0..4: longitud, mayúscula, número, símbolo o ≥ 12 caracteres. */
export function passwordStrength(p: string) {
  if (!p) return 0;
  return [p.length >= 8, /[A-Z]/.test(p) && /[a-z]/.test(p), /\d/.test(p), /[^a-zA-Z0-9]/.test(p) || p.length >= 12].filter(Boolean).length;
}

interface AuthState {
  hydrated: boolean;
  loggedIn: boolean;
  currentEmail: string | null;
  accounts: Account[];
  /** Recuperación simulada: correo y caducidad del «enlace» (30 min). */
  reset: { email: string; expiresAt: number } | null;
  login: (email: string, password: string) => Account | null;
  register: (a: { name: string; username: string; email: string; password: string }) => { ok: true } | { ok: false; field: 'email' | 'username'; message: string };
  requestReset: (email: string) => void;
  setNewPassword: (password: string) => boolean;
  logout: () => void;
  /** Borra la cuenta actual de este móvil y cierra la sesión. */
  deleteAccount: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      loggedIn: false,
      currentEmail: null,
      accounts: [DEMO],
      reset: null,
      login: (email, password) => {
        const a = get().accounts.find((x) => x.email === norm(email));
        if (!a || hashPassword(password, a.salt) !== a.hash) return null;
        set({ loggedIn: true, currentEmail: a.email });
        return a;
      },
      register: ({ name, username, email, password }) => {
        const e = norm(email);
        const u = username.trim().replace(/^@/, '').toLowerCase();
        if (get().accounts.some((x) => x.email === e)) return { ok: false, field: 'email', message: 'Ya hay una cuenta con este correo en el móvil.' };
        if (get().accounts.some((x) => x.username === u)) return { ok: false, field: 'username', message: 'Ese nombre de usuario ya está en uso.' };
        const salt = newSalt();
        set((s) => ({ accounts: [...s.accounts, { name: name.trim(), username: u, email: e, salt, hash: hashPassword(password, salt) }], loggedIn: true, currentEmail: e }));
        return { ok: true };
      },
      requestReset: (email) => set({ reset: { email: norm(email), expiresAt: Date.now() + 30 * 60000 } }),
      setNewPassword: (password) => {
        const r = get().reset;
        if (!r || Date.now() > r.expiresAt) return false;
        const salt = newSalt();
        set((s) => ({ accounts: s.accounts.map((a) => (a.email === r.email ? { ...a, salt, hash: hashPassword(password, salt) } : a)), reset: null }));
        return true;
      },
      logout: () => set({ loggedIn: false, currentEmail: null }),
      deleteAccount: () => set((s) => ({ accounts: s.accounts.filter((a) => a.email !== s.currentEmail), loggedIn: false, currentEmail: null, reset: null })),
    }),
    {
      name: 'gv-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ loggedIn: s.loggedIn, currentEmail: s.currentEmail, accounts: s.accounts, reset: s.reset }),
      onRehydrateStorage: () => () => useAuth.setState({ hydrated: true }),
    },
  ),
);
