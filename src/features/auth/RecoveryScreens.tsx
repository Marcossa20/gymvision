// Recuperar contraseña (Figma 2063:183), Correo enviado (2063:211) y Nueva contraseña (2073:33).
// Simulación sin servidor: «Enviar enlace» guarda la petición en el móvil y el «enlace» se abre tocando el sobre.
// Teoría (privacidad/seguridad): no se revela si el correo tiene cuenta. Teoría (RNF3): requisitos de la
// contraseña visibles y comprobados en vivo (check + texto), y fuerza con barra + palabra (no solo color).
import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Lock, Mail } from 'lucide-react-native';
import { Button, T } from '../../components/ui';
import { notify } from '../../services/alerts';
import { EMAIL_RE, passwordRules, passwordStrength, useAuth } from '../../store/auth';
import { useTheme } from '../../theme/useTheme';
import { alpha, BottomActions } from '../gym/ui';
import { Field, Rule } from './ui';
import { useTranslation } from 'react-i18next';

function IconBubble({ Icon, size = 64, solid }: { Icon: typeof Mail; size?: number; solid?: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: solid ? colors.brand : alpha(colors.brand, 0.14), alignItems: 'center', justifyContent: 'center' }}>
      <Icon size={size / 2} color={solid ? colors.onBrand : colors.brand} />
    </View>
  );
}

export function ForgotScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(params.email ?? '');
  const [error, setError] = useState<string | null>(null);

  const send = () => {
    if (!EMAIL_RE.test(email.trim())) {
      setError(t('Escribe un correo válido, por ejemplo tu@correo.com.'));
      return notify('error', t('Correo no válido'));
    }
    useAuth.getState().requestReset(email);
    router.replace('/auth/sent' as never);
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingVertical: 12, gap: 16 }} keyboardShouldPersistTaps="handled">
          <Pressable accessibilityRole="button" accessibilityLabel={t('Volver')} onPress={() => (router.canGoBack() ? router.back() : router.replace('/auth/login' as never))} style={{ width: 48, height: 48, marginLeft: -12, alignItems: 'center', justifyContent: 'center' }}>
            <ChevronLeft size={24} color={colors.textPrimary} />
          </Pressable>
          <IconBubble Icon={Mail} />
          <T size={26} weight="700" accessibilityRole="header">{t('¿Olvidaste tu contraseña?')}</T>
          <T size={15} color="secondary">{t('Escribe el correo de tu cuenta y te enviaremos un enlace para crear una contraseña nueva.')}</T>
          <Field label={t('Correo electrónico')} icon={Mail} radius={16} placeholder={t('tu@correo.com')} value={email} onChangeText={(v) => { setEmail(v); setError(null); }} error={error} keyboardType="email-address" autoCapitalize="none" autoComplete="email" returnKeyType="send" onSubmitEditing={send} />
          <View style={{ flex: 1 }} />
        </ScrollView>
        <BottomActions style={{ paddingBottom: 16 }}>
          <Button label={t('Enviar enlace')} onPress={send} />
        </BottomActions>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function SentScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const reset = useAuth((s) => s.reset);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const resend = () => {
    if (!reset) return router.replace('/auth/forgot' as never);
    useAuth.getState().requestReset(reset.email);
    setCooldown(30);
    notify('info', t('Correo reenviado a {{email}}', { email: reset.email }));
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ flex: 1, alignItems: 'center', paddingHorizontal: 20, paddingTop: 122, gap: 18 }}>
        {/* Simulación: tocar el sobre equivale a abrir el enlace del correo */}
        <Pressable onPress={() => router.push('/auth/new-password' as never)} accessibilityRole="link" accessibilityLabel={t('Abrir el enlace del correo (simulado)')} hitSlop={8}>
          <IconBubble Icon={Mail} size={88} solid />
        </Pressable>
        <T size={26} weight="700" style={{ textAlign: 'center' }} accessibilityRole="header">{t('Revisa tu correo')}</T>
        <T size={15} color="secondary" style={{ textAlign: 'center' }}>{t('Hemos enviado un enlace a {{email}}. Caduca en 30 minutos.', { email: reset?.email ?? t('tu correo') })}</T>
        {__DEV__ ? <T size={12} color="secondary" style={{ textAlign: 'center' }}>{t('Demo: toca el sobre para abrir el enlace.')}</T> : null}
      </View>
      <BottomActions style={{ paddingBottom: 16 }}>
        <Button label={t('Volver a iniciar sesión')} onPress={() => router.replace({ pathname: '/auth/login', params: { email: reset?.email ?? '' } } as never)} />
        <Button variant="secondary" label={cooldown > 0 ? t('Reenviar correo ({{n}} s)', { n: cooldown }) : t('Reenviar correo')} onPress={resend} disabled={cooldown > 0} />
      </BottomActions>
    </SafeAreaView>
  );
}

const STRENGTH = ['Muy débil', 'Débil', 'Mejorable', 'Segura', 'Muy segura'];

export function NewPasswordScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const reset = useAuth((s) => s.reset);
  const [p, setP] = useState('');
  const [r, setR] = useState('');
  const rules = passwordRules(p, r);
  const ok = rules.length && rules.upperAndNumber && rules.match;
  const strength = passwordStrength(p);
  const expired = !reset || Date.now() > reset.expiresAt;

  const save = () => {
    if (expired) {
      notify('error', t('El enlace ha caducado. Pide uno nuevo.'));
      return router.replace('/auth/forgot' as never);
    }
    if (!ok) return notify('error', t('La contraseña no cumple los requisitos'));
    const email = reset!.email;
    useAuth.getState().setNewPassword(p);
    notify('serie', t('Contraseña guardada'));
    router.replace({ pathname: '/auth/login', params: { email } } as never);
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingTop: 28, gap: 16 }} keyboardShouldPersistTaps="handled">
          <IconBubble Icon={Lock} />
          <T size={26} weight="700" accessibilityRole="header">{t('Crea tu nueva contraseña')}</T>
          <T size={15} color="secondary">{t('Elige una contraseña segura que no uses en otras cuentas.')}</T>
          <Field label={t('Nueva contraseña')} icon={Lock} radius={16} secure value={p} onChangeText={setP} autoCapitalize="none" autoComplete="new-password" textContentType="newPassword" />
          <Field label={t('Repite la contraseña')} icon={Lock} radius={16} secure value={r} onChangeText={setR} autoCapitalize="none" textContentType="newPassword" returnKeyType="done" onSubmitEditing={save} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }} accessible accessibilityLabel={`${t('Fuerza de la contraseña')}: ${t(STRENGTH[strength])}`}>
            <View style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: colors.divider, overflow: 'hidden' }}>
              <View style={{ width: `${(strength / 4) * 100}%`, height: '100%', borderRadius: 3, backgroundColor: strength >= 3 ? colors.brand : strength >= 2 ? colors.textSecondary : colors.danger }} />
            </View>
            <T size={13} weight="600" color={strength >= 3 ? 'brand' : strength >= 2 ? 'secondary' : colors.danger}>{p ? t(STRENGTH[strength]) : ' '}</T>
          </View>
          <View style={{ gap: 8 }}>
            <Rule ok={rules.length} label={t('Mínimo 8 caracteres')} />
            <Rule ok={rules.upperAndNumber} label={t('Una mayúscula y un número')} />
            <Rule ok={rules.match} label={t('Las dos contraseñas coinciden')} />
          </View>
          <View style={{ flex: 1 }} />
        </ScrollView>
        <BottomActions style={{ paddingBottom: 16 }}>
          <Button label={t('Guardar contraseña')} onPress={save} disabled={!ok} />
        </BottomActions>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
