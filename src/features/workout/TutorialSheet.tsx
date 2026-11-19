// Tutorial de un ejercicio: animación corta en bucle de cómo se hace el movimiento (RF5, «Tutorial» del entreno).
// Teoría (La Persona, reconocimiento antes que recuerdo): ver el movimiento es más rápido que leerlo, y sin audio
// (gimnasio ruidoso, Reto 3). Accesibilidad (Reto 2/WCAG 2.2.2): un vídeo en bucle debe poder pausarse → botón «Pausar».
// Todo es local (assets/videos): funciona sin conexión (RNF5).
import React, { useEffect } from 'react';
import { Modal, Pressable, View, useWindowDimensions } from 'react-native';
import { useEvent } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Pause, Play } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Button, T } from '../../components/ui';
import { exerciseById } from '../../data/seed';
import { useTheme } from '../../theme/useTheme';
import { muscleLabel } from '../routines/Thumb';
import { exerciseVideos } from './exerciseVideos';

function Player({ source, label }: { source: number; label: string }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const player = useVideoPlayer(source, (p) => { p.loop = true; p.muted = true; p.play(); });
  // Se reproduce solo al estar listo (en web la orden inicial puede llegar antes de que exista el vídeo).
  useEffect(() => {
    const sub = player.addListener('statusChange', ({ status }) => { if (status === 'readyToPlay') player.play(); });
    return () => sub.remove();
  }, [player]);
  const { isPlaying: playing } = useEvent(player, 'playingChange', { isPlaying: player.playing });
  const size = Math.min(width - 72, 360);
  const toggle = () => { if (playing) player.pause(); else player.play(); };
  return (
    <View style={{ alignItems: 'center', gap: 12 }}>
      <View accessible accessibilityRole="image" accessibilityLabel={label} style={{ width: size, height: size, borderRadius: 20, overflow: 'hidden', backgroundColor: '#070709' }}>
        <VideoView player={player} nativeControls={false} contentFit="contain" style={{ width: size, height: size }} />
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel={playing ? t('Pausar animación') : t('Reproducir animación')} onPress={toggle}
        style={{ minHeight: 48, minWidth: 48, paddingHorizontal: 16, borderRadius: 24, backgroundColor: colors.surface2, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {playing ? <Pause size={18} color={colors.textPrimary} /> : <Play size={18} color={colors.textPrimary} />}
        <T size={14} weight="600">{playing ? t('Pausar animación') : t('Reproducir animación')}</T>
      </Pressable>
    </View>
  );
}

export function TutorialSheet({ exerciseId, onClose }: { exerciseId: string; onClose: () => void }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const ex = exerciseById(exerciseId);
  const source = exerciseVideos[exerciseId];
  return (
    <Modal transparent animationType="slide" visible onRequestClose={onClose}>
      <Pressable accessibilityLabel={t('Cerrar')} onPress={onClose} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }} />
      <View style={{ backgroundColor: colors.card, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, gap: 14 }}>
        <View style={{ gap: 2 }}>
          <T size={20} weight="700" accessibilityRole="header">{t(ex.name)}</T>
          <T size={13} color="secondary">{ex.muscles.map(muscleLabel).join(' · ') || t('Cardio')}</T>
        </View>
        {source ? <Player source={source} label={t('Animación del movimiento: {{name}}', { name: t(ex.name) })} /> : null}
        <Button label={t('Cerrar')} variant="secondary" onPress={onClose} />
      </View>
    </Modal>
  );
}
