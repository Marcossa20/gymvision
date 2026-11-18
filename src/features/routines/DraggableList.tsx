// Teoría (RF1, manipulación directa): reordenar arrastrando el asa; alternativa accesible con acciones subir/bajar
// para lector de pantalla (no depender solo del gesto).
import React, { useRef, useState } from 'react';
import { PanResponder, View } from 'react-native';
import { hapticTick } from '../../services/haptics';

export const ROW_H = 78;
export const GAP = 8;
const PITCH = ROW_H + GAP;

function Item({ index, count, drag, setDrag, onMove, renderRow, offset }: {
  index: number; count: number; drag: { from: number; dy: number } | null; setDrag: (d: { from: number; dy: number } | null) => void;
  onMove: (from: number, to: number) => void; renderRow: (handle: object, dragging: boolean) => React.ReactNode; offset: number;
}) {
  const live = useRef({ index, count, onMove });
  live.current = { index, count, onMove };
  const pan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderTerminationRequest: () => false,
    onPanResponderGrant: () => { hapticTick(); setDrag({ from: live.current.index, dy: 0 }); },
    onPanResponderMove: (_, g) => setDrag({ from: live.current.index, dy: g.dy }),
    onPanResponderRelease: (_, g) => {
      const { index: i, count: n, onMove: mv } = live.current;
      const to = Math.max(0, Math.min(n - 1, Math.round(i + g.dy / PITCH)));
      setDrag(null);
      if (to !== i) { hapticTick(); mv(i, to); }
    },
    onPanResponderTerminate: () => setDrag(null),
  })).current;
  const dragging = drag?.from === index;
  return (
    <View style={{ position: 'absolute', left: 0, right: 0, top: index * PITCH, height: ROW_H, transform: [{ translateY: dragging ? drag!.dy : offset }], zIndex: dragging ? 10 : 0, opacity: dragging ? 0.95 : 1 }}>
      {renderRow(pan.panHandlers, dragging)}
    </View>
  );
}

export function DraggableList({ count, onMove, renderRow, onDragState }: {
  count: number; onMove: (from: number, to: number) => void;
  renderRow: (index: number, handle: object, dragging: boolean) => React.ReactNode; onDragState?: (dragging: boolean) => void;
}) {
  const [drag, setDragState] = useState<{ from: number; dy: number } | null>(null);
  const setDrag = (d: { from: number; dy: number } | null) => { setDragState(d); onDragState?.(!!d); };
  const target = drag ? Math.max(0, Math.min(count - 1, Math.round(drag.from + drag.dy / PITCH))) : -1;
  return (
    <View style={{ height: Math.max(0, count * PITCH - GAP) }}>
      {Array.from({ length: count }, (_, i) => {
        let offset = 0;
        if (drag && i !== drag.from) {
          if (drag.from < target && i > drag.from && i <= target) offset = -PITCH;
          if (drag.from > target && i < drag.from && i >= target) offset = PITCH;
        }
        return <Item key={i} index={i} count={count} drag={drag} setDrag={setDrag} onMove={onMove} offset={offset} renderRow={(h, d) => renderRow(i, h, d)} />;
      })}
    </View>
  );
}
