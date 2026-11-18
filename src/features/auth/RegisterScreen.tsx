// Crear cuenta (Figma 2023:44) — cuenta local simulada, guardada solo en el móvil.
// Teoría (RNF3, prevención de errores): requisitos visibles antes de escribir; cada error junto a su campo;
// el foco salta al primer campo con error. Casilla con check (forma) además del color.
import React, { useRef, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, View, type TextInputInstance } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, AtSign, Check, Lock, Mail, User } from 'lucide-react-native';
import { Button, T } from '../../components/ui';
import { notify } from '../../services/alerts';
import { EMAIL_RE, passwordRules, useAuth, USERNAME_RE } from '../../store/auth';
import { useProfile } from '../../store/profile';
import { useTheme } from '../../theme/useTheme';
import { Field } from './ui';

type Errors = Partial<Record<'name' | 'username' | 'email' | 'password' | 'terms', string>>;

export function RegisterScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [f, setF] = useState({ name: '', username: '', email: '', password: '' });
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const refs = { name: useRef<TextInputInstance>(null), username: useRef<TextInputInstance>(null), email: useRef<TextInputInstance>(null), password: useRef<TextInputInstance>(null) };
  const up = (k: keyof typeof f) => (t: string) => { setF((s) => ({ ...s, [k]: t })); setErrors((e) => ({ ...e, [k]: undefined })); };

  const submit = () => {
    const username = f.username.trim().replace(/^@/, '').toLowerCase();
    const r = passwordRules(f.password);
    const e: Errors = {};
    if (!f.name.trim()) e.name = 'Escribe tu nombre.';
    if (!USERNAME_RE.test(username)) e.username = 'De 3 a 20 caracteres: letras, números, punto o guion bajo.';
    if (!EMAIL_RE.test(f.email.trim())) e.email = 'Escribe un correo válido, por ejemplo tu@correo.com.';
    if (!r.length || !r.lettersAndNumbers) e.password = 'Usa al menos 8 caracteres, con letras y números.';
    if (!terms) e.terms = 'Acepta los términos para continuar.';
    if (!Object.keys(e).length) {
      const res = useAuth.getState().register({ name: f.name, username, email: f.email, password: f.password });
      if (!res.ok) e[res.field] = res.message;
      else {
        useProfile.getState().set({ name: f.name.trim(), username });
        notify('serie', 'Cuenta creada');
        router.replace('/entrenar' as never);
        return;
      }
    }
    setErrors(e);
    notify('error', 'Revisa los campos marcados');
    const first = (['name', 'username', 'email', 'password'] as const).find((k) => e[k]);
    if (first) refs[first].current?.focus();
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 }}>
          <Pressable accessibilityRole="button" accessibilityLabel="Volver" onPress={() => (router.canGoBack() ? router.back() : router.replace('/auth/login' as never))} style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}>
            <ArrowLeft size={24} color={colors.textPrimary} />
          </Pressable>
          <T size={18} weight="700" style={{ flex: 1, textAlign: 'center' }} accessibilityRole="header">Crear cuenta</T>
          <View style={{ width: 48 }} />
        </View>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20 }} keyboardShouldPersistTaps="handled">
          <View style={{ gap: 8, paddingTop: 14, paddingBottom: 22 }}>
            <View style={{ width: 110, height: 77, overflow: 'hidden' }}>
              <Image source={require('../../../assets/brand/logo.png')} style={{ position: 'absolute', left: -8.61, top: -25.11, width: 127.2, height: 127.2 }} resizeMode="cover" accessibilityIgnoresInvertColors />
            </View>
            <T size={24} weight="700">Empieza a entrenar</T>
            <T size={14.5} color="secondary">Crea tu cuenta para guardar tus rutinas y tu progreso.</T>
          </View>
          <View style={{ gap: 16 }}>
            <Field ref={refs.name} label="Nombre" icon={User} placeholder="Tu nombre" value={f.name} onChangeText={up('name')} error={errors.name} autoComplete="name" textContentType="name" returnKeyType="next" onSubmitEditing={() => refs.username.current?.focus()} />
            <Field ref={refs.username} label="Nombre de usuario" icon={AtSign} placeholder="@usuario" value={f.username} onChangeText={up('username')} error={errors.username} autoCapitalize="none" autoCorrect={false} returnKeyType="next" onSubmitEditing={() => refs.email.current?.focus()} />
            <Field ref={refs.email} label="Correo electrónico" icon={Mail} placeholder="tu@correo.com" value={f.email} onChangeText={up('email')} error={errors.email} keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" returnKeyType="next" onSubmitEditing={() => refs.password.current?.focus()} />
            <Field ref={refs.password} label="Contraseña" icon={Lock} placeholder="Mínimo 8 caracteres" secure value={f.password} onChangeText={up('password')} error={errors.password} hint="Usa al menos 8 caracteres, con letras y números." autoCapitalize="none" autoComplete="new-password" textContentType="newPassword" returnKeyType="done" />
          </View>
          <Pressable
            onPress={() => { setTerms((t) => !t); setErrors((e) => ({ ...e, terms: undefined })); }}
            accessibilityRole="checkbox" accessibilityState={{ checked: terms }}
            style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingTop: 18, minHeight: 48 }}
          >
            <View style={{ width: 24, height: 24, borderRadius: 7, borderWidth: 2, borderColor: errors.terms ? colors.danger : terms ? colors.brand : colors.radioOff, backgroundColor: terms ? colors.brand : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
              {terms ? <Check size={16} color={colors.onBrand} strokeWidth={3} /> : null}
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <T size={13.5} color="secondary">Acepto los términos de uso y la política de privacidad.</T>
              {errors.terms ? <T size={12.5} color={colors.danger}>{errors.terms}</T> : null}
            </View>
          </Pressable>
          <View style={{ paddingTop: 22 }}>
            <Button label="Crear cuenta" onPress={submit} style={{ borderRadius: 16 }} />
          </View>
          <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/auth/login' as never))} accessibilityRole="link" accessibilityLabel="¿Ya tienes cuenta? Iniciar sesión" style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, paddingTop: 22, paddingBottom: 40, minHeight: 48 }}>
            <T size={14.5} color="secondary">¿Ya tienes cuenta?</T>
            <T size={14.5} weight="700" color="brand">Iniciar sesión</T>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
