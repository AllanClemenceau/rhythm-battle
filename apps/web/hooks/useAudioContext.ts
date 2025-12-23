'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

export interface AudioData {
  audioBuffer: AudioBuffer;
  duration: number;
  sampleRate: number;
}

export function useAudioContext() {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Initialiser le contexte audio
  useEffect(() => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    setAudioContext(ctx);

    return () => {
      ctx.close();
    };
  }, []);

  /**
   * Charger un fichier audio depuis un File ou une URL
   */
  const loadAudio = useCallback(async (source: File | string): Promise<AudioData | null> => {
    if (!audioContext) {
      setError('Audio context not initialized');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      let arrayBuffer: ArrayBuffer;

      if (typeof source === 'string') {
        // Charger depuis URL
        const response = await fetch(source);
        arrayBuffer = await response.arrayBuffer();
      } else {
        // Charger depuis File
        arrayBuffer = await source.arrayBuffer();
      }

      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      setIsLoading(false);
      return {
        audioBuffer,
        duration: audioBuffer.duration * 1000, // en ms
        sampleRate: audioBuffer.sampleRate,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load audio';
      setError(message);
      setIsLoading(false);
      return null;
    }
  }, [audioContext]);

  /**
   * Jouer un audio buffer
   */
  const playAudio = useCallback((audioBuffer: AudioBuffer, startTime = 0) => {
    if (!audioContext) return;

    // Arrêter la lecture précédente si elle existe
    if (sourceRef.current) {
      sourceRef.current.stop();
    }

    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start(0, startTime);

    sourceRef.current = source;
  }, [audioContext]);

  /**
   * Arrêter la lecture
   */
  const stopAudio = useCallback(() => {
    if (sourceRef.current) {
      sourceRef.current.stop();
      sourceRef.current = null;
    }
  }, []);

  return {
    audioContext,
    loadAudio,
    playAudio,
    stopAudio,
    isLoading,
    error,
  };
}
