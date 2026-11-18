// Ruta /lab (solo desarrollo). En producción redirige al inicio.
import { Redirect } from 'expo-router';
import { LabScreen } from '../features/lab/LabScreen';

export default function Lab() {
  if (!__DEV__) return <Redirect href="/" />;
  return <LabScreen />;
}
