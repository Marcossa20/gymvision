// Formatos en español para Perfil (miles con punto, decimales con coma, fechas abreviadas).
export { fmtInt, fmtDec } from '../cardio/format';
import { fmtDec, fmtInt } from '../cardio/format';

const DAYS_SHORT = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
const MONTHS_SHORT = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

export const startOfDay = (t: number) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };

/** «HOY», «AYER» o «LUN 12 OCT». */
export function fmtDayLabel(t: number, now = Date.now()) {
  const diff = Math.round((startOfDay(now) - startOfDay(t)) / 86400000);
  if (diff === 0) return 'HOY';
  if (diff === 1) return 'AYER';
  const d = new Date(t);
  return `${DAYS_SHORT[d.getDay()]} ${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
}

export const fmtLongDate = (t: number) => { const d = new Date(t); return `${d.getDate()} de ${MONTHS[d.getMonth()]}, ${d.getFullYear()}`; };
export const fmtShortDate = (t: number) => { const d = new Date(t); return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}`; };
export const monthName = (m: number) => MONTHS[m];
export const dayShort = (t: number) => DAYS_SHORT[new Date(t).getDay()];
export const monthShort = (m: number) => MONTHS_SHORT[m];

/** «1 h 11 min» / «54 min». */
export function fmtDuration(min: number) {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return h ? `${h} h ${String(m).padStart(2, '0')} min` : `${m} min`;
}

/** «36,1 mil kg» a partir de 10.000; si no, «6.895 kg». */
export const fmtKg = (kg: number) => (kg >= 10000 ? `${fmtDec(kg / 1000)} mil kg` : `${fmtInt(kg)} kg`);
/** Eje: «0», «5 mil», «60». */
export const fmtAxis = (v: number) => (v >= 1000 ? `${fmtDec(v / 1000, v % 1000 === 0 ? 0 : 1)} mil` : fmtInt(v));
/** Peso de una serie: «32,5 kg». */
export const fmtWeight = (kg: number) => `${Number.isInteger(kg) ? kg : fmtDec(kg)} kg`;
