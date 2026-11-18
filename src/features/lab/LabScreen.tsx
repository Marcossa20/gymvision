// Laboratorio de componentes (solo dev): prueba en móvil real los 6 componentes que pide la práctica.
// Teoría: La Persona → háptica con patrones distintos + aviso visual (Reto 3: nada depende solo del sonido);
// El Ordenador → cámara (QR), NFC y acelerómetro funcionando de verdad antes de pulir la UI.
import React, { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Activity, ChevronLeft, Footprints, Nfc, PauseCircle, QrCode, ScanLine, Vibrate } from 'lucide-react-native';
import { Button, Card, T } from '../../components/ui';
import { notify, type AlertKind } from '../../services/alerts';
import { useSettings } from '../../store/settings';
import { useTheme } from '../../theme/useTheme';
import { radius } from '../../theme/tokens';
import { createScanGuard, lookupMachine, machineRoute } from '../../services/qr';
import { cancelNfc, getNfcStatus, readLockTag, simulateLockTag, type LockTag, type NfcStatus } from '../../services/nfc';
import { useStepCounter } from '../../services/accelerometer';
import { useRanksDemo } from '../ranks/data';

function Section({ icon, title, subtitle, children }: { icon: React.ReactNode; title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <Card style={{ padding: 16, gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        {icon}
        <View style={{ flex: 1 }}>
          <T size={18} weight="700" accessibilityRole="header">{title}</T>
          <T size={13} color="secondary">{subtitle}</T>
        </View>
      </View>
      {children}
    </Card>
  );
}

// ───────────────────────── Háptica ─────────────────────────
const HAPTICS: { kind: AlertKind; label: string; msg: string }[] = [
  { kind: 'serie', label: 'Serie guardada', msg: 'Serie guardada · 1 pulso corto' },
  { kind: 'descanso', label: 'Fin de descanso', msg: 'Descanso terminado · 3 pulsos medios' },
  { kind: 'rango', label: 'Subida de rango', msg: '¡Subes a Oro III! · corto-corto-largo' },
  { kind: 'cardio', label: 'Inicio/fin cardio', msg: 'Cardio · 2 pulsos cortos' },
  { kind: 'qr', label: 'Código QR leído', msg: 'QR leído · 1 pulso corto' },
  { kind: 'taquilla', label: 'Taquilla abierta', msg: 'Taquilla abierta · 2 pulsos medios' },
  { kind: 'error', label: 'Error', msg: 'Acción no válida · 1 pulso largo' },
];

function HapticsLab() {
  const { colors } = useTheme();
  const vibration = useSettings((s) => s.vibration);
  const visual = useSettings((s) => s.visualAlerts);
  return (
    <Section icon={<Vibrate size={22} color={colors.brand} />} title="Háptica" subtitle={`Vibración ${vibration ? 'activada' : 'DESACTIVADA'} · Aviso visual ${visual ? 'activado' : 'DESACTIVADO'}`}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {HAPTICS.map((h) => (
          <Button key={h.kind} variant="secondary" label={h.label} onPress={() => notify(h.kind, h.msg)} style={{ flexGrow: 1, flexBasis: '45%' }} />
        ))}
      </View>
    </Section>
  );
}

// ───────────────────────── QR ─────────────────────────
function QrLab() {
  const { colors, fs } = useTheme();
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [manual, setManual] = useState('');
  const [lastId, setLastId] = useState<string | null>(null);
  const guard = useRef(createScanGuard());

  const handle = (raw: string) => {
    const r = lookupMachine(raw);
    if (r.ok) {
      notify('qr', `${r.code} · ${r.exercise.name}`);
      setResult(`✓ ${r.code} → ${r.exercise.name}`);
      setLastId(r.exercise.id);
    } else {
      notify('error', r.reason === 'format' ? 'Código no válido' : `${r.code} no está en este gimnasio`);
      setResult(`✕ «${raw.slice(0, 40)}» ${r.reason === 'format' ? 'no tiene formato de máquina' : 'no existe'}`);
      setLastId(null);
    }
  };

  const toggleCamera = async () => {
    if (open) return setOpen(false);
    if (!permission?.granted) {
      const p = await requestPermission();
      if (!p.granted) return notify('error', 'Sin permiso de cámara');
    }
    setOpen(true);
  };

  return (
    <Section icon={<QrCode size={22} color={colors.brand} />} title="Cámara · QR de máquina" subtitle="Formato PB-0142 · prueba PB-0142, PB-0087, PB-0455">
      <Button label={open ? 'Cerrar cámara' : 'Abrir cámara'} variant={open ? 'secondary' : 'primary'} onPress={toggleCamera} icon={<ScanLine size={20} color={open ? colors.textPrimary : colors.onBrand} />} />
      {open ? (
        <View style={{ height: 260, borderRadius: radius.card, overflow: 'hidden' }}>
          <CameraView
            style={{ flex: 1 }}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={({ data }) => guard.current(data) && handle(data)}
          />
        </View>
      ) : null}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TextInput
          value={manual}
          onChangeText={setManual}
          placeholder="Código manual (PB-0142)"
          placeholderTextColor={colors.textSecondary}
          autoCapitalize="characters"
          autoCorrect={false}
          onSubmitEditing={() => manual && handle(manual)}
          accessibilityLabel="Código manual de máquina"
          style={{ flex: 1, minHeight: 56, borderRadius: radius.button, borderWidth: 1.5, borderColor: colors.divider, color: colors.textPrimary, paddingHorizontal: 14, fontSize: fs(16), fontFamily: 'Inter_500Medium' }}
        />
        <Button label="Probar" onPress={() => manual && handle(manual)} style={{ paddingHorizontal: 20 }} />
      </View>
      {result ? <T size={15} weight="500" accessibilityRole="text">{result}</T> : null}
      {lastId ? <Button variant="secondary" label="Abrir ejercicio (ruta de A)" onPress={() => router.push(machineRoute(lastId) as never)} /> : null}
    </Section>
  );
}

// ───────────────────────── NFC ─────────────────────────
const STATUS_TEXT: Record<NfcStatus, string> = {
  ready: 'NFC listo',
  disabled: 'NFC desactivado en el móvil',
  unsupported: 'Sin NFC (o Expo Go): usa «Simular cerradura»',
};

function NfcLab() {
  const { colors } = useTheme();
  const [status, setStatus] = useState<NfcStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    void getNfcStatus().then(setStatus);
    return () => void cancelNfc();
  }, []);

  const opened = (tag: LockTag) => {
    notify('taquilla', `Taquilla ${tag.lockerId} abierta${tag.simulated ? ' (simulada)' : ''}`);
    setMsg(`✓ Taquilla ${tag.lockerId} abierta${tag.tagId ? ` · etiqueta ${tag.tagId}` : ''}${tag.simulated ? ' · simulada' : ''}`);
  };

  const read = async () => {
    setBusy(true);
    setMsg('Acerca el móvil a la cerradura…');
    try {
      opened(await readLockTag());
    } catch (e) {
      const m = e instanceof Error ? e.message : 'Error de NFC';
      notify('error', m);
      setMsg(`✕ ${m}`);
    } finally {
      setBusy(false);
    }
  };

  const simulate = async () => {
    setBusy(true);
    setMsg('Simulando cerradura…');
    opened(await simulateLockTag());
    setBusy(false);
  };

  return (
    <Section icon={<Nfc size={22} color={colors.brand} />} title="NFC · Taquilla" subtitle={status ? STATUS_TEXT[status] : 'Comprobando NFC…'}>
      <Button label={busy ? 'Esperando…' : 'Leer cerradura'} onPress={read} disabled={busy || status !== 'ready'} />
      {busy && status === 'ready' ? <Button variant="secondary" label="Cancelar" onPress={() => void cancelNfc()} /> : null}
      <Button variant="secondary" label="Simular cerradura" onPress={simulate} disabled={busy} />
      {msg ? <T size={15} weight="500">{msg}</T> : null}
      <T size={12} color="secondary">Etiqueta: texto NDEF «GV-LOCKER:027» (o cualquier pegatina NFC: se usa su id).</T>
    </Section>
  );
}

