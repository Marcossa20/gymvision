// Teoría (RNF3, tolerancia a errores): cerrar sesión es reversible (se vuelve a entrar); eliminar la cuenta es permanente
// y por eso va aparte, en rojo, con texto de aviso y confirmación explícita. El color rojo siempre lleva icono y texto.
import React, { useState } from 'react';
import { Linking, Modal, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight, Lock, LogOut, Mail, SlidersHorizontal, Trash2 } from 'lucide-react-native';
import { Button, Row, T } from '../../components/ui';
import { notify } from '../../services/alerts';
import { useTheme } from '../../theme/useTheme';
import { authApi, maskEmail, useCurrentEmail } from './authApi';
import { Section, SettingsScreen } from './SettingsLayout';
import { useTranslation } from 'react-i18next';

export function AccountScreen() {
  const { t } = useTranslation();
  const { colors, highContrast } = useTheme();
  const router = useRouter();
  const email = useCurrentEmail();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const icon = (I: typeof Mail) => <I size={22} color={colors.brand} />;
  const chev = <ChevronRight size={18} color={colors.textSecondary} />;

  const cambiarPassword = () => {
    const api = authApi();
    if (!email || !api.requestReset) return notify('info', t('Cambiar contraseña estará disponible al conectar el login'));
    api.requestReset(email); // recuperación simulada: reutiliza la pantalla «Nueva contraseña»
    router.push('/auth/new-password' as never);
  };

  const cerrarSesion = () => {
    const api = authApi();
    if (!api.logout) return notify('info', t('Cerrar sesión estará disponible al conectar el login'));
    api.logout(); // el layout raíz redirige a /auth/login cuando loggedIn pasa a false
  };

  const eliminar = () => {
    setConfirmDelete(false);
    const api = authApi();
    if (!api.deleteAccount) return notify('info', t('Eliminar cuenta: pendiente de conectar con el login'));
    api.deleteAccount();
  };

  return (
    <SettingsScreen title={t('Cuenta y seguridad')}>
      <Section label={t('CREDENCIALES')}>
        <Row icon={icon(Mail)} label={t('Correo electrónico')} value={maskEmail(email)} />
        <Row icon={icon(Lock)} label={t('Cambiar contraseña')} right={chev} onPress={cambiarPassword} last />
      </Section>

      <Section label={t('PRIVACIDAD Y PERMISOS')}>
        <Pressable accessibilityRole="button" accessibilityLabel={t('Permisos de la app. Cámara, NFC y sensor de movimiento')} onPress={() => void Linking.openSettings()}
          style={{ minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14 }}>
          <SlidersHorizontal size={22} color={colors.brand} />
          <View style={{ flex: 1, gap: 2 }}>
            <T size={15} weight="600">{t('Permisos de la app')}</T>
            <T size={12.5} color="secondary">{t('Cámara, NFC y sensor de movimiento')}</T>
          </View>
          {chev}
        </Pressable>
      </Section>

      <Section label={t('ZONA PELIGROSA')}>
        <Pressable accessibilityRole="button" accessibilityLabel={t('Cerrar sesión')} onPress={cerrarSesion}
          style={{ minHeight: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14 }}>
          <LogOut size={22} color={colors.brand} /><T size={15} weight="600">{t('Cerrar sesión')}</T>
        </Pressable>
      </Section>

      <View style={{ paddingTop: 8, gap: 8 }}>
        <Pressable accessibilityRole="button" accessibilityLabel={t('Eliminar cuenta')} onPress={() => setConfirmDelete(true)}
          style={{ minHeight: 56, borderRadius: 16, backgroundColor: colors.card, borderWidth: highContrast ? 2 : 1.5, borderColor: highContrast ? colors.danger : 'rgba(255,90,95,0.5)', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <Trash2 size={22} color={colors.danger} /><T size={15} weight="600" color={colors.danger}>{t('Eliminar cuenta')}</T>
        </Pressable>
        <T size={12.5} color="secondary" style={{ paddingHorizontal: 4 }}>{t('Eliminar la cuenta es permanente. Te pediremos confirmar antes de borrarla.')}</T>
      </View>

      <Modal transparent animationType="fade" visible={confirmDelete} onRequestClose={() => setConfirmDelete(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', padding: 24 }}>
          <View style={{ backgroundColor: colors.card, borderRadius: 24, padding: 20, gap: 12 }}>
            <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,107,122,0.15)', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={22} color={colors.danger} /></View>
            <T size={20} weight="700" accessibilityRole="header">{t('¿Eliminar tu cuenta?')}</T>
            <T size={15} color="secondary">{t('Se borrará de este móvil y no se puede deshacer.')}</T>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button label={t('Cancelar')} variant="secondary" onPress={() => setConfirmDelete(false)} style={{ flex: 1 }} />
              <Button label={t('Eliminar')} variant="danger" onPress={eliminar} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>
    </SettingsScreen>
  );
}
