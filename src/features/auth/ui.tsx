// Campos de formulario de Acceso.
// Teoría (La Persona, errores — RNF3): el error se muestra junto al campo, con icono + texto + borde
// (no solo color) y dice cómo arreglarlo; el ojo permite comprobar la contraseña antes de enviarla.
// Teoría (RNF1/Reto 2): campos de 56 dp, etiqueta visible siempre (no solo placeholder), texto escalable.
import React, { forwardRef, useState } from 'react';
import { Pressable, TextInput, View, type TextInputInstance, type TextInputProps } from 'react-native';
import { AlertCircle, Check, Eye, EyeOff, type LucideIcon } from 'lucide-react-native';
import { T } from '../../components/ui';
import { useTheme } from '../../theme/useTheme';
import { alpha } from '../gym/ui';

export const Field = forwardRef<TextInputInstance, {
  label: string; icon: LucideIcon; error?: string | null; hint?: string; secure?: boolean; radius?: number;
} & TextInputProps>(function Field({ label, icon: Icon, error, hint, secure, radius = 14, ...input }, ref) {
  const { colors, fs } = useTheme();
  const [hidden, setHidden] = useState(true);
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ gap: 8 }}>
      <T size={13} weight="600" color="secondary">{label}</T>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56, paddingLeft: 16, paddingRight: secure ? 4 : 16, borderRadius: radius, backgroundColor: colors.card, borderWidth: error || focused ? 1.5 : 1, borderColor: error ? colors.danger : focused ? colors.brand : colors.divider }}>
        <Icon size={20} color={colors.textSecondary} />
        <TextInput
          ref={ref}
          {...input}
          secureTextEntry={secure && hidden}
          placeholderTextColor={colors.textSecondary}
          selectionColor={colors.brand}
          accessibilityLabel={label}
          accessibilityHint={error ?? hint}
          onFocus={(e) => { setFocused(true); input.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); input.onBlur?.(e); }}
          style={{ flex: 1, minHeight: 48, color: colors.textPrimary, fontSize: fs(15.5), fontFamily: 'Inter_400Regular' }}
        />
        {secure ? (
          <Pressable onPress={() => setHidden((h) => !h)} accessibilityRole="button" accessibilityLabel={hidden ? 'Mostrar contraseña' : 'Ocultar contraseña'} style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}>
            {hidden ? <Eye size={20} color={colors.textSecondary} /> : <EyeOff size={20} color={colors.textSecondary} />}
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <View accessibilityLiveRegion="polite" style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <AlertCircle size={14} color={colors.danger} />
          <T size={12.5} color={colors.danger} style={{ flex: 1 }}>{error}</T>
        </View>
      ) : hint ? <T size={12.5} color="secondary">{hint}</T> : null}
    </View>
  );
});

/** Requisito con check relleno (cumplido) o círculo vacío (pendiente): forma + texto, no solo color. */
export function Rule({ ok, label }: { ok: boolean; label: string }) {
  const { colors } = useTheme();
  return (
    <View accessible accessibilityLabel={`${label}: ${ok ? 'cumplido' : 'pendiente'}`} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <View style={{ width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: ok ? colors.brand : 'transparent', borderWidth: ok ? 0 : 2, borderColor: colors.radioOff }}>
        {ok ? <Check size={12} color={colors.onBrand} strokeWidth={3} /> : null}
      </View>
      <T size={14} color="secondary">{label}</T>
    </View>
  );
}

/** Error general del formulario (p. ej. credenciales incorrectas). */
export function FormError({ message }: { message: string }) {
  const { colors } = useTheme();
  return (
    <View accessibilityRole="alert" style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 14, borderWidth: 1, borderColor: colors.danger, backgroundColor: alpha(colors.danger, 0.12) }}>
      <AlertCircle size={20} color={colors.danger} />
      <T size={13} color={colors.danger} style={{ flex: 1 }}>{message}</T>
    </View>
  );
}
