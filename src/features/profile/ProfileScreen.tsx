// Perfil (Figma 2009:2) con pestañas Entrenos / Progreso (Figma 2010:2 y 2010:224).
// Teoría (reconocimiento antes que recuerdo): el historial muestra fecha, nombre, duración y músculos;
// los chips de músculo llevan punto del color de su rango + nombre (el color nunca va solo, Reto 1).
// Teoría (feedback/gamificación): resumen del periodo con variación respecto al anterior (flecha + signo + número).
import React, { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowDown, ArrowUp, ChartLine, ChevronRight, Dumbbell, FlaskConical, MousePointerClick, Pencil, Settings, User } from 'lucide-react-native';
import { Card, T } from '../../components/ui';
import type { Muscle } from '../../data/seed';
import { useProfile } from '../../store/profile';
import { useWorkout } from '../../store/workout';
import { useRankColors, useTheme } from '../../theme/useTheme';
import { useMuscleRanks } from '../ranks/data';
import { MUSCLE_LABELS } from '../ranks/muscles';
import { BarChart } from './BarChart';
import { fmtDayLabel, fmtDec, fmtDuration, fmtInt, fmtKg } from './format';
import { useHistory, type HistoryItem } from './history';
import { PERIODS, periodStats, type Metric, type Period } from './progress';

export function MuscleChip({ m, size = 'sm' }: { m: Muscle; size?: 'sm' | 'md' }) {
  const { colors } = useTheme();
  const palette = useRankColors();
  const { byMuscle } = useMuscleRanks();
  const r = byMuscle[m]?.rank;
  const md = size === 'md';
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: md ? 7 : 6, paddingLeft: md ? 11 : 9, paddingRight: md ? 12 : 10, paddingVertical: md ? 6 : 5, borderRadius: md ? 14 : 12, backgroundColor: colors.surface2 }}>
      <View style={{ width: md ? 9 : 8, height: md ? 9 : 8, borderRadius: 5, backgroundColor: r ? palette[r.tier] : colors.textSecondary }} />
      <T size={md ? 13 : 12} weight="500">{MUSCLE_LABELS[m]}</T>
    </View>
  );
}

export function Avatar({ size, uri }: { size: number; uri: string | null }) {
  const { colors } = useTheme();
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.divider, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      {uri ? <Image source={{ uri }} style={{ width: size, height: size }} accessibilityIgnoresInvertColors /> : <User size={Math.round(size * 0.47)} color={colors.textSecondary} />}
    </View>
  );
}

function WorkoutCard({ h }: { h: HistoryItem }) {
  const router = useRouter();
  const { colors } = useTheme();
  return (
    <Card onPress={() => router.push(`/profile/workout/${h.id}` as never)} accessibilityLabel={`${fmtDayLabel(h.date)}, ${h.name}, ${fmtDuration(h.durationMin)}, ${h.sets} series`} style={{ paddingHorizontal: 16, paddingVertical: 14, gap: 6, borderWidth: 0 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <T size={11} weight="600" color="brand" style={{ flex: 1, letterSpacing: 0.6 }}>{fmtDayLabel(h.date)}</T>
        <ChevronRight size={18} color={colors.textSecondary} />
      </View>
      <T size={17} weight="700">{h.name}</T>
      <T size={12.5} color="secondary">{fmtDuration(h.durationMin)} · {h.sets} series</T>
      {h.muscles.length ? <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingTop: 4 }}>{h.muscles.map((m) => <MuscleChip key={m} m={m} />)}</View> : null}
    </Card>
  );
}

function Delta({ cur, prev, fmt }: { cur: number; prev: number; fmt: (v: number) => string }) {
  const { colors } = useTheme();
  const d = cur - prev;
  if (d === 0) return <T size={12} weight="600" color="secondary">= igual</T>;
  const up = d > 0;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
      {up ? <ArrowUp size={11} color={colors.brand} strokeWidth={3} /> : <ArrowDown size={11} color={colors.textSecondary} strokeWidth={3} />}
      <T size={12} weight="600" color={up ? 'brand' : 'secondary'}>{up ? '+' : '−'}{fmt(Math.abs(d))}</T>
    </View>
  );
}

function Tile({ label, value, delta }: { label: string; value: string; delta: React.ReactNode }) {
  return (
    <Card style={{ flex: 1, minHeight: 80, paddingHorizontal: 16, paddingVertical: 14, gap: 4, borderWidth: 0 }}>
      <T size={10.5} weight="600" color="secondary" style={{ letterSpacing: 0.7 }}>{label}</T>
      <T size={20} weight="700">{value}</T>
      {delta}
    </Card>
  );
}

