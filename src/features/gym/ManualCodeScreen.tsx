// Código manual (Figma 2047:2) + estado de error «Código no válido» (Figma 2063:360).
// Teoría (La Persona, errores — RNF3): alternativa cuando el QR falla; el error dice qué pasó y cómo seguir
// (icono + texto + borde, no solo color) y ofrece volver a escanear. El formato se normaliza (pb0142 → PB-0142).
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AlertCircle, QrCode, Search } from 'lucide-react-native';
import { Button, Card, T } from '../../components/ui';
import { notify } from '../../services/alerts';
import { lookupMachine } from '../../services/qr';
import { useTheme } from '../../theme/useTheme';
import { alpha, BottomActions, IconTile, ScreenBar } from './ui';
import { useTranslation } from 'react-i18next';

const ERRORS = {
  'not-found': 'No encontramos ninguna máquina con ese código. Revisa la etiqueta e inténtalo de nuevo.',
  format: 'El código tiene 2 letras, un guion y 4 cifras (por ejemplo PB-0142).',
  empty: 'Escribe el código impreso debajo del QR.',
} as const;

export function ManualCodeScreen() {
  const { t } = useTranslation();
  const { colors, fs } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ code?: string; error?: string }>();
  const [code, setCode] = useState(params.code ?? '');
  const [error, setError] = useState<keyof typeof ERRORS | null>(params.error ? 'not-found' : null);
  const [focused, setFocused] = useState(false);

  const search = () => {
    if (!code.trim()) return setError('empty');
    const r = lookupMachine(code);
    if (r.ok) {
      setError(null);
      notify('qr', t('Código {{code}} reconocido', { code: r.code }));
      router.replace(`/gym/machine/${r.code}` as never);
    } else {
      setError(r.reason);
      notify('error', r.reason === 'format' ? t('Formato de código no válido') : t('Código no válido'));
    }
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScreenBar title={t('Código manual')} />
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 28, gap: 20 }} keyboardShouldPersistTaps="handled">
          <View style={{ gap: 6 }}>
            <T size={24} weight="700" accessibilityRole="header">{t('Introduce el código de la máquina')}</T>
            <T size={15} color="secondary">{t('Úsalo cuando el QR esté dañado o no se pueda leer.')}</T>
          </View>

          <View style={{ gap: 8 }}>
            <T size={14} weight="500" color="secondary">{t('Código de la máquina')}</T>
            <TextInput
              value={code}
              onChangeText={(v) => { setCode(v.toUpperCase()); if (error) setError(null); }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onSubmitEditing={search}
              placeholder="PB-0142"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="characters"
              autoCorrect={false}
              autoFocus={!params.error}
              maxLength={12}
              returnKeyType="search"
              selectionColor={colors.brand}
              cursorColor={colors.brand}
              accessibilityLabel={t('Código de la máquina')}
              accessibilityHint={t('Dos letras, guion y cuatro cifras')}
              style={{
                minHeight: 64, borderRadius: 16, paddingHorizontal: 18, backgroundColor: colors.card,
                borderWidth: 2, borderColor: error ? colors.danger : focused ? colors.brand : colors.divider,
                color: colors.textPrimary, fontSize: fs(26), fontFamily: 'Inter_700Bold', letterSpacing: 0.5,
              }}
            />
          </View>

          {error ? (
            <View accessibilityRole="alert" accessibilityLiveRegion="polite" style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 16, borderWidth: 1, borderColor: colors.danger, backgroundColor: alpha(colors.danger, 0.12) }}>
              <AlertCircle size={20} color={colors.danger} />
              <T size={13} color={colors.danger} style={{ flex: 1 }}>{t(ERRORS[error])}</T>
            </View>
          ) : (
            <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 18 }}>
              <IconTile size={48} radius={14}><QrCode size={24} color={colors.brand} /></IconTile>
              <View style={{ flex: 1, gap: 2 }}>
                <T size={15} weight="600">{t('¿Dónde está el código?')}</T>
                <T size={13} color="secondary">{t('Impreso justo debajo del QR de la máquina.')}</T>
              </View>
            </Card>
          )}
        </ScrollView>
        <BottomActions>
          <Button label={t('Buscar máquina')} onPress={search} icon={<Search size={22} color={colors.onBrand} />} style={{ flexDirection: 'row-reverse' }} />
          {error ? <Button variant="secondary" label={t('Escanear el QR')} onPress={() => router.replace('/gym/scan' as never)} /> : null}
        </BottomActions>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
