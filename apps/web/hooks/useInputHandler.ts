'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { DEFAULT_KEYS } from '@project/shared/constants';
import { evaluateHit, isInHitWindow } from '@/lib/game/scoring';
import type { Direction, HitResult } from '@project/shared/types';

export function useInputHandler() {
  const {
    beatmap,
    currentTime,
    status,
    registerHit,
    registerMiss,
  } = useGameStore();

  const lastInputTime = useRef<Record<Direction, number>>({
    left: 0,
    down: 0,
    up: 0,
    right: 0,
  });

  const [lastHitResult, setLastHitResult] = useState<HitResult | null>(null);

  // Trouver la note la plus proche pour une direction
  const findClosestNote = useCallback((direction: Direction) => {
    if (!beatmap) return null;

    const availableNotes = beatmap.notes.filter(
      note => note.direction === direction && !note.isHit
    );

    let closestNote = null;
    let closestDelta = Infinity;

    for (const note of availableNotes) {
      const delta = note.targetTime - currentTime;
      const absDelta = Math.abs(delta);

      if (absDelta < Math.abs(closestDelta) && isInHitWindow(delta)) {
        closestDelta = delta;
        closestNote = note;
      }
    }

    return closestNote ? { note: closestNote, delta: closestDelta } : null;
  }, [beatmap, currentTime]);

  // Handler pour une direction
  const handleInput = useCallback((direction: Direction) => {
    if (status !== 'playing') return;

    // Anti-spam: minimum 50ms entre inputs
    const now = performance.now();
    if (now - lastInputTime.current[direction] < 50) return;
    lastInputTime.current[direction] = now;

    const result = findClosestNote(direction);

    if (result) {
      const hitResult = evaluateHit(result.delta);
      registerHit(result.note.id, hitResult);
      setLastHitResult(hitResult);

      // Réinitialiser le feedback après un délai
      setTimeout(() => setLastHitResult(null), 500);
    } else {
      // Appui sans note = miss
      registerMiss();
      setLastHitResult('miss');
      setTimeout(() => setLastHitResult(null), 500);
    }
  }, [status, findClosestNote, registerHit, registerMiss]);

  // Keyboard listeners
  useEffect(() => {
    const keyToDirection: Record<string, Direction> = {
      [DEFAULT_KEYS.left]: 'left',
      [DEFAULT_KEYS.down]: 'down',
      [DEFAULT_KEYS.up]: 'up',
      [DEFAULT_KEYS.right]: 'right',
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const direction = keyToDirection[e.code];
      if (direction) {
        e.preventDefault();
        handleInput(direction);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleInput]);

  // Touch handlers pour mobile
  const createTouchHandler = useCallback((direction: Direction) => {
    return () => {
      handleInput(direction);
    };
  }, [handleInput]);

  return {
    handleInput,
    createTouchHandler,
    lastHitResult,
  };
}
