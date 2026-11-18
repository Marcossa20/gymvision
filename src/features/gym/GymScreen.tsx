// Mi gimnasio (Figma 2046:2).
// Teoría: una acción principal por tarjeta (RNF1) y tarjetas agrupadas por tarea (Gestalt: proximidad);
// la tarea más frecuente al llegar (entrar por el torno) va arriba y destacada con borde de marca.
import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronRight, DoorOpen, Lock, LockOpen, Nfc, Pencil, QrCode, WifiOff } from 'lucide-react-native';
import { Button, Card, T } from '../../components/ui';
import { notify } from '../../services/alerts';
import { useTheme } from '../../theme/useTheme';
import { Header } from '../workout/EntrenarScreen';
import { useGym, useLockerState } from './store';
import { IconTile } from './ui';

export function GymScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const gymName = useGym((s) => s.gymName);
  const lockerNo = useGym((s) => s.lockerNo);
  const locker = useLockerState();
  const cardStyle = { padding: 18, gap: 14, borderRadius: 24 };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24, gap: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ gap: 2, flex: 1 }}>
            <T size={26} weight="700" accessibilityRole="header">Mi gimnasio</T>
            <T size={14} color="secondary">{gymName}</T>
          </View>
          {/* Sin pantalla de edición en Figma: de momento solo hay un gimnasio. */}
          <Pressable accessibilityRole="button" accessibilityLabel="Editar gimnasio" onPress={() => notify('info', 'De momento solo puedes usar Gimnasio Centro')} style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' }}>
            <Pencil size={20} color={colors.textPrimary} />
          </Pressable>
        </View>

        {/* Acceso con QR personal (destacada) */}
        <Card style={[cardStyle, { borderColor: colors.brand, borderWidth: 1.5 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <IconTile><DoorOpen size={28} color={colors.brand} /></IconTile>
            <View style={{ flex: 1, gap: 2 }}>
              <T size={20} weight="700">Entrar al gimnasio</T>
              <T size={13} color="secondary">Enseña tu QR personal en el torno</T>
            </View>
          </View>
          <Button label="Mostrar mi QR" onPress={() => router.push('/gym/access' as never)} icon={<QrCode size={22} color={colors.onBrand} />} style={{ flexDirection: 'row-reverse' }} />
        </Card>

        {/* Mi taquilla */}
        <Card style={cardStyle}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <IconTile>{locker === 'open' ? <LockOpen size={28} color={colors.brand} /> : <Lock size={28} color={colors.brand} />}</IconTile>
            <View style={{ flex: 1, gap: 2 }}>
              <T size={20} weight="700">Taquilla {lockerNo}</T>
              <View accessible accessibilityLabel={`Estado: ${locker === 'open' ? 'abierta' : 'cerrada'}`} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                {locker === 'open' ? <LockOpen size={14} color={colors.textSecondary} /> : <Lock size={14} color={colors.textSecondary} />}
                <T size={14} weight="500" color="secondary">{locker === 'open' ? 'Abierta' : 'Cerrada'}</T>
              </View>
            </View>
          </View>
          <Button label="Abrir con NFC" onPress={() => router.push('/gym/locker' as never)} icon={<Nfc size={22} color={colors.onBrand} />} style={{ flexDirection: 'row-reverse' }} />
        </Card>

        {/* Escanear máquina */}
        <Card style={[cardStyle, { flexDirection: 'row', alignItems: 'center' }]} onPress={() => router.push('/gym/scan' as never)} accessibilityLabel="Escanear máquina. Abre el ejercicio y tus series al leer su QR">
          <IconTile><QrCode size={28} color={colors.brand} /></IconTile>
          <View style={{ flex: 1, gap: 2 }}>
            <T size={18} weight="700">Escanear máquina</T>
            <T size={13} color="secondary">Abre el ejercicio y tus series al leer su QR</T>
          </View>
          <ChevronRight size={22} color={colors.textSecondary} />
        </Card>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <WifiOff size={14} color={colors.textSecondary} />
          <T size={12} color="secondary">Todo funciona sin conexión</T>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
