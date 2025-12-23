'use client';

import type { Note as NoteType } from '@project/shared/types';

interface NoteProps {
  note: NoteType;
  yPosition: number;
  color: string;
}

export default function Note({ note, yPosition, color }: NoteProps) {
  // Si la note est déjà hit, on peut la rendre semi-transparente
  const opacity = note.isHit ? 'opacity-30' : 'opacity-100';

  return (
    <div
      className={`absolute left-1/2 -translate-x-1/2 w-16 h-4 rounded-md ${color} ${opacity} transition-opacity duration-150`}
      style={{
        top: `${yPosition}px`,
      }}
    >
      {/* Effet de glow */}
      <div className={`absolute inset-0 ${color} blur-sm opacity-50`} />
    </div>
  );
}
