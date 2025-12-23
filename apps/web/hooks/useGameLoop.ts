'use client';

import { useEffect, useRef } from 'react';
import { useGameStore } from '@/stores/gameStore';

/**
 * Hook qui gère la boucle de jeu avec requestAnimationFrame
 * Met à jour le currentTime du jeu à 60 FPS
 */
export function useGameLoop() {
  const status = useGameStore((state) => state.status);
  const updateTime = useGameStore((state) => state.updateTime);
  const startTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (status !== 'playing') {
      startTimeRef.current = null;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const gameLoop = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      updateTime(elapsed);

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [status, updateTime]);
}
