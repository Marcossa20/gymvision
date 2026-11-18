// Contrato REPARTO.md §2.1: B navega aquí tras leer un QR o código manual. Arranca un entreno rápido con ese ejercicio.
import { useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useWorkout } from '../../../store/workout';

export default function MachineEntry() {
  const { exerciseId } = useLocalSearchParams<{ exerciseId: string }>();
  const router = useRouter();
  useEffect(() => {
    useWorkout.getState().startQuick(exerciseId);
    router.replace('/workout/active');
  }, [exerciseId, router]);
  return null;
}
