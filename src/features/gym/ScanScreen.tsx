// Escanear máquina (Figma 2046:145) — RF4.
// Teoría (El Ordenador, cámara): reconocimiento antes que recuerdo — apuntar a la máquina en vez de buscarla.
// Háptica + aviso visual al leer (feedback sin mirar). Alternativa si el QR falla: código manual (tolerancia a errores).
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Keyboard, QrCode } from 'lucide-react-native';
import { Button, T } from '../../components/ui';
import { notify } from '../../services/alerts';
import { createScanGuard, lookupMachine } from '../../services/qr';
import { useTheme } from '../../theme/useTheme';
import { alpha, BottomActions, ScreenBar } from './ui';
import { useTranslation } from 'react-i18next';

const FRAME = 260;
const CORNER = 56;

function Corner({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) {
  const { colors } = useTheme();
  const top = pos[0] === 't';
  const left = pos[1] === 'l';
  return (
    <View
      style={{
        position: 'absolute', width: CORNER, height: CORNER, borderColor: colors.brand,
        [top ? 'top' : 'bottom']: 0, [left ? 'left' : 'right']: 0,
        [top ? 'borderTopWidth' : 'borderBottomWidth']: 5, [left ? 'borderLeftWidth' : 'borderRightWidth']: 5,
        [`border${top ? 'Top' : 'Bottom'}${left ? 'Left' : 'Right'}Radius`]: 18,
      }}
    />
  );
}

export function ScanScreen() {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const focused = useIsFocused();
  const [permission, requestPermission] = useCameraPermissions();
  const [hint, setHint] = useState<string | null>(null);
  const guard = useRef(createScanGuard());
  const handled = useRef(false);
  const line = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) void requestPermission();
  }, [permission, requestPermission]);

  useEffect(() => {
    const anim = Animated.loop(Animated.sequence([
      Animated.timing(line, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.timing(line, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
    ]));
    anim.start();
    return () => anim.stop();
  }, [line]);

  useEffect(() => { if (focused) handled.current = false; }, [focused]);

  const onScan = (data: string) => {
    if (handled.current || !guard.current(data)) return;
    const r = lookupMachine(data);
    if (r.ok) {
      handled.current = true;
      notify('qr', t('Código {{code}} reconocido', { code: r.code }));
      router.replace(`/gym/machine/${r.code}` as never);
    } else if (r.reason === 'not-found') {
      handled.current = true;
      notify('error', t('{{code}}: máquina no encontrada', { code: r.code }));
      router.replace({ pathname: '/gym/manual', params: { code: r.code ?? '', error: '1' } } as never);
    } else {
      notify('error', t('Este QR no es de una máquina'));
      setHint(t('Este QR no es de una máquina. Busca el que tiene el código PB-0000.'));
    }
  };

  const granted = !!permission?.granted;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {granted && focused ? (
        <>
          <CameraView style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} facing="back" barcodeScannerSettings={{ barcodeTypes: ['qr'] }} onBarcodeScanned={({ data }) => onScan(data)} />
          {/* Velo del color de fondo: el texto se lee sobre cualquier imagen de cámara (contraste, Reto 2) */}
          <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: alpha(colors.bg, 0.35) }} />
        </>
      ) : null}
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <ScreenBar title={t('Escanear máquina')} />
        <View style={{ alignItems: 'center', paddingTop: 56, paddingHorizontal: 20, gap: 28 }}>
          <View style={{ width: FRAME, height: FRAME, alignItems: 'center', justifyContent: 'center' }} accessible accessibilityLabel={t('Marco de escaneo')}>
            <Corner pos="tl" /><Corner pos="tr" /><Corner pos="bl" /><Corner pos="br" />
            {!granted ? <QrCode size={92} color={colors.textSecondary} strokeWidth={1.5} /> : null}
            <Animated.View
              style={{
                position: 'absolute', left: 20, top: 40, width: FRAME - 40, height: 3, borderRadius: 2, backgroundColor: colors.brand,
                shadowColor: colors.brand, shadowOpacity: 0.8, shadowRadius: 10, shadowOffset: { width: 0, height: 0 }, elevation: 6,
                transform: [{ translateY: line.interpolate({ inputRange: [0, 1], outputRange: [0, FRAME - 80] }) }],
              }}
            />
          </View>
          <View style={{ gap: 6, alignItems: 'center' }}>
            <T size={22} weight="700" style={{ textAlign: 'center' }}>{t('Apunta al código QR')}</T>
            <T size={14} color="secondary" style={{ textAlign: 'center' }}>
              {hint ?? (permission && !granted ? t('Sin permiso de cámara: usa el código manual.') : t('Lo encontrarás en la máquina. Vibrará al leerlo.'))}
            </T>
          </View>
          {permission && !granted ? <Button variant="secondary" label={t('Permitir cámara')} onPress={() => void requestPermission()} style={{ alignSelf: 'stretch' }} /> : null}
        </View>
        <View style={{ flex: 1 }} />
        <BottomActions>
          <Button variant="secondary" label={t('Código manual')} onPress={() => router.replace('/gym/manual' as never)} icon={<Keyboard size={22} color={colors.textPrimary} />} style={{ flexDirection: 'row-reverse', borderWidth: 0 }} />
        </BottomActions>
      </SafeAreaView>
    </View>
  );
}
