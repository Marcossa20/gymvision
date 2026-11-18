// Mientras se desliza una rueda (peso, reps…) la página que la contiene no debe desplazarse: en iPhone el ScrollView
// nativo le quitaba el gesto a la rueda. La pantalla provee este bloqueo y la rueda lo activa al tocarla.
import { createContext, useContext } from 'react';

export const ScrollLockContext = createContext<(locked: boolean) => void>(() => {});
export const useScrollLock = () => useContext(ScrollLockContext);
