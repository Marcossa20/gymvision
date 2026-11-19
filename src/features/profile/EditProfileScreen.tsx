// Editar perfil (Figma 2015:2).
// Teoría (RNF3, errores): los cambios no se aplican hasta «Guardar»; salir con cambios pide confirmación.
// Teoría (RNF1): la altura se ajusta con botones grandes − / + (sin teclear); el sexo con radios.
// Privacidad: «Se guardan solo en tu móvil» (RNF5, sin servidor).
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, usePreventRemove, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ArrowLeft, Camera, ChevronDown, ChevronRight, Lock, Minus, Plus } from 'lucide-react-native';
import { Button, RadioRow, T } from '../../components/ui';
import { notify } from '../../services/alerts';
import { useProfile, type ProfileData, type Sex } from '../../store/profile';
import { useTheme } from '../../theme/useTheme';
import { Avatar } from './ProfileScreen';
import { useTranslation } from 'react-i18next';

const SEX_LABEL: Record<Sex, string> = { masculino: 'Masculino', femenino: 'Femenino' };

export function EditProfileScreen() {
  const { t } = useTranslation();
  const { colors, fs } = useTheme();
  const router = useRouter();
  const navigation = useNavigation();
  const profile = useProfile();
  const initial: ProfileData = { name: profile.name, username: profile.username, sex: profile.sex, heightCm: profile.heightCm, photoUri: profile.photoUri };
  const [draft, setDraft] = useState<ProfileData>(initial);
  const [open, setOpen] = useState<'sex' | 'height' | null>(null);
  const [saved, setSaved] = useState(false);
  const dirty = (Object.keys(initial) as (keyof ProfileData)[]).some((k) => initial[k] !== draft[k]);
  const up = (p: Partial<ProfileData>) => setDraft((d) => ({ ...d, ...p }));

  usePreventRemove(dirty && !saved, ({ data }) => {
    Alert.alert(t('¿Descartar cambios?'), t('No se guardará lo que has cambiado.'), [
      { text: t('Seguir editando'), style: 'cancel' },
      { text: t('Descartar'), style: 'destructive', onPress: () => navigation.dispatch(data.action) },
    ]);
  });

  const pickPhoto = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.7 });
      if (!res.canceled && res.assets[0]) up({ photoUri: res.assets[0].uri });
    } catch {
      notify('error', t('No se pudo abrir la galería'));
    }
  };

  const save = () => {
    const name = draft.name.trim();
    const username = draft.username.trim().replace(/^@/, '').replace(/\s+/g, '').toLowerCase();
    if (!name || !username) return notify('error', t('El nombre y el usuario no pueden estar vacíos'));
    profile.set({ ...draft, name, username });
    setSaved(true);
    notify('serie', t('Perfil guardado'));
    setTimeout(() => (router.canGoBack() ? router.back() : router.replace('/perfil' as never)), 0);
  };

  const field = { minHeight: 60, flexDirection: 'row' as const, alignItems: 'center' as const, gap: 12, paddingHorizontal: 18 };
  const input = { flex: 1, textAlign: 'right' as const, color: colors.textPrimary, fontSize: fs(15.5), fontFamily: 'Inter_500Medium', minHeight: 48 };
  const Divider = () => <View style={{ height: 1, backgroundColor: colors.divider }} />;

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 }}>
          <Pressable accessibilityRole="button" accessibilityLabel={t('Volver')} onPress={() => (router.canGoBack() ? router.back() : router.replace('/perfil' as never))} style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}>
            <ArrowLeft size={24} color={colors.textPrimary} />
          </Pressable>
          <T size={18} weight="700" style={{ flex: 1, textAlign: 'center' }} accessibilityRole="header">{t('Editar perfil')}</T>
          <View style={{ width: 48 }} />
        </View>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }} keyboardShouldPersistTaps="handled">
          <Pressable onPress={pickPhoto} accessibilityRole="button" accessibilityLabel={t('Cambiar foto')} style={{ alignItems: 'center', gap: 14, paddingTop: 22, paddingBottom: 26 }}>
            <View>
              <Avatar size={116} uri={draft.photoUri} />
              <View style={{ position: 'absolute', right: -3, bottom: -3, width: 40, height: 40, borderRadius: 20, backgroundColor: colors.brand, borderWidth: 3, borderColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
                <Camera size={18} color={colors.onBrand} />
              </View>
            </View>
            <T size={15} weight="600" color="brand">{t('Cambiar foto')}</T>
          </Pressable>

          <View style={{ backgroundColor: colors.card, borderRadius: 16 }}>
            <View style={field}>
              <T size={15} color="secondary">{t('Nombre')}</T>
              <TextInput value={draft.name} onChangeText={(name) => up({ name })} style={input} accessibilityLabel={t('Nombre')} selectionColor={colors.brand} maxLength={40} />
            </View>
            <Divider />
            <View style={field}>
              <T size={15} color="secondary">{t('Usuario')}</T>
              <TextInput value={`@${draft.username}`} onChangeText={(v) => up({ username: v.replace(/^@/, '') })} autoCapitalize="none" autoCorrect={false} style={input} accessibilityLabel={t('Usuario')} selectionColor={colors.brand} maxLength={30} />
            </View>
          </View>
          <T size={12.5} color="secondary" style={{ paddingTop: 10, paddingHorizontal: 4 }}>{t('Así aparecerás en tu perfil y en tus entrenos.')}</T>

          <View style={{ height: 16 }} />
          <View style={{ backgroundColor: colors.card, borderRadius: 16, overflow: 'hidden' }}>
            <Pressable onPress={() => setOpen(open === 'sex' ? null : 'sex')} accessibilityRole="button" accessibilityState={{ expanded: open === 'sex' }} accessibilityLabel={`${t('Sexo')}, ${t(SEX_LABEL[draft.sex])}`} style={field}>
              <T size={15} color="secondary">{t('Sexo')}</T>
              <T size={15.5} weight="500" style={{ flex: 1, textAlign: 'right' }}>{t(SEX_LABEL[draft.sex])}</T>
              {open === 'sex' ? <ChevronDown size={18} color={colors.textSecondary} /> : <ChevronRight size={18} color={colors.textSecondary} />}
            </Pressable>
            {open === 'sex' ? (
              <View accessibilityRole="radiogroup">
                {(Object.keys(SEX_LABEL) as Sex[]).map((s, i, arr) => (
                  <RadioRow key={s} label={t(SEX_LABEL[s])} selected={draft.sex === s} onPress={() => { up({ sex: s }); setOpen(null); }} last={i === arr.length - 1} />
                ))}
              </View>
            ) : null}
            <Divider />
            <Pressable onPress={() => setOpen(open === 'height' ? null : 'height')} accessibilityRole="button" accessibilityState={{ expanded: open === 'height' }} accessibilityLabel={t('Altura, {{n}} centímetros', { n: draft.heightCm })} style={field}>
              <T size={15} color="secondary">{t('Altura')}</T>
              <T size={15.5} weight="500" style={{ flex: 1, textAlign: 'right' }}>{draft.heightCm} cm</T>
              {open === 'height' ? <ChevronDown size={18} color={colors.textSecondary} /> : <ChevronRight size={18} color={colors.textSecondary} />}
            </Pressable>
            {open === 'height' ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24, paddingBottom: 16 }}>
                {[{ d: -1, Icon: Minus, l: 'Bajar un centímetro' }, { d: 1, Icon: Plus, l: 'Subir un centímetro' }].map(({ d, Icon, l }, i) => (
                  <React.Fragment key={d}>
                    {i === 1 ? <View accessibilityLiveRegion="polite"><T size={28} weight="700" style={{ minWidth: 100, textAlign: 'center' }}>{draft.heightCm} cm</T></View> : null}
                    <Pressable
                      onPress={() => up({ heightCm: Math.min(230, Math.max(120, draft.heightCm + d)) })}
                      onLongPress={() => up({ heightCm: Math.min(230, Math.max(120, draft.heightCm + d * 5)) })}
                      accessibilityRole="button" accessibilityLabel={t(l)} accessibilityHint={t('Mantén pulsado para 5 cm')}
                      style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Icon size={24} color={colors.textPrimary} />
                    </Pressable>
                  </React.Fragment>
                ))}
              </View>
            ) : null}
          </View>
          <View style={{ flexDirection: 'row', gap: 8, paddingTop: 10, paddingHorizontal: 4 }}>
            <Lock size={14} color={colors.textSecondary} style={{ marginTop: 1 }} />
            <T size={12.5} color="secondary" style={{ flex: 1 }}>{t('Se usan para calcular tus rangos. Se guardan solo en tu móvil.')}</T>
          </View>

          <View style={{ height: 26 }} />
          <Button label={t('Guardar')} onPress={save} disabled={!dirty} style={{ borderRadius: 16, minHeight: 54 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
