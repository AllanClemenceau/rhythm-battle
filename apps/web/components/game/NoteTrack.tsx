'use client';

import { useMemo } from 'react';
import Note from './Note';
import { GAME } from '@project/shared/constants';
import type { Note as NoteType, Direction } from '@project/shared/types';

interface NoteTrackProps {
  direction: Direction;
  notes: NoteType[];
  currentTime: number;
}

const TRACK_HEIGHT = 600; // px
const HIT_ZONE_Y = TRACK_HEIGHT - 80; // Position de la zone de hit

const DIRECTION_COLORS: Record<Direction, string> = {
  left: 'bg-pink-500',
  down: 'bg-blue-500',
  up: 'bg-green-500',
  right: 'bg-yellow-500',
};

const DIRECTION_ARROWS: Record<Direction, string> = {
  left: '←',
  down: '↓',
  up: '↑',
  right: '→',
};

export default function NoteTrack({ direction, notes, currentTime }: NoteTrackProps) {
  // Filtrer les notes visibles (dans la fenêtre de temps)
  const visibleNotes = useMemo(() => {
    return notes.filter(note => {
      const timeUntilHit = note.targetTime - currentTime;
      // Note visible si elle doit arriver dans les prochaines 2s
      // et n'est pas déjà passée de plus de 200ms
      return timeUntilHit <= GAME.NOTE_TRAVEL_TIME && timeUntilHit > -200;
    });
  }, [notes, currentTime]);

  // Calculer la position Y de chaque note
  const getYPosition = (note: NoteType) => {
    const timeUntilHit = note.targetTime - currentTime;
    const progress = 1 - (timeUntilHit / GAME.NOTE_TRAVEL_TIME);
    return progress * HIT_ZONE_Y;
  };

  return (
    <div
      className="relative w-20 bg-gray-800/50 rounded-lg overflow-hidden border-2 border-gray-700"
      style={{ height: TRACK_HEIGHT }}
    >
      {/* Ligne de la piste */}
      <div className="absolute inset-0 border-l-2 border-r-2 border-gray-600/30" />

      {/* Notes */}
      {visibleNotes.map(note => (
        <Note
          key={note.id}
          note={note}
          yPosition={getYPosition(note)}
          color={DIRECTION_COLORS[direction]}
        />
      ))}

      {/* Zone de hit (en bas) */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-20 flex items-center justify-center border-4 ${DIRECTION_COLORS[direction]} border-opacity-50 bg-gray-900/80 rounded-b-lg`}
      >
        <span className="text-4xl font-bold text-white/40">
          {DIRECTION_ARROWS[direction]}
        </span>
      </div>
    </div>
  );
}