function Segmented<V extends string>({ options, value, onChange, pill }: { options: { id: V; label: string }[]; value: V; onChange: (v: V) => void; pill?: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={[{ flexDirection: 'row', gap: pill ? 6 : 3 }, !pill && { backgroundColor: colors.surface2, padding: 3, borderRadius: 12 }]} accessibilityRole="radiogroup">
      {options.map((o) => {
        const on = o.id === value;
        return (
          <Pressable
            key={o.id}
            onPress={() => onChange(o.id)}
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
            hitSlop={pill ? { top: 7, bottom: 7 } : undefined}
            style={{ flex: 1, minHeight: pill ? 34 : 38, paddingHorizontal: 4, alignItems: 'center', justifyContent: 'center', borderRadius: pill ? 16 : 9, backgroundColor: on ? colors.brand : pill ? colors.divider : 'transparent' }}
          >
            <T size={pill ? 12.5 : 13.5} weight={on ? '700' : '500'} color={on ? colors.onBrand : 'secondary'} numberOfLines={1}>{o.label}</T>
          </Pressable>
        );
      })}
    </View>
  );
}

function ProgressTab({ history }: { history: HistoryItem[] }) {
  const { colors } = useTheme();
  const [metric, setMetric] = useState<Metric>('volume');
  const [period, setPeriod] = useState<Period>('week');
  const s = useMemo(() => periodStats(history, period, metric), [history, period, metric]);
  const maxI = s.buckets.reduce((bi, b, i, arr) => (b.value > arr[bi].value ? i : bi), 0);
  const [sel, setSel] = useState<number | null>(null);
  const selected = sel !== null && sel < s.buckets.length ? sel : maxI;
  const pct = s.prevTotal > 0 ? Math.round(((s.total - s.prevTotal) / s.prevTotal) * 100) : null;
  const fmtVal = metric === 'volume' ? (v: number) => `${fmtInt(v)} kg` : (v: number) => `${fmtInt(v)} series`;
  const reset = () => setSel(null);

  return (
    <View style={{ gap: 12, paddingTop: 16, paddingBottom: 18 }}>
      <Card style={{ padding: 16, gap: 14, borderWidth: 0 }}>
        <Segmented options={[{ id: 'volume', label: 'Volumen (kg)' }, { id: 'sets', label: 'Nº de series' }]} value={metric} onChange={(v) => { setMetric(v); reset(); }} />
        <Segmented pill options={PERIODS} value={period} onChange={(v) => { setPeriod(v); reset(); }} />
        <View style={{ gap: 4 }}>
          <T size={11} weight="600" color="secondary" style={{ letterSpacing: 0.8 }}>{metric === 'volume' ? 'VOLUMEN TOTAL' : 'SERIES TOTALES'}</T>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <T size={30} weight="700">{metric === 'volume' ? fmtKg(s.total) : fmtInt(s.total)}</T>
            {pct !== null ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingLeft: 7, paddingRight: 8, paddingVertical: 4, borderRadius: 10, backgroundColor: colors.surface2 }}>
                {pct >= 0 ? <ArrowUp size={12} color={colors.brand} strokeWidth={3} /> : <ArrowDown size={12} color={colors.textSecondary} strokeWidth={3} />}
                <T size={12.5} weight="700" color={pct >= 0 ? 'brand' : 'secondary'}>{Math.abs(pct)} %</T>
              </View>
            ) : null}
          </View>
          <T size={12.5} color="secondary">{s.rangeLabel}{period !== 'all' ? ' · frente al periodo anterior' : ''}</T>
        </View>
        <BarChart buckets={s.buckets} selected={selected} onSelect={setSel} format={fmtVal} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <MousePointerClick size={14} color={colors.textSecondary} />
          <T size={12} color="secondary">Toca una barra para ver el detalle</T>
        </View>
      </Card>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Tile label="ENTRENOS" value={fmtInt(s.workouts)} delta={<Delta cur={s.workouts} prev={s.prevWorkouts} fmt={fmtInt} />} />
        {metric === 'volume' ? (
          <Tile label="SERIES" value={fmtInt(s.sets)} delta={<Delta cur={s.sets} prev={s.prevSets} fmt={fmtInt} />} />
        ) : (
          <Tile label="SERIES / ENTRENO" value={s.workouts ? fmtDec(s.sets / s.workouts) : '—'} delta={<Delta cur={s.workouts ? s.sets / s.workouts : 0} prev={s.prevWorkouts ? s.prevSets / s.prevWorkouts : 0} fmt={(v) => fmtDec(v)} />} />
        )}
      </View>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        {metric === 'volume' ? (
          <Tile label="TIEMPO" value={fmtDuration(s.minutes)} delta={<Delta cur={s.minutes} prev={s.prevMinutes} fmt={fmtDuration} />} />
        ) : (
          <Tile label="VOLUMEN" value={fmtKg(s.volume)} delta={<Delta cur={s.volume} prev={s.prevVolume} fmt={(v) => fmtKg(v).replace(' kg', '')} />} />
        )}
        <Tile label="RÉCORDS" value={fmtInt(s.records)} delta={<Delta cur={s.records} prev={s.prevRecords} fmt={fmtInt} />} />
      </View>
    </View>
  );
}

