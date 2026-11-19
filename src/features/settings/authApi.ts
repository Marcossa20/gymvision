// Acceso al store de cuenta (dueño: Miguel Ángel, REPARTO.md §2.5): solo lectura de su API pública.
import i18n from 'i18next';
import { useAuth } from '../../store/auth';

export const authApi = () => useAuth.getState();
export const useCurrentEmail = () => useAuth((s) => s.currentEmail);

/** «gabriel@gmail.com» → «g***@gmail.com» */
export function maskEmail(email: string | null) {
  if (!email) return i18n.t('Sin sesión');
  const [user, domain] = email.split('@');
  return domain ? `${user.charAt(0)}***@${domain}` : email;
}
