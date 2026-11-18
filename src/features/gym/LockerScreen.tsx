// Taquilla NFC (Figma 2046:206) y Taquilla abierta (Figma 2046:242) — RF3.
// Teoría (El Ordenador, NFC): gesto físico de acercar el móvil, sin llave ni teclear.
// Teoría (La Persona): estado siempre visible con icono + texto (candado cerrado/abierto, no solo color);
// ondas animadas = el sistema está esperando (visibilidad del estado). Vibración + aviso al abrir (Reto 3).
// Plan B: «Simular cerradura» en desarrollo o si el móvil no tiene NFC.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Check, Lock, LockOpen, Nfc } from 'lucide-react-native';
import { Button, T } from '../../components/ui';
import { notify } from '../../services/alerts';
import { cancelNfc, getNfcStatus, readLockTag, simulateLockTag, type NfcStatus } from '../../services/nfc';
import { useTheme } from '../../theme/useTheme';
import { useGym } from './store';
import { alpha, BottomActions, ScreenBar } from './ui';


type Phase = 'waiting' | 'open' | 'error';

function Waves({ active, children, onPress, label }: { active: boolean; children: React.ReactNode; onPress?: () => void; label: string }) {
  const { colors } = useTheme();
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!active) return void pulse.setValue(0);
    const a = Animated.loop(Animated.timing(pulse, { toValue: 1, duration: 1600, easing: Easing.out(Easing.quad), useNativeDriver: true }));
    a.start();
    return () => a.stop();
  }, [active, pulse]);
  const ring = (size: number, a: number) => ({ position: 'absolute' as const, width: size, height: size, borderRadius: size / 2, backgroundColor: alpha(colors.brand, a) });
  return (
    <Pressable onPress={onPress} disabled={!onPress} accessibilityRole={onPress ? 'button' : undefined} accessibilityLabel={label} style={{ width: 280, height: 280, alignItems: 'center', justifyContent: 'center' }}>
      <View style={ring(280, 0.07)} />
      <View style={ring(210, 0.16)} />
      {active ? (
        <Animated.View style={[ring(140, 0.35), { transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 2] }) }], opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.9, 0] }) }]} />
      ) : null}
      <View style={{ width: 140, height: 140, borderRadius: 70, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center' }}>{children}</View>
    </Pressable>
  );
}

export function LockerScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const lockerNo = useGym((s) => s.lockerNo);
  const setLocker = useGym((s) => s.setLocker);
  const [phase, setPhase] = useState<Phase>('waiting');
  const [status, setStatus] = useState<NfcStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const alive = useRef(true);

  const opened = useCallback((simulated: boolean) => {
    setLocker('open');
    setPhase('open');
    notify('taquilla', `Taquilla ${lockerNo} abierta${simulated ? ' (simulada)' : ''}`);
  }, [lockerNo, setLocker]);

  const read = useCallback(async () => {
    setPhase('waiting');
    setError(null);
    try {
      await readLockTag();
      if (alive.current) opened(false);
    } catch (e) {
      if (!alive.current) return;
      const msg = e instanceof Error ? e.message : 'Error de NFC';
      setError(msg);
      setPhase('error');
      notify('error', msg);
    }
  }, [opened]);

  useEffect(() => {
    alive.current = true;
    void getNfcStatus().then((s) => {
      if (!alive.current) return;
      setStatus(s);
      if (s === 'ready') void read();
      else {
        setPhase('error');
        setError(s === 'disabled' ? 'Activa el NFC en los ajustes del móvil.' : 'Este móvil no tiene NFC.');
      }
    });
    return () => { alive.current = false; void cancelNfc(); };
  }, [read]);

  const simulate = async () => {
    await cancelNfc();
    setPhase('waiting');
    await simulateLockTag(String(lockerNo));
    if (alive.current) opened(true);
  };

  const close = () => { void cancelNfc(); router.canGoBack() ? router.back() : router.replace('/gimnasio' as never); };
  const isOpen = phase === 'open';
  const showSimulate = !isOpen && (__DEV__ || status !== 'ready');

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenBar title="Mi taquilla" onBack={close} />
      <View style={{ alignItems: 'center', paddingTop: 56, paddingHorizontal: 20, gap: 28 }}>
        <Waves active={phase === 'waiting'} onPress={phase === 'error' && status === 'ready' ? read : undefined} label={isOpen ? 'Taquilla abierta' : phase === 'error' ? 'Reintentar lectura NFC' : 'Esperando la cerradura'}>
          {isOpen ? <Check size={64} color={colors.onBrand} strokeWidth={2.5} /> : <Nfc size={64} color={colors.onBrand} strokeWidth={2.5} />}
        </Waves>
        <View style={{ gap: 8, alignItems: 'center' }}>
          <T size={24} weight="700" style={{ textAlign: 'center' }} accessibilityRole="header">{isOpen ? 'Taquilla abierta' : 'Acerca el móvil a la cerradura'}</T>
          <T size={15} color="secondary" style={{ textAlign: 'center' }}>
            {isOpen ? `Taquilla ${lockerNo} · Ya puedes guardar tus cosas` : `Taquilla ${lockerNo} · Cerrada`}
          </T>
        </View>
        <View accessible accessibilityLiveRegion="polite" style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: phase === 'error' ? colors.danger : colors.divider, backgroundColor: colors.card, maxWidth: '100%' }}>
          {isOpen ? <LockOpen size={16} color={colors.brand} /> : <Lock size={16} color={phase === 'error' ? colors.danger : colors.brand} />}
          <T size={13} weight="500" style={{ flexShrink: 1 }}>{isOpen ? 'Abierta' : phase === 'error' ? error : 'Esperando la cerradura…'}</T>
        </View>
      </View>
      <View style={{ flex: 1 }} />
      <BottomActions>
        {showSimulate ? <Button variant="secondary" label="Simular cerradura" onPress={simulate} /> : null}
        {phase === 'error' && status === 'ready' ? <Button variant="secondary" label="Reintentar" onPress={read} /> : null}
        {isOpen ? <Button label="Hecho" onPress={close} /> : <Button variant="secondary" label="Cancelar" onPress={close} />}
      </BottomActions>
    </SafeAreaView>
  );
}
