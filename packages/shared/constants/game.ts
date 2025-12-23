import type { Direction } from '../types';

// Timing windows (en ms)
export const TIMING = {
  PERFECT: 50,   // ±50ms = Perfect
  GOOD: 100,     // ±100ms = Good
  MISS: 150,     // >150ms = Miss
} as const;

// Scoring
export const SCORE = {
  PERFECT: 100,
  GOOD: 50,
  MISS: 0,
} as const;

// Gameplay
export const GAME = {
  DURATION: 60000,           // 60 secondes
  INITIAL_HP: 100,
  BASE_DAMAGE: 5,            // Dégâts de base sur miss
  COMBO_DAMAGE_MULTIPLIER: 0.5, // +0.5 dégâts par combo adverse
  COMEBACK_HP_THRESHOLD: 30, // En dessous, comeback mechanic actif
  COMEBACK_TIMING_BONUS: 20, // +20ms de fenêtre timing
  NOTE_TRAVEL_TIME: 2000,    // Temps pour qu'une note descende
  COUNTDOWN_DURATION: 3000,  // 3 secondes de countdown
} as const;

// Combo thresholds pour densité
export const COMBO_DENSITY = {
  0: 1,      // Base: 1 note par beat
  10: 1.5,   // x10 combo: 1.5 notes par beat
  25: 2,     // x25 combo: 2 notes par beat
  50: 3,     // x50 combo: 3 notes par beat (Ultimate unlock)
} as const;

// Input mapping par défaut
export const DEFAULT_KEYS: Record<Direction, string> = {
  left: 'ArrowLeft',
  down: 'ArrowDown',
  up: 'ArrowUp',
  right: 'ArrowRight',
};
