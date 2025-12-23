import { v4 as uuid } from 'uuid';
import type { Note, Direction, Beatmap } from '@project/shared/types';
import type { AudioAnalysis } from './analyzer';

const DIRECTIONS: Direction[] = ['left', 'down', 'up', 'right'];

export interface BeatmapGenerationOptions {
  difficulty?: 'easy' | 'medium' | 'hard';
  useOnsets?: boolean; // Utiliser les onsets en plus des beats
  startTime?: number; // Timestamp de début (ms)
  duration?: number; // Durée (ms)
}

/**
 * Génère une beatmap à partir d'une analyse audio
 */
export function generateBeatmap(
  analysis: AudioAnalysis,
  options: BeatmapGenerationOptions = {}
): Beatmap {
  const {
    difficulty = 'medium',
    useOnsets = true,
    startTime = 0,
    duration = 60000,
  } = options;

  const endTime = startTime + duration;
  const notes: Note[] = [];

  // Filtrer les beats dans notre segment
  const segmentBeats = analysis.beats.filter(
    b => b >= startTime && b <= endTime
  );

  // Filtrer les onsets dans notre segment (si activé)
  const segmentOnsets = useOnsets
    ? analysis.onsets.filter(o => o >= startTime && o <= endTime)
    : [];

  // Générer des notes sur les beats principaux
  let lastDirection: Direction | null = null;

  for (const beat of segmentBeats) {
    // Choisir une direction différente de la précédente
    const availableDirections = DIRECTIONS.filter(d => d !== lastDirection);
    const direction = availableDirections[
      Math.floor(Math.random() * availableDirections.length)
    ];
    lastDirection = direction;

    notes.push({
      id: uuid(),
      direction,
      targetTime: beat - startTime, // Relatif au début du segment
      isHit: false,
    });
  }

  // Ajouter des notes sur les onsets (selon la difficulté)
  if (useOnsets) {
    const onsetProbability = difficulty === 'easy' ? 0.2 : difficulty === 'medium' ? 0.4 : 0.6;

    for (const onset of segmentOnsets) {
      const relativeTime = onset - startTime;

      // Vérifier qu'il n'y a pas déjà une note trop proche
      const hasNearbyNote = notes.some(
        n => Math.abs(n.targetTime - relativeTime) < 150
      );

      if (!hasNearbyNote && Math.random() < onsetProbability) {
        const direction = DIRECTIONS[Math.floor(Math.random() * 4)];
        notes.push({
          id: uuid(),
          direction,
          targetTime: relativeTime,
          isHit: false,
        });
      }
    }
  }

  // Trier par temps
  notes.sort((a, b) => a.targetTime - b.targetTime);

  // Ajuster la densité selon la difficulté
  const filteredNotes = adjustDensity(notes, difficulty);

  return {
    id: uuid(),
    youtubeUrl: '',
    bpm: analysis.bpm,
    startTime,
    duration,
    notes: filteredNotes,
  };
}

/**
 * Ajuste la densité des notes selon la difficulté
 */
function adjustDensity(notes: Note[], difficulty: 'easy' | 'medium' | 'hard'): Note[] {
  if (difficulty === 'easy') {
    // Garder une note sur deux
    return notes.filter((_, i) => i % 2 === 0);
  }

  if (difficulty === 'hard') {
    // Garder toutes les notes
    return notes;
  }

  // Medium: garder 75% des notes
  return notes.filter(() => Math.random() > 0.25);
}

/**
 * Crée une beatmap depuis un fichier audio
 */
export async function createBeatmapFromAudio(
  audioBuffer: AudioBuffer,
  options: BeatmapGenerationOptions = {}
): Promise<{ beatmap: Beatmap; analysis: AudioAnalysis }> {
  // Cette fonction sera utilisée quand on aura l'analyseur audio intégré
  // Pour l'instant, c'est un placeholder
  throw new Error('Audio analysis not yet implemented. Use generateBeatmap with analysis instead.');
}
