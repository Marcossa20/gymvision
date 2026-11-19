// Teoría (La Persona · Retos 1 y 2): todos los ajustes se aplican al instante y en toda la app.
//  Reto 1 daltonismo → paleta de rangos/mapa/gráficas, sin tocar la marca; el color nunca va solo (icono + nombre).
//  Reto 2 baja visión/mayores → tamaño de texto en 4 niveles, alto contraste, tema claro/oscuro.
import React from 'react';
import { Pressable, View } from 'react-native';
import { Check, Contrast, Eye, Moon, Palette, Sun, Type } from 'lucide-react-native';
import { Toggle, T } from '../../components/ui';
import { useSettings } from '../../store/settings';
import { useTheme } from '../../theme/useTheme';
import { rankPalettes, textScaleLabels, type ColorBlindMode, type TextScaleLevel } from '../../theme/tokens';
import { Section, SettingsScreen } from './SettingsLayout';
import { useTranslation } from 'react-i18next';

const modes: { id: ColorBlindMode; title: string; desc: string }[] = [
  { id: 'none', title: 'Ninguno', desc: 'Colores originales de GymVision' },
  { id: 'protanopia', title: 'Protanopia', desc: 'Dificultad con los rojos' },
  { id: 'deuteranopia', title: 'Deuteranopia', desc: 'Dificultad con los verdes' },
  { id: 'tritanopia', title: 'Tritanopia', desc: 'Dificultad con azules y amarillos' },
];

function Block({ icon, title, desc, right }: { icon: React.ReactNode; title: string; desc: string; right?: React.ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      {icon}
      <View style={{ flex: 1, gap: 2 }}>
        <T size={15} weight="600">{title}</T>
        <T size={12.5} color="secondary">{desc}</T>
      </View>
      {right}
    </View>
  );
}

