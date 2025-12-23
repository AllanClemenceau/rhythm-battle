import type { Beatmap, Direction } from '@project/shared/types';
import { v4 as uuid } from 'uuid';

/**
 * Génère une beatmap de test simple pour valider le gameplay
 * Pattern simple: alternance de directions sur le beat
 */
export function createTestBeatmap(): Beatmap {
  const bpm = 120; // 120 BPM = 500ms par beat
  const beatInterval = 60000 / bpm; // ms par beat
  const directions: Direction[] = ['left', 'down', 'up', 'right'];

  const notes = [];
  let currentTime = 2000; // Commence après 2 secondes

  // Génère 60 notes sur 30 secondes (pour tester)
  for (let i = 0; i < 60; i++) {
    const direction = directions[i % 4]; // Alternance circulaire

    notes.push({
      id: uuid(),
      direction,
      targetTime: currentTime,
      isHit: false,
    });

    // Varie l'intervalle pour créer un pattern intéressant
    if (i % 8 < 4) {
      currentTime += beatInterval; // Un beat
    } else {
      currentTime += beatInterval / 2; // Demi-beat (plus rapide)
    }
  }

  return {
    id: 'test-beatmap',
    youtubeUrl: '',
    bpm,
    startTime: 0,
    duration: 60000,
    notes,
  };
}

/**
 * Génère une beatmap plus simple pour débuter
 */
export function createSimpleBeatmap(): Beatmap {
  const directions: Direction[] = ['left', 'down', 'up', 'right'];
  const notes = [];

  // Pattern très simple: une note toutes les secondes
  for (let i = 0; i < 20; i++) {
    notes.push({
      id: uuid(),
      direction: directions[i % 4],
      targetTime: (i + 2) * 1000, // Une note par seconde, commence à 2s
      isHit: false,
    });
  }

  return {
    id: 'simple-beatmap',
    youtubeUrl: '',
    bpm: 60,
    startTime: 0,
    duration: 60000,
    notes,
  };
}
