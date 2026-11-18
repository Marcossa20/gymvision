// Teoría (Reto 3, discapacidad auditiva / ruido): vibración, sonido y aviso visual se activan por separado;
// ningún aviso depende solo del sonido.
import React from 'react';
import { View } from 'react-native';
import { Bell, Smartphone, Volume2, Vibrate } from 'lucide-react-native';
import { RadioRow, Row, Toggle, T } from '../../components/ui';
import { notify } from '../../services/alerts';
import { useSettings, type Language } from '../../store/settings';
import { useTheme } from '../../theme/useTheme';
import { languageNames } from './SettingsHome';
import { Section, SettingsScreen } from './SettingsLayout';

export function NotificationsScreen() {
  const { colors } = useTheme();
  const s = useSettings();
  const ic = (I: typeof Bell) => <I size={22} color={colors.brand} />;
  return (
    <SettingsScreen title="Notificaciones">
      <Section label="AVISOS DURANTE EL ENTRENO">
        <Row icon={ic(Vibrate)} label="Vibración" right={<Toggle value={s.vibration} onChange={(v) => s.set('vibration', v)} label="Vibración" />} />
        <Row icon={ic(Volume2)} label="Sonido" right={<Toggle value={s.sound} onChange={(v) => s.set('sound', v)} label="Sonido" />} />
        <Row icon={ic(Smartphone)} label="Aviso visual" right={<Toggle value={s.visualAlerts} onChange={(v) => s.set('visualAlerts', v)} label="Aviso visual" />} last />
      </Section>
      <Section label="RECORDATORIOS">
        <Row icon={ic(Bell)} label="Recordatorios de entreno" right={<Toggle value={s.reminders} onChange={(v) => s.set('reminders', v)} label="Recordatorios de entreno" />} last />
      </Section>
      <View style={{ paddingTop: 12 }}>
        <T size={12.5} color="secondary" style={{ paddingHorizontal: 4 }}>Cada aviso (serie guardada, fin de descanso, subida de rango) usa los canales que dejes activos. Si apagas todos, no te enterarás de nada.</T>
      </View>
      <View style={{ paddingTop: 16 }}>
        <Row label="Probar un aviso" onPress={() => notify('descanso', 'Descanso terminado · aviso de prueba')} last />
      </View>
    </SettingsScreen>
  );
}

export function UnitsScreen() {
  const unit = useSettings((s) => s.unit);
  const set = useSettings((s) => s.set);
  return (
    <SettingsScreen title="Unidad de peso">
      <Section>
        <RadioRow label="Kilogramos (kg)" selected={unit === 'kg'} onPress={() => set('unit', 'kg')} />
        <RadioRow label="Libras (lb)" selected={unit === 'lb'} onPress={() => set('unit', 'lb')} last />
      </Section>
    </SettingsScreen>
  );
}

export function LanguageScreen() {
  const language = useSettings((s) => s.language);
  const set = useSettings((s) => s.set);
  const ids = Object.keys(languageNames) as Language[];
  return (
    <SettingsScreen title="Idioma">
      <Section>
        {ids.map((id, i) => <RadioRow key={id} label={languageNames[id]} selected={language === id} onPress={() => set('language', id)} last={i === ids.length - 1} />)}
      </Section>
      <T size={12.5} color="secondary" style={{ paddingTop: 12, paddingHorizontal: 4 }}>TODO: traducciones i18next (por ahora la interfaz está en español).</T>
    </SettingsScreen>
  );
}

export function PlaceholderScreen({ title, text }: { title: string; text: string }) {
  return (
    <SettingsScreen title={title}>
      <View style={{ paddingTop: 24 }}><T size={15} color="secondary">{text}</T></View>
    </SettingsScreen>
  );
}