// ───────────────────────── Acelerómetro ─────────────────────────
const fmtTime = (ms: number) => {
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};

function AccelLab() {
  const { colors } = useTheme();
  const c = useStepCounter({
    onWalkingChange: (w) => notify('cardio', w ? 'Andando · cronómetro en marcha' : 'Parado · cronómetro en pausa'),
  });
  const signalPct = Math.min(1, Math.max(0, (c.last?.signal ?? 0) / 0.5));

  return (
    <Section icon={<Activity size={22} color={colors.brand} />} title="Acelerómetro · Pasos" subtitle={c.available === false ? 'Acelerómetro no disponible' : 'Camina con el móvil en la mano o el bolsillo'}>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Button label={c.running ? 'Parar' : 'Empezar'} variant={c.running ? 'secondary' : 'primary'} onPress={c.running ? c.stop : c.start} disabled={!c.available} style={{ flex: 1 }} />
        <Button label="Reiniciar" variant="secondary" onPress={c.reset} style={{ flex: 1 }} />
      </View>
      {/* Estado con icono + texto (el color nunca va solo) */}
      <View accessible accessibilityLabel={`${c.walking ? 'Andando' : 'Parado'}, ${c.steps} pasos, tiempo activo ${fmtTime(c.activeMs)}`} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        {c.walking ? <Footprints size={32} color={colors.brand} /> : <PauseCircle size={32} color={colors.textSecondary} />}
        <View style={{ flex: 1 }}>
          <T size={20} weight="700">{c.walking ? 'Andando' : 'Parado'}</T>
          <T size={14} color="secondary">Cronómetro {c.walking ? 'en marcha' : 'en pausa'}</T>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <T size={28} weight="700">{c.steps}</T>
          <T size={13} color="secondary">pasos · {fmtTime(c.activeMs)}</T>
        </View>
      </View>
      <View style={{ height: 10, borderRadius: 5, backgroundColor: colors.divider, overflow: 'hidden' }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <View style={{ width: `${signalPct * 100}%`, height: '100%', backgroundColor: colors.brand }} />
      </View>
      <T size={12} color="secondary">
        {c.last
          ? `x ${c.last.x.toFixed(2)} · y ${c.last.y.toFixed(2)} · z ${c.last.z.toFixed(2)} · |a| ${c.last.magnitude.toFixed(2)} g · señal ${c.last.signal.toFixed(2)} g`
          : 'Sin datos'}
      </T>
    </Section>
  );
}

/** Datos de ejemplo para enseñar el mapa muscular y los modos de daltonismo (Reto 1) sin entrenar antes. */
function DemoRanks() {
  const { colors } = useTheme();
  const demo = useRanksDemo((s) => s.demo);
  const toggle = useRanksDemo((s) => s.toggle);
  return (
    <Section icon={<Activity size={22} color={colors.brand} />} title="Datos de demostración" subtitle={demo ? 'Activados: Rangos y Perfil simulan un mes de uso' : 'Desactivados: se usan tus datos reales'}>
      <Button variant={demo ? 'secondary' : 'primary'} label={demo ? 'Usar mis datos reales' : 'Cargar datos de ejemplo (1 mes)'} onPress={toggle} />
    </Section>
  );
}

export function LabScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, height: 56 }}>
        <Pressable accessibilityRole="button" accessibilityLabel="Volver" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}>
          <ChevronLeft size={26} color={colors.textPrimary} />
        </Pressable>
        <T size={20} weight="700" accessibilityRole="header">Laboratorio de componentes</T>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 8, gap: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <T size={13} color="secondary">Solo desarrollo · {Platform.OS} · NFC y vibración solo funcionan en móvil real (development build).</T>
        <HapticsLab />
        <QrLab />
        <NfcLab />
        <AccelLab />
        <DemoRanks />
        {/* Atajos al cardio mientras A no tenga el lanzador en Rutinas (contrato §2.2) */}
        <Section icon={<Footprints size={22} color={colors.brand} />} title="Cardio" subtitle="Abre /cardio/run como lo hará Rutinas">
          <Button label="Caminata · objetivo 5.000 pasos" onPress={() => router.push('/cardio/run?exerciseId=caminata&goal=steps&target=5000' as never)} />
          <Button variant="secondary" label="Correr · sin objetivo" onPress={() => router.push('/cardio/run?exerciseId=correr' as never)} />
          <Button variant="secondary" label="Bicicleta · objetivo 30 min" onPress={() => router.push('/cardio/run?exerciseId=bicicleta&goal=time&target=30' as never)} />
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}
