import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Card, T } from '../../components/ui';
import { useTheme } from '../../theme/useTheme';
import { useTranslation } from 'react-i18next';

export function SettingsScreen({ title, children }: { title: string; children: React.ReactNode }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, minHeight: 56 }}>
        <Pressable accessibilityRole="button" accessibilityLabel={t('Volver')} onPress={() => (router.canGoBack() ? router.back() : router.replace('/entrenar'))} style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}>
          <ArrowLeft size={24} color={colors.textPrimary} />
        </Pressable>
        <T size={18} weight="700" accessibilityRole="header" style={{ flex: 1, textAlign: 'center' }}>{title}</T>
        <View style={{ width: 48 }} />
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 36 }}>{children}</ScrollView>
    </SafeAreaView>
  );
}

export function Section({ label, children, highlight }: { label?: string; children: React.ReactNode; highlight?: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: 8, paddingTop: 18 }}>
      {label ? <T size={11} weight="600" color="secondary" style={{ letterSpacing: 0.8, paddingLeft: 4 }}>{label}</T> : null}
      <Card style={highlight ? { borderColor: colors.brand, borderWidth: 1.5 } : undefined}>{children}</Card>
    </View>
  );
}