export function ProfileScreen() {
  const { colors } = useTheme();
  const palette = useRankColors();
  const router = useRouter();
  const { name, username, photoUri } = useProfile();
  const streak = useWorkout((s) => s.streak);
  const { general } = useMuscleRanks();
  const history = useHistory();
  const [tab, setTab] = useState<'entrenos' | 'progreso'>('entrenos');

  const Tab = ({ id, label, Icon }: { id: typeof tab; label: string; Icon: typeof Dumbbell }) => {
    const on = tab === id;
    return (
      <Pressable onPress={() => setTab(id)} accessibilityRole="tab" accessibilityState={{ selected: on }} style={{ flex: 1, alignItems: 'center', gap: 12, minHeight: 48 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Icon size={22} color={on ? colors.brand : colors.textSecondary} />
          <T size={14} weight={on ? '700' : '500'} color={on ? 'brand' : 'secondary'}>{label}</T>
        </View>
        <View style={{ alignSelf: 'stretch', height: 3, backgroundColor: on ? colors.brand : colors.divider }} />
      </Pressable>
    );
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingLeft: 20, paddingRight: 8, paddingTop: 4 }}>
        <T size={19} weight="700" style={{ flex: 1 }} accessibilityRole="header" numberOfLines={1}>@{username}</T>
        <Pressable accessibilityRole="button" accessibilityLabel="Editar perfil" onPress={() => router.push('/profile/edit' as never)} style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}>
          <Pencil size={24} color={colors.textPrimary} />
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Ajustes" onPress={() => router.push('/settings' as never)} style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}>
          <Settings size={24} color={colors.textPrimary} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20 }}>
        <View style={{ height: 1, backgroundColor: colors.divider }} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, paddingTop: 20, paddingBottom: 18 }}>
          <Avatar size={80} uri={photoUri} />
          <View style={{ flex: 1, gap: 10 }}>
            <T size={21} weight="700">{name}</T>
            <View style={{ flexDirection: 'row', gap: 22 }}>
              <View><T size={17} weight="700">{fmtInt(history.length)}</T><T size={12} weight="500" color="secondary">Entrenos</T></View>
              <View><T size={17} weight="700" color="brand">{streak}</T><T size={12} weight="500" color="secondary">Racha</T></View>
              <View><T size={17} weight="700" color={general ? palette[general.tier] : 'secondary'}>{general ? general.label : 'Sin rango'}</T><T size={12} weight="500" color="secondary">Nivel</T></View>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: 'row', paddingTop: 14 }} accessibilityRole="tablist">
          <Tab id="entrenos" label="Entrenos" Icon={Dumbbell} />
          <Tab id="progreso" label="Progreso" Icon={ChartLine} />
        </View>
        {tab === 'entrenos' ? (
          <View style={{ gap: 10, paddingTop: 16, paddingBottom: 18 }}>
            {history.length === 0 ? (
              <Card style={{ padding: 20, gap: 6, alignItems: 'center', borderWidth: 0 }}>
                <Dumbbell size={28} color={colors.textSecondary} />
                <T size={16} weight="600">Aún no hay entrenos</T>
                <T size={13} color="secondary" style={{ textAlign: 'center' }}>Cuando termines uno aparecerá aquí.</T>
              </Card>
            ) : history.map((h) => <WorkoutCard key={h.id} h={h} />)}
            {__DEV__ ? (
              <Pressable onPress={() => router.push('/lab')} accessibilityRole="button" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, minHeight: 48 }}>
                <FlaskConical size={16} color={colors.textSecondary} />
                <T size={13} color="secondary">Laboratorio de componentes (dev)</T>
              </Pressable>
            ) : null}
          </View>
        ) : (
          <ProgressTab history={history} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
