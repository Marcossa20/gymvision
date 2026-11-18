// Iniciar sesión (Figma 2023:2) — cuenta local simulada.
// Teoría (RNF3): mensaje de error claro sin borrar lo escrito; vibración de error + aviso visual (Reto 3).
// Teoría (reconocimiento): enlaces visibles a «¿Has olvidado tu contraseña?» y «Crear cuenta».
import React, { useRef, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, View, type TextInputInstance } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Lock, Mail } from 'lucide-react-native';
import { Button, T } from '../../components/ui';
import { notify } from '../../services/alerts';
import { useAuth } from '../../store/auth';
import { useProfile } from '../../store/profile';
import { useTheme } from '../../theme/useTheme';
import { Field, FormError } from './ui';

export function LoginScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(params.email ?? '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const passRef = useRef<TextInputInstance>(null);

  const submit = () => {
    if (!email.trim() || !password) {
      setError('Escribe tu correo y tu contraseña.');
      return notify('error', 'Faltan datos');
    }
    const acc = useAuth.getState().login(email, password);
    if (!acc) {
      setError('Correo o contraseña incorrectos. Revisa los datos o recupera tu contraseña.');
      return notify('error', 'No se pudo iniciar sesión');
    }
    // El perfil muestra los datos de la cuenta con la que se entra.
    const p = useProfile.getState();
    if (p.username !== acc.username) p.set({ name: acc.name, username: acc.username });
    notify('serie', `Hola, ${acc.name.split(' ')[0]}`);
    router.replace('/entrenar' as never);
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20 }} keyboardShouldPersistTaps="handled">
          <View style={{ alignItems: 'center', gap: 14, paddingTop: 52, paddingBottom: 28 }}>
            <View style={{ width: 200, height: 140, overflow: 'hidden' }}>
              <Image source={require('../../../assets/brand/logo.png')} style={{ position: 'absolute', left: -15.66, top: -45.66, width: 231.3, height: 231.3 }} resizeMode="cover" accessibilityIgnoresInvertColors />
            </View>
            <T size={32} weight="700" accessibilityRole="header">GymVision</T>
          </View>
          <T size={24} weight="700" style={{ paddingBottom: 18 }}>Inicia sesión</T>
          <View style={{ gap: 16 }}>
            {error ? <FormError message={error} /> : null}
            <Field
              label="Correo electrónico" icon={Mail} placeholder="tu@correo.com" value={email}
              onChangeText={(t) => { setEmail(t); setError(null); }}
              keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress"
              returnKeyType="next" onSubmitEditing={() => passRef.current?.focus()}
            />
            <Field
              ref={passRef} label="Contraseña" icon={Lock} placeholder="Introduce tu contraseña" secure value={password}
              onChangeText={(t) => { setPassword(t); setError(null); }}
              autoCapitalize="none" autoComplete="password" textContentType="password" returnKeyType="go" onSubmitEditing={submit}
            />
            <Pressable onPress={() => router.push({ pathname: '/auth/forgot', params: { email } } as never)} accessibilityRole="link" style={{ alignSelf: 'flex-end', minHeight: 44, justifyContent: 'center' }}>
              <T size={14} weight="600" color="brand">¿Has olvidado tu contraseña?</T>
            </Pressable>
          </View>
          <View style={{ paddingTop: 10 }}>
            <Button label="Iniciar sesión" onPress={submit} style={{ borderRadius: 16 }} />
          </View>
          <View style={{ flex: 1, minHeight: 24 }} />
          <Pressable onPress={() => router.push('/auth/register' as never)} accessibilityRole="link" accessibilityLabel="¿Aún no tienes cuenta? Crear cuenta" style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, minHeight: 48, alignItems: 'center', marginBottom: 24 }}>
            <T size={14.5} color="secondary">¿Aún no tienes cuenta?</T>
            <T size={14.5} weight="700" color="brand">Crear cuenta</T>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
