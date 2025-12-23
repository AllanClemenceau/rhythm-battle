import { TIMING, SCORE } from '@project/shared/constants';
import type { HitResult } from '@project/shared/types';

/**
 * Évalue le timing d'un hit et retourne le résultat
 */
export function evaluateHit(timingDelta: number): HitResult {
  const absDelta = Math.abs(timingDelta);

  if (absDelta <= TIMING.PERFECT) {
    return 'perfect';
  }
  if (absDelta <= TIMING.GOOD) {
    return 'good';
  }
  return 'miss';
}

/**
 * Calcule le score pour un hit
 */
export function calculateHitScore(result: HitResult, combo: number): number {
  const baseScore = SCORE[result.toUpperCase() as keyof typeof SCORE];
  const comboMultiplier = 1 + combo * 0.01; // +1% par combo
  return Math.floor(baseScore * comboMultiplier);
}

/**
 * Vérifie si un timing est dans la fenêtre de hit acceptable
 */
export function isInHitWindow(timingDelta: number): boolean {
  return Math.abs(timingDelta) <= TIMING.MISS;
}

/**
 * Retourne la couleur du feedback selon le résultat
 */
export function getHitResultColor(result: HitResult): string {
  switch (result) {
    case 'perfect':
      return 'text-yellow-400';
    case 'good':
      return 'text-green-400';
    case 'miss':
      return 'text-red-400';
  }
}

/**
 * Retourne le texte du feedback selon le résultat
 */
export function getHitResultText(result: HitResult): string {
  switch (result) {
    case 'perfect':
      return 'PERFECT!';
    case 'good':
      return 'GOOD';
    case 'miss':
      return 'MISS';
  }
}
