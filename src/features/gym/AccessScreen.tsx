// Mi QR de acceso (Figma 2049:29).
// Teoría (El Ordenador, pantalla como salida): brillo al máximo mientras se enseña el QR para que el lector
// del torno lo lea a la primera; el QR va siempre negro sobre blanco (máximo contraste) en cualquier tema.
// Visibilidad del estado: cuenta atrás + barra de la renovación cada 30 s. Funciona sin conexión.
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Brightness from 'expo-brightness';
import QRCode from 'qrcode';
import Svg, { Path } from 'react-native-svg';
import { RefreshCw, Sun, WifiOff } from 'lucide-react-native';
import { Button, T } from '../../components/ui';
import { useProfile } from '../../store/profile';
import { useTheme } from '../../theme/useTheme';
import { accessPayload, ROTATE_MS } from './accessToken';
import { useGym } from './store';
import { BottomActions, ScreenBar } from './ui';
import { useTranslation } from 'react-i18next';

// Colores fijos del código QR: deben ser negro/blanco para cualquier lector, no dependen del tema.
const QR_DARK = '#000000';
const QR_LIGHT = '#FFFFFF';

function QrMatrix({ value, size }: { value: string; size: number }) {
  const { d, n } = useMemo(() => {
    const qr = QRCode.create(value, { errorCorrectionLevel: 'M' });
    const count = qr.modules.size;
    let path = '';
    for (let r = 0; r < count; r++) for (let c = 0; c < count; c++) if (qr.modules.get(r, c)) path += `M${c} ${r}h1v1h-1z`;
    return { d: path, n: count };
  }, [value]);
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${n} ${n}`}>
      <Path d={d} fill={QR_DARK} />
    </Svg>
  );
}

function Chip({ icon, label }: { icon: React.ReactNode; label: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: colors.divider, backgroundColor: colors.card }}>
      {icon}
      <T size={12} weight="500" color="secondary">{label}</T>
    </View>
  );
}

export function AccessScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const name = useProfile((s) => s.name);
  const { memberNo, memberSecret, gymName } = useGym();
  const [now, setNow] = useState(Date.now());
  const [bright, setBright] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  // Brillo al máximo solo en esta pantalla; se restaura al salir.
  useEffect(() => {
    let prev: number | null = null;
    void (async () => {
      try {
        prev = await Brightness.getBrightnessAsync();
        await Brightness.setBrightnessAsync(1);
        setBright(true);
      } catch {
        // sin módulo nativo (Expo Go/web): se ignora
      }
    })();
    return () => { if (prev !== null) void Brightness.setBrightnessAsync(prev).catch(() => {}); };
  }, []);

  const { payload, msLeft } = accessPayload(memberNo, memberSecret, now);
  const secs = Math.ceil(msLeft / 1000);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenBar title={t('Mi acceso')} />
      <ScrollView contentContainerStyle={{ alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, gap: 20 }}>
        <View style={{ alignItems: 'center', gap: 4 }}>
          <T size={24} weight="700" style={{ textAlign: 'center' }}>{name}</T>
          <T size={14} color="secondary" style={{ textAlign: 'center' }}>{t('Socio nº {{n}}', { n: memberNo })} · {t(gymName)}</T>
        </View>
        <View accessible accessibilityRole="image" accessibilityLabel={t('Código QR de acceso del socio {{n}}', { n: memberNo })} style={{ width: 300, height: 300, borderRadius: 28, backgroundColor: QR_LIGHT, alignItems: 'center', justifyContent: 'center' }}>
          <QrMatrix value={payload} size={240} />
        </View>
        <View style={{ width: 300, gap: 10, alignItems: 'center' }}>
          <View accessible accessibilityLabel={t('Se renueva en {{n}} segundos', { n: secs })} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <RefreshCw size={18} color={colors.brand} />
            <T size={15} weight="600">{t('Se renueva en {{time}}', { time: `0:${String(secs).padStart(2, '0')}` })}</T>
          </View>
          <View style={{ width: 300, height: 6, borderRadius: 3, backgroundColor: colors.switchOff, overflow: 'hidden' }}>
            <View style={{ width: `${(msLeft / ROTATE_MS) * 100}%`, height: '100%', borderRadius: 3, backgroundColor: colors.brand }} />
          </View>
        </View>
        <View style={{ alignItems: 'center', gap: 8 }}>
          <T size={17} weight="600" style={{ textAlign: 'center' }}>{t('Acerca el QR al lector del torno')}</T>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 14 }}>
            <Chip icon={<WifiOff size={14} color={colors.textSecondary} />} label={t('Funciona sin conexión')} />
            {bright ? <Chip icon={<Sun size={14} color={colors.textSecondary} />} label={t('Brillo al máximo')} /> : null}
          </View>
        </View>
      </ScrollView>
      <BottomActions>
        <Button variant="secondary" label={t('Cerrar')} onPress={() => (router.canGoBack() ? router.back() : router.replace('/gimnasio' as never))} />
      </BottomActions>
    </SafeAreaView>
  );
}
