// Gráfica de barras de una serie (Figma 2010:2 / 2010:224).
// Teoría (visualización): una sola serie → sin leyenda (el título la nombra); marca seleccionada en color
// pleno y el resto atenuado; los días sin entreno se marcan con un punto (no «barra 0» invisible);
// textos en tokens de texto, nunca en el color de la serie; zona táctil de toda la columna (≥ 48 dp de alto).
// Accesibilidad: cada columna es un botón con su valor leído en voz alta (equivale a la vista de tabla).
import React, { useState } from 'react';
import { Pressable, View, type LayoutChangeEvent } from 'react-native';
import { T } from '../../components/ui';
import { useTheme } from '../../theme/useTheme';
import { alpha } from '../gym/ui';
import type { Bucket } from './progress';
import { niceAxis } from './progress';
import { fmtAxis } from './format';
import { useTranslation } from 'react-i18next';

const H = 204, PLOT_TOP = 20, BASE = 170, AXIS_W = 44;

export function BarChart({ buckets, selected, onSelect, format }: {
  buckets: Bucket[]; selected: number; onSelect: (i: number) => void; format: (v: number) => string;
}) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [w, setW] = useState(0);
  const max = Math.max(0, ...buckets.map((b) => b.value));
  const { top, step } = niceAxis(max);
  const ticks = Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step);
  const plotW = Math.max(0, w - AXIS_W);
  const colW = buckets.length ? plotW / buckets.length : 0;
  const barW = Math.min(23, colW * 0.58);
  const y = (v: number) => BASE - (v / top) * (BASE - PLOT_TOP);
  const sel = buckets[selected];

  return (
    <View style={{ height: H }} onLayout={(e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width)}>
      {ticks.map((tk) => (
        <React.Fragment key={tk}>
          <View style={{ position: 'absolute', left: AXIS_W, right: 0, top: y(tk), height: 1, backgroundColor: tk === 0 ? colors.textSecondary : colors.divider }} />
          <T size={10.5} weight="500" color="secondary" style={{ position: 'absolute', left: 0, width: 36, top: y(tk) - 7, textAlign: 'right' }}>{fmtAxis(tk)}</T>
        </React.Fragment>
      ))}
      {buckets.map((b, i) => {
        const x = AXIS_W + i * colW;
        const isSel = i === selected;
        const h = BASE - y(b.value);
        return (
          <Pressable
            key={b.start}
            onPress={() => onSelect(i)}
            accessibilityRole="button"
            accessibilityState={{ selected: isSel }}
            accessibilityLabel={`${b.long}: ${b.value ? format(b.value) : t('sin entreno')}`}
            style={{ position: 'absolute', left: x, width: colW, top: 0, height: H }}
          >
            {b.value > 0 ? (
              <View style={{ position: 'absolute', left: (colW - barW) / 2, width: barW, top: BASE - h, height: Math.max(2, h), borderTopLeftRadius: 6, borderTopRightRadius: 6, backgroundColor: isSel ? colors.brand : alpha(colors.brand, 0.35) }} />
            ) : (
              <View style={{ position: 'absolute', left: colW / 2 - 2.5, top: BASE - 5, width: 5, height: 5, borderRadius: 2.5, backgroundColor: colors.textSecondary }} />
            )}
            <T size={10.5} weight={isSel ? '700' : '500'} color={isSel ? 'primary' : 'secondary'} numberOfLines={1} style={{ position: 'absolute', top: 180, left: 0, right: 0, textAlign: 'center' }}>{b.label}</T>
          </Pressable>
        );
      })}
      {sel && w > 0 ? (
        <View pointerEvents="none" style={{ position: 'absolute', top: Math.max(0, y(sel.value) - 58), left: Math.min(Math.max(AXIS_W, AXIS_W + selected * colW + colW / 2 - 55), w - 110), width: 110, alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: colors.divider, backgroundColor: colors.card }}>
          <T size={14} weight="700">{sel.value ? format(sel.value) : t('Sin entreno')}</T>
          <T size={10.5} weight="500" color="secondary" style={{ letterSpacing: 0.6 }}>{sel.long}</T>
        </View>
      ) : null}
    </View>
  );
}
