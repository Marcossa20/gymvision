// Formatos para Perfil (según el idioma: miles, decimales y nombres de día/mes abreviados).
import i18n from 'i18next';
export { fmtInt, fmtDec } from '../cardio/format';
import { fmtDec, fmtInt } from '../cardio/format';

const DAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']; // se traducen al mostrarlos
const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

export const startOfDay = (t: number) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };

/** «HOY», «AYER» o «LUN 12 OCT». */
export function fmtDayLabel(t: number, now = Date.now()) {
  const diff = Math.round((startOfDay(now) - startOfDay(t)) / 86400000);
  if (diff === 0) return i18n.t('Hoy').toUpperCase();
  if (diff === 1) return i18n.t('Ayer').toUpperCase();
  const d = new Date(t);
  return `${dayShort(t)} ${d.getDate()} ${monthShort(d.getMonth())}`;
}

export const monthName = (m: number) => i18n.t(MONTHS[m]);
export const dayShort = (t: number) => i18n.t(DAYS[new Date(t).getDay()]).slice(0, 3).toUpperCase();
export const monthShort = (m: number) => monthName(m).slice(0, 3).toUpperCase();
export const fmtLongDate = (t: number) => { const d = new Date(t); return i18n.t('{{d}} de {{month}}, {{y}}', { d: d.getDate(), month: monthName(d.getMonth()), y: d.getFullYear() }); };
export const fmtShortDate = (t: number) => { const d = new Date(t); return `${d.getDate()} ${monthName(d.getMonth()).slice(0, 3)}`; };

/** «1 h 11 min» / «54 min». */
export function fmtDuration(min: number) {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return h ? `${h} h ${String(m).padStart(2, '0')} min` : `${m} min`;
}

/** «36,1 mil kg» a partir de 10.000; si no, «6.895 kg». */
export const fmtKg = (kg: number) => (kg >= 10000 ? i18n.t('{{n}} mil kg', { n: fmtDec(kg / 1000) }) : `${fmtInt(kg)} kg`);
/** Eje: «0», «5 mil», «60». */
export const fmtAxis = (v: number) => (v >= 1000 ? i18n.t('{{n}} mil', { n: fmtDec(v / 1000, v % 1000 === 0 ? 0 : 1) }) : fmtInt(v));
/** Peso de una serie: «32,5 kg». */
export const fmtWeight = (kg: number) => `${Number.isInteger(kg) ? kg : fmtDec(kg)} kg`;
