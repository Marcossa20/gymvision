import { Redirect } from 'expo-router';

// La pestaña inicial tras el login es Entrenar.
export default function Index() {
  return <Redirect href="/entrenar" />;
}
