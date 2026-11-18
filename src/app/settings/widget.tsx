import { PlaceholderScreen } from '../../features/settings/SimpleScreens';
import { useTranslation } from 'react-i18next';

// TODO: widget / pantalla de bloqueo requieren código nativo (CLAUDE.md §10); se simula en la fase final.
export default function Widget() {
  const { t } = useTranslation();
  return <PlaceholderScreen title={t('Añadir widget a inicio')} text={t('Pendiente: requiere código nativo (Live Activities / notificación persistente).')} />;
}
