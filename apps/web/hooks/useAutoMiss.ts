'use client';

import { useEffect, useRef } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { TIMING } from '@project/shared/constants';

/**
 * Hook to automatically register misses for notes that pass the hit window
 */
export function useAutoMiss() {
  const { beatmap, currentTime, status, isMultiplayer, hitNoteIds, registerHit } = useGameStore();
  const processedNotesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (status !== 'playing' || !beatmap) {
      // Reset processed notes when not playing
      processedNotesRef.current.clear();
      return;
    }

    // Check for notes that have passed the hit window
    // Use a LARGER threshold than the hit window to avoid marking notes too early
    // Player has TIMING.MISS (150ms) to hit, so only auto-miss after 300ms
    const missThreshold = TIMING.MISS * 2; // 300ms past the target time

    for (const note of beatmap.notes) {
      // In multiplayer, check if we've hit it locally; in solo, check note.isHit
      const alreadyHit = isMultiplayer ? hitNoteIds.has(note.id) : note.isHit;

      // Skip if already hit OR already processed as a miss by this system
      if (alreadyHit || processedNotesRef.current.has(note.id)) {
        continue;
      }

      // Calculate how far past the target time we are
      const timePast = currentTime - note.targetTime;

      // If note has passed FAR beyond the miss threshold, auto-register as miss
      // This should only happen for notes the player completely ignored
      if (timePast > missThreshold) {
        registerHit(note.id, 'miss');
        processedNotesRef.current.add(note.id);
      }
    }
  }, [beatmap, currentTime, status, isMultiplayer, hitNoteIds, registerHit]);
}
