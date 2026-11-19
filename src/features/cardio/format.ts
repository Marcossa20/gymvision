import i18n from 'i18next';
// Formato en español: miles con punto (3.120), decimales con coma (2,4 km), fechas «viernes 16 de octubre».
// (Intl agrupa los miles solo a partir de 5 cifras en es-ES, por eso se hace a mano.)

const es = () => !i18n.language || i18n.language.startsWith('es');

export const fmtInt = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, es() ? '.' : ',');

export const fmtDec = (n: number, digits = 1) => (es() ? n.toFixed(digits).replace('.', ',') : n.toFixed(digits));

/** mm:ss o h:mm:ss */
export function fmtClock(ms: number) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const mm = String(Math.floor((s % 3600) / 60)).padStart(h ? 2 : 2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

const DAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

export const fmtDate = (ts: number) => {
  const d = new Date(ts);
  return i18n.t('{{day}} {{d}} de {{month}}', { day: i18n.t(DAYS[d.getDay()]), d: d.getDate(), month: i18n.t(MONTHS[d.getMonth()]) });
};
