// Teoría (RF6 + Reto 3): el fin de descanso avisa por tres canales — vibración + aviso visual dentro de la app
// y notificación del sistema con acciones cuando la app está en segundo plano/pantalla bloqueada.
// Un solo sitio controla el descanso (no depende de qué pantalla esté abierta): programa/cancela la notificación
// cada vez que cambia `restEndsAt` y dispara el aviso interno al llegar a cero.
import { AppState, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useWorkout } from '../store/workout';
import { useSettings } from '../store/settings';
import i18n from 'i18next';
import { notify } from './alerts';

const CATEGORY = 'descanso';
const ACTION_START = 'empezar';
const ACTION_PLUS30 = 'mas30';

let scheduledId: string | null = null;
let timer: ReturnType<typeof setTimeout> | undefined;
let started = false;
const native = Platform.OS !== 'web'; // en web no hay notificaciones del sistema, pero el temporizador interno sí funciona

async function cancelScheduled() {
  if (native && scheduledId) { await Notifications.cancelScheduledNotificationAsync(scheduledId).catch(() => {}); scheduledId = null; }
}

async function schedule(endsAt: number) {
  if (!native) return;
  await cancelScheduled();
  const settings = useSettings.getState();
  if (!settings.reminders && !settings.sound && !settings.vibration && !settings.visualAlerts) return;
  const perm = await Notifications.getPermissionsAsync();
  if (!perm.granted) return;
  scheduledId = await Notifications.scheduleNotificationAsync({
    content: {
      title: i18n.t('Descanso terminado'),
      body: i18n.t('Empieza tu siguiente serie.'),
      categoryIdentifier: CATEGORY,
      sound: settings.sound ? 'default' : false,
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(endsAt) },
  }).catch(() => null);
}

/** Llegó el momento: aviso interno (háptica + banner) y se limpia el descanso. */
function restFinished() {
  const { restEndsAt, skipRest } = useWorkout.getState();
  if (!restEndsAt || Date.now() < restEndsAt) return;
  skipRest();
  notify('descanso', i18n.t('Descanso terminado · empieza la siguiente serie'));
}

function sync() {
  const endsAt = useWorkout.getState().restEndsAt;
  if (timer) clearTimeout(timer);
  if (!endsAt) { void cancelScheduled(); return; }
  timer = setTimeout(restFinished, Math.max(0, endsAt - Date.now()));
  void schedule(endsAt);
}

/** Llamar una vez al arrancar la app (layout raíz). */
export async function initNotifications() {
  if (started) return;
  started = true;

  // Temporizador del descanso (todas las plataformas): reprogramar al cambiar y comprobar al volver a primer plano.
  useWorkout.subscribe((s, prev) => { if (s.restEndsAt !== prev.restEndsAt) sync(); });
  AppState.addEventListener('change', (st) => { if (st === 'active') { restFinished(); sync(); } });
  sync();
  if (!native) return;

  // En primer plano no se muestra la notificación del sistema: ya avisa la app (evita duplicados).
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowBanner: false, shouldShowList: false, shouldPlaySound: false, shouldSetBadge: false }),
  });
  const registerCategory = () => Notifications.setNotificationCategoryAsync(CATEGORY, [
    { identifier: ACTION_START, buttonTitle: i18n.t('Empezar serie'), options: { opensAppToForeground: true } },
    { identifier: ACTION_PLUS30, buttonTitle: '+30 s', options: { opensAppToForeground: false } },
  ]).catch(() => {});
  await registerCategory();
  i18n.on('languageChanged', () => void registerCategory()); // los botones de la notificación también cambian de idioma
  await Notifications.requestPermissionsAsync().catch(() => {});

  // Acciones de la notificación.
  Notifications.addNotificationResponseReceivedListener((resp) => {
    if (resp.actionIdentifier === ACTION_PLUS30) {
      useWorkout.setState({ restEndsAt: Date.now() + 30_000 }); // reprograma un nuevo descanso de 30 s
    } else if (useWorkout.getState().active) {
      router.push('/workout/active');
    }
  });

}
