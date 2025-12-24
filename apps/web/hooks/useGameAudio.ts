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
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    // Initialiser l'AudioContext
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const audioContext = audioContextRef.current;

    // Démarrer la lecture quand le jeu commence
    if (status === 'playing' && audioBuffer && beatmap) {
      // Arrêter toute lecture précédente
      if (sourceRef.current) {
        try {
          sourceRef.current.stop();
        } catch (e) {
          // Ignore si déjà arrêté
        }
      }

      // Créer une nouvelle source
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);

      // Calculer l'offset de départ (startTime de la beatmap en secondes)
      const startOffset = beatmap.startTime / 1000;

      // Démarrer la lecture
      source.start(0, startOffset);
      startTimeRef.current = audioContext.currentTime;

      sourceRef.current = source;

      // Arrêter automatiquement après 60 secondes
      setTimeout(() => {
        if (sourceRef.current === source) {
          try {
            source.stop();
          } catch (e) {
            // Ignore
          }
        }
      }, beatmap.duration);
    }

    // Arrêter la lecture si le jeu s'arrête
    if (status === 'waiting' || status === 'finished') {
      if (sourceRef.current) {
        try {
          sourceRef.current.stop();
        } catch (e) {
          // Ignore
        }
        sourceRef.current = null;
      }
    }

    // Cleanup
    return () => {
      if (sourceRef.current) {
        try {
          sourceRef.current.stop();
        } catch (e) {
          // Ignore
        }
      }
    };
  }, [status, audioBuffer, beatmap]);

  // Cleanup au démontage
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);
}
