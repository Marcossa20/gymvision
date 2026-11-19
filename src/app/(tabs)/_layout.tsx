// Teoría (consistencia + reconocimiento antes que recuerdo): barra inferior fija de 4 pestañas con icono + texto.
import React from 'react';
import { Text } from 'react-native';
import { Tabs } from 'expo-router';
import { Building2, Dumbbell, Hexagon, User } from 'lucide-react-native';
import { useTheme } from '../../theme/useTheme';
import { useTranslation } from 'react-i18next';

export const unstable_settings = { anchor: 'entrenar' };

export default function TabsLayout() {
  const { t } = useTranslation();
  const { colors, fs } = useTheme();
  return (
    <Tabs
      backBehavior="initialRoute"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.textSecondary,
        // Con el texto al máximo, «Mi gimnasio» no cabe en una línea: la etiqueta pasa a dos líneas y la barra crece (Reto 2).
        tabBarStyle: { backgroundColor: '#111114', borderTopColor: colors.divider, minHeight: 64 + Math.round((fs(11) - 11) * 5.5), paddingTop: 8 },
        tabBarLabel: ({ color, children }) => <Text numberOfLines={2} style={{ color, fontSize: fs(11), fontWeight: '500', textAlign: 'center' }}>{children}</Text>,
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen name="rangos" options={{ title: t('Rangos'), tabBarIcon: ({ color }) => <Hexagon size={24} color={color} /> }} />
      <Tabs.Screen name="entrenar" options={{ title: t('Entrenar'), tabBarIcon: ({ color }) => <Dumbbell size={24} color={color} /> }} />
      <Tabs.Screen name="gimnasio" options={{ title: t('Mi gimnasio'), tabBarIcon: ({ color }) => <Building2 size={24} color={color} /> }} />
      <Tabs.Screen name="perfil" options={{ title: t('Perfil'), tabBarIcon: ({ color }) => <User size={24} color={color} /> }} />
    </Tabs>
  );
}