export function AccessibilityScreen() {
  const { t } = useTranslation();
  const { colors, highContrast } = useTheme();
  const s = useSettings();
  const icon = (I: typeof Eye) => <I size={22} color={colors.brand} />;
  const isDark = s.theme !== 'light';

  return (
    <SettingsScreen title={t('Accesibilidad')}>
      <Section label={t('APARIENCIA')}>
        <View style={{ padding: 16, gap: 14 }}>
          <Block icon={icon(Palette)} title={t('Tema')} desc={t('Cambia el aspecto de toda la app')} />
          <View style={{ flexDirection: 'row', gap: 4, padding: 4, borderRadius: 14, backgroundColor: colors.switchOff }}>
            {([{ id: 'light', label: t('Claro'), I: Sun }, { id: 'dark', label: t('Oscuro'), I: Moon }] as const).map(({ id, label, I }) => {
              const sel = (id === 'dark') === isDark;
              return (
                <Pressable key={id} accessibilityRole="radio" accessibilityState={{ selected: sel }} accessibilityLabel={t('Tema {{name}}', { name: label })} onPress={() => s.set('theme', id)}
                  style={{ flex: 1, minHeight: 48, borderRadius: 10, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: sel ? colors.brand : 'transparent' }}>
                  <I size={18} color={sel ? colors.onBrand : colors.textSecondary} />
                  <T size={13.5} weight={sel ? '700' : '500'} color={sel ? colors.onBrand : 'secondary'}>{label}</T>
                </Pressable>
              );
            })}
          </View>
        </View>
      </Section>

      <Section label={t('ACCESIBILIDAD')}>
        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          <Block icon={icon(Eye)} title={t('Modo daltonismo')} desc={t('Adapta los colores de la interfaz, rangos y gráficas')} />
        </View>
        {modes.map((m) => {
          const sel = s.colorBlind === m.id;
          return (
            <Pressable key={m.id} accessibilityRole="radio" accessibilityState={{ selected: sel }} accessibilityLabel={`${t(m.title)}. ${t(m.desc)}`} onPress={() => s.set('colorBlind', m.id)}
              style={{ minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 13, borderTopWidth: 1, borderTopColor: colors.divider, marginTop: m.id === 'none' ? 10 : 0 }}>
              <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: sel ? colors.brand : colors.radioOff, alignItems: 'center', justifyContent: 'center' }}>
                {sel ? <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.brand }} /> : null}
              </View>
              <View style={{ flex: 1, gap: 1 }}>
                <T size={15} weight={sel ? '700' : '500'}>{t(m.title)}</T>
                <T size={12} color="secondary">{t(m.desc)}</T>
              </View>
              <View style={{ flexDirection: 'row', gap: 4 }}>
                {rankPalettes[m.id].map((c) => <View key={c} style={{ width: 13, height: 13, borderRadius: 7, backgroundColor: c }} />)}
              </View>
            </Pressable>
          );
        })}
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', padding: 16, borderTopWidth: 1, borderTopColor: colors.divider }}>
          <Check size={16} color={colors.brand} />
          <T size={12} color="secondary" style={{ flex: 1 }}>{t('Los rangos siempre muestran icono y nombre, no solo color.')}</T>
        </View>
      </Section>

      <View style={{ paddingTop: 8 }}>
        <Section>
          <View style={{ padding: 16 }}>
            <Block icon={icon(Contrast)} title={t('Alto contraste')} desc={t('Textos y bordes más marcados')} right={<Toggle value={s.highContrast} onChange={(v) => s.set('highContrast', v)} label={t('Alto contraste')} />} />
          </View>
        </Section>
      </View>

      <Section label={t('TEXTO')}>
        <View style={{ padding: 16, gap: 14 }}>
          <Block icon={icon(Type)} title={t('Tamaño de texto')} desc={t('Se aplica a toda la app')} right={<T size={13.5} weight="700" color="brand">{t(textScaleLabels[s.textScale])}</T>} />
          <View
            accessible accessibilityRole="adjustable" accessibilityLabel={t('Tamaño de texto')} accessibilityValue={{ text: t(textScaleLabels[s.textScale]) }}
            accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
            onAccessibilityAction={(e) => s.set('textScale', Math.max(0, Math.min(3, s.textScale + (e.nativeEvent.actionName === 'increment' ? 1 : -1))) as TextScaleLevel)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}
          >
            <T size={13} weight="700" color="secondary">A</T>
            <View style={{ flex: 1, flexDirection: 'row', height: 48, alignItems: 'center' }}>
              {([0, 1, 2, 3] as TextScaleLevel[]).map((lvl) => (
                <Pressable key={lvl} accessibilityRole="button" accessibilityLabel={t(textScaleLabels[lvl])} onPress={() => s.set('textScale', lvl)} style={{ flex: 1, height: 48, justifyContent: 'center' }}>
                  <View style={{ height: 4, backgroundColor: lvl <= s.textScale ? colors.brand : colors.divider }} />
                  <View style={{ position: 'absolute', right: lvl === 3 ? 0 : undefined, left: lvl === 0 ? 0 : undefined, alignSelf: lvl === 0 || lvl === 3 ? undefined : 'flex-end', width: lvl === s.textScale ? 26 : 10, height: lvl === s.textScale ? 26 : 10, borderRadius: 13, backgroundColor: lvl <= s.textScale ? colors.brand : colors.switchOff, borderWidth: highContrast ? 2 : 0, borderColor: colors.border }} />
                </Pressable>
              ))}
            </View>
            <T size={22} weight="700" color="secondary">A</T>
          </View>
          <View style={{ backgroundColor: colors.switchOff, borderRadius: 12, padding: 14, gap: 4 }}>
            <T size={10.5} weight="600" color={colors.radioOff} style={{ letterSpacing: 0.8 }}>{t('VISTA PREVIA')}</T>
            <T size={16} weight="700">{t('Press de banca')}</T>
            <T size={13} color="secondary">{t('4 series · 10 repeticiones · 60 kg')}</T>
          </View>
        </View>
      </Section>
    </SettingsScreen>
  );
}
