// Agregación del historial por periodo para la gráfica de Progreso (función pura).
import i18n from 'i18next';
import type { HistoryItem } from './history';
import { dayShort, monthName, monthShort, startOfDay } from './format';

export type Metric = 'volume' | 'sets';
export type Period = 'week' | 'month' | '3m' | 'year' | 'all';

export const PERIODS: { id: Period; label: string }[] = [
  { id: 'week', label: 'Semana' }, { id: 'month', label: 'Mes' }, { id: '3m', label: '3 meses' }, { id: 'year', label: 'Año' }, { id: 'all', label: 'Todo' },
];

export interface Bucket { start: number; end: number; label: string; long: string; value: number; count: number }
export interface PeriodStats {
  buckets: Bucket[];
  rangeLabel: string;
  total: number;
  prevTotal: number;
  workouts: number; prevWorkouts: number;
  sets: number; prevSets: number;
  minutes: number; prevMinutes: number;
  volume: number; prevVolume: number;
  records: number; prevRecords: number;
}

const DAY = 86400000;
const monthStart = (y: number, m: number) => new Date(y, m, 1).getTime();

function bucketsFor(period: Period, now: number, first: number): { buckets: Omit<Bucket, 'value' | 'count'>[]; rangeLabel: string; span: [number, number] } {
  const d = new Date(now);
  if (period === 'week') {
    const dow = (d.getDay() + 6) % 7; // lunes = 0
    const mon = startOfDay(now) - dow * DAY;
    const b = Array.from({ length: 7 }, (_, i) => {
      const s = mon + i * DAY;
      return { start: s, end: s + DAY, label: dayShort(s), long: `${dayShort(s)} ${new Date(s).getDate()} ${monthShort(new Date(s).getMonth())}` };
    });
    const sun = new Date(mon + 6 * DAY);
    return { buckets: b, rangeLabel: `${new Date(mon).getDate()} – ${sun.getDate()} ${monthName(sun.getMonth()).slice(0, 3)}`, span: [mon, mon + 7 * DAY] };
  }
  if (period === 'month') {
    const y = d.getFullYear(), m = d.getMonth();
    const days = new Date(y, m + 1, 0).getDate();
    const b: Omit<Bucket, 'value' | 'count'>[] = [];
    for (let s = 1; s <= days; s += 7) {
      const e = Math.min(days, s + 6);
      b.push({ start: new Date(y, m, s).getTime(), end: new Date(y, m, e + 1).getTime(), label: `${s}–${e}`, long: `${s} – ${e} ${monthShort(m)}` });
    }
    const name = monthName(m);
    return { buckets: b, rangeLabel: `${name[0].toUpperCase()}${name.slice(1, 3)} ${y}`, span: [monthStart(y, m), monthStart(y, m + 1)] };
  }
  const months = (n: number, single = false) => {
    const b: Omit<Bucket, 'value' | 'count'>[] = [];
    for (let i = n - 1; i >= 0; i--) {
      const md = new Date(d.getFullYear(), d.getMonth() - i, 1);
      const label = single ? monthShort(md.getMonth())[0] : monthShort(md.getMonth());
      b.push({ start: md.getTime(), end: monthStart(md.getFullYear(), md.getMonth() + 1), label, long: `${monthName(md.getMonth()).toUpperCase()} ${md.getFullYear()}` });
    }
    return b;
  };
  if (period === '3m') {
    const b = months(3);
    return { buckets: b, rangeLabel: i18n.t('Últimos 3 meses'), span: [b[0].start, b[b.length - 1].end] };
  }
  if (period === 'year') {
    const y = d.getFullYear();
    const b = Array.from({ length: 12 }, (_, m) => ({ start: monthStart(y, m), end: monthStart(y, m + 1), label: monthShort(m)[0], long: `${monthName(m).toUpperCase()} ${y}` }));
    return { buckets: b, rangeLabel: i18n.t('Año {{y}}', { y }), span: [monthStart(y, 0), monthStart(y + 1, 0)] };
  }
  // Todo: por meses desde el primer entreno (máx. 12 barras)
  const f = new Date(first);
  const n = Math.min(12, Math.max(1, (d.getFullYear() - f.getFullYear()) * 12 + d.getMonth() - f.getMonth() + 1));
  const b = months(n, n > 6);
  return { buckets: b, rangeLabel: i18n.t('Desde el principio'), span: [Math.min(first, b[0].start), b[b.length - 1].end] };
}

export function periodStats(items: HistoryItem[], period: Period, metric: Metric, now = Date.now()): PeriodStats {
  const first = items.length ? Math.min(...items.map((i) => i.date)) : now;
  const { buckets, rangeLabel, span } = bucketsFor(period, now, first);
  const val = (i: HistoryItem) => (metric === 'volume' ? i.volume : i.sets);
  const full = buckets.map((b) => {
    const inB = items.filter((i) => i.date >= b.start && i.date < b.end);
    return { ...b, value: inB.reduce((a, i) => a + val(i), 0), count: inB.length };
  });
  const inRange = (a: number, b: number) => items.filter((i) => i.date >= a && i.date < b);
  const cur = inRange(span[0], span[1]);
  const len = span[1] - span[0];
  const prev = period === 'all' ? [] : inRange(span[0] - len, span[0]);
  const sum = (xs: HistoryItem[], f: (i: HistoryItem) => number) => xs.reduce((a, i) => a + f(i), 0);
  return {
    buckets: full, rangeLabel,
    total: sum(cur, val), prevTotal: sum(prev, val),
    workouts: cur.length, prevWorkouts: prev.length,
    sets: sum(cur, (i) => i.sets), prevSets: sum(prev, (i) => i.sets),
    minutes: sum(cur, (i) => i.durationMin), prevMinutes: sum(prev, (i) => i.durationMin),
    volume: sum(cur, (i) => i.volume), prevVolume: sum(prev, (i) => i.volume),
    records: sum(cur, (i) => i.records), prevRecords: sum(prev, (i) => i.records),
  };
}

/** Máximo «bonito» del eje y su paso (1, 2, 5 × 10ⁿ), con 3–4 guías. */
export function niceAxis(max: number) {
  if (max <= 0) return { top: 3, step: 1 };
  const raw = max / 3;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((k) => k * pow).find((s) => s >= raw)!;
  return { top: Math.ceil(max / step) * step, step };
}
