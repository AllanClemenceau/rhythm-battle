'use client';

import type { Note as NoteType, Direction } from '@project/shared/types';

interface NoteProps {
  note: NoteType;
  yPosition: number;
  color: string;
  direction: Direction;
}

const DIRECTION_ARROWS: Record<Direction, string> = {
  left: '←',
  down: '↓',
  up: '↑',
  right: '→',
};

export default function Note({ note, yPosition, color, direction }: NoteProps) {
  // Si la note est déjà hit, on peut la rendre semi-transparente
  const opacity = note.isHit ? 'opacity-30' : 'opacity-100';

  return (
    <div
      className={`absolute left-1/2 -translate-x-1/2 w-16 h-16 flex items-center justify-center ${opacity} transition-opacity duration-150`}
      style={{
        top: `${yPosition}px`,
      }}
    >
      {/* Flèche avec effet de glow */}
      <div className={`absolute inset-0 ${color} blur-md opacity-60 rounded-lg`} />
      <span className={`relative text-5xl font-bold text-white z-10`}>
        {DIRECTION_ARROWS[direction]}
      </span>
    </div>
  );
}
