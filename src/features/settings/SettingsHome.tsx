import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Bell, ChevronRight, Globe, PersonStanding, Scale, Shield, SquarePlus } from 'lucide-react-native';
import { Row, T } from '../../components/ui';
import { useSettings } from '../../store/settings';
import { useTheme } from '../../theme/useTheme';
import { Section, SettingsScreen } from './SettingsLayout';

export const languageNames = { es: 'Español', en: 'English', fr: 'Français', de: 'Deutsch', it: 'Italiano', pt: 'Português' } as const;

export function SettingsHome() {
  const { colors } = useTheme();
  const router = useRouter();
  const unit = useSettings((s) => s.unit);
  const language = useSettings((s) => s.language);
  const icon = (I: typeof Bell) => <I size={22} color={colors.brand} />;
  const chev = <ChevronRight size={18} color={colors.textSecondary} />;
  return (
    <SettingsScreen title="Ajustes">
      <Section label="PERFIL Y CUENTA">
        <Row icon={icon(Shield)} label="Cuenta y seguridad" right={chev} onPress={() => router.push('/settings/account')} />
        <Row icon={icon(Bell)} label="Notificaciones" right={chev} onPress={() => router.push('/settings/notifications')} last />
      </Section>
      <Section label="PREFERENCIAS">
        <Row icon={icon(Scale)} label="Unidad de peso" value={unit === 'kg' ? 'Kg' : 'Lb'} right={chev} onPress={() => router.push('/settings/units')} />
        <Row icon={icon(Globe)} label="Idioma" value={languageNames[language]} right={chev} onPress={() => router.push('/settings/language')} last />
      </Section>
      <Section label="ACCESIBILIDAD" highlight>
        <Row icon={icon(PersonStanding)} label="Accesibilidad" right={chev} onPress={() => router.push('/settings/accessibility')} last />
      </Section>
      <View style={{ paddingTop: 18 }}>
        <Section>
          <Row icon={icon(SquarePlus)} label="Añadir widget a inicio" right={chev} last onPress={() => router.push('/settings/widget')} />
        </Section>
      </View>
      <T size={12} color="secondary" style={{ textAlign: 'center', paddingTop: 28 }}>GymVision · v1.0</T>
    </SettingsScreen>
  );
}
