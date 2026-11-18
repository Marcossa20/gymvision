// Formatos en español: decimales con coma (27,5 kg) y tiempos mm:ss.
export const fmtNum = (n: number) => String(Math.round(n * 10) / 10).replace('.', ',');
export const fmtClock = (totalSec: number) => {
  const s = Math.max(0, Math.round(totalSec));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  const mm = h ? String(m).padStart(2, '0') : String(m);
  return `${h ? h + ':' : ''}${mm}:${String(sec).padStart(2, '0')}`;
};
