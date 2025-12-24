'use client';

import { useEffect, useRef } from 'react';
import { useGameStore } from '@/stores/gameStore';

/**
 * Hook qui gère la lecture audio pendant le jeu
 * Synchronise l'audio avec le currentTime du jeu
 */
export function useGameAudio() {
  const { audioBuffer, beatmap, status } = useGameStore();
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const isPlayingRef = useRef<boolean>(false);
  const beatmapIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Initialiser l'AudioContext ou le recréer s'il est fermé
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      console.log('🎵 Audio context created/recreated');
    }

    const audioContext = audioContextRef.current;

    // Démarrer la lecture quand le jeu commence (seulement si pas déjà en cours)
    if (status === 'playing' && audioBuffer && beatmap && !isPlayingRef.current) {
      console.log('🎵 Starting audio playback...', {
        audioBuffer,
        beatmapId: beatmap.id,
        audioContextState: audioContext.state
      });

      // Réactiver le contexte audio si suspendu (navigateurs modernes)
      if (audioContext.state === 'suspended') {
        audioContext.resume().then(() => {
          console.log('🎵 Audio context resumed');
        });
      }

      // Créer une nouvelle source
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);

      // Calculer l'offset de départ (startTime de la beatmap en secondes)
      const startOffset = beatmap.startTime / 1000;

      console.log('🎵 Playing from', startOffset, 'seconds');

      // Démarrer la lecture
      source.start(0, startOffset);

      sourceRef.current = source;
      isPlayingRef.current = true;
      beatmapIdRef.current = beatmap.id;

      // Arrêter automatiquement après 60 secondes
      setTimeout(() => {
        if (sourceRef.current === source) {
          try {
            source.stop();
          } catch (e) {
            // Ignore
          }
          isPlayingRef.current = false;
          console.log('🎵 Audio stopped after 60s');
        }
      }, beatmap.duration);
    }

    // Arrêter la lecture si le jeu s'arrête
    if ((status === 'waiting' || status === 'finished') && isPlayingRef.current) {
      if (sourceRef.current) {
        try {
          sourceRef.current.stop();
        } catch (e) {
          // Ignore
        }
        sourceRef.current = null;
        isPlayingRef.current = false;
        beatmapIdRef.current = null;
        console.log('🎵 Audio stopped (game ended)');
      }
    }

    // Cleanup - arrêter l'audio si le composant se démonte pendant la lecture
    return () => {
      // On ne fait rien ici pour éviter de stopper l'audio sur les re-renders
    };
  }, [status, audioBuffer, beatmap]);

  // Note: On ne ferme PAS le contexte audio au démontage
  // car ça cause des problèmes avec React Strict Mode
  // et l'audio doit être disponible pendant toute la session
}
