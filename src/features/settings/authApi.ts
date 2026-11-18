// Adaptador hacia store/auth.ts (dueño: Miguel Ángel, REPARTO.md §2.5). El store real expone `logout`, `currentEmail` y
// `requestReset`; mientras su PR de acceso no esté en `main` el store es un stub sin ellas. Así esta rama compila con ambos
// y no edita su archivo. Cuando se mezclen, se puede sustituir por llamadas directas.
import { useAuth } from '../../store/auth';

interface AuthApi {
  currentEmail?: string | null;
  logout?: () => void;
  requestReset?: (email: string) => void;
  /** Aún no existe en el store (pedido en una issue [para B]). */
  deleteAccount?: () => void;
}

export const authApi = () => useAuth.getState() as unknown as AuthApi;
export const useCurrentEmail = () => useAuth((s) => (s as unknown as AuthApi).currentEmail ?? null);

/** «gabriel@gmail.com» → «g***@gmail.com» */
export function maskEmail(email: string | null) {
  if (!email) return 'Sin sesión';
  const [user, domain] = email.split('@');
  return domain ? `${user.charAt(0)}***@${domain}` : email;
}
