// Formatos en español: decimales con coma (27,5 kg) y tiempos mm:ss.
export const fmtNum = (n: number) => String(Math.round(n * 10) / 10).replace('.', ',');
export const fmtClock = (totalSec: number) => {
  const s = Math.max(0, Math.round(totalSec));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  const mm = h ? String(m).padStart(2, '0') : String(m);
  return `${h ? h + ':' : ''}${mm}:${String(sec).padStart(2, '0')}`;
};

/** 96 → «1 h 36 min»; 36 → «36 min». */
export const fmtDuration = (min: number) => (min >= 60 ? `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, '0')} min` : `${min} min`);
/** 8420 → «8.420» (separador de miles español). */
export const fmtThousands = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const DAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
/** «viernes 16 de octubre» */
export const fmtDateLong = (ts: number) => { const d = new Date(ts); return `${DAYS[d.getDay()]} ${d.getDate()} de ${MONTHS[d.getMonth()]}`; };
