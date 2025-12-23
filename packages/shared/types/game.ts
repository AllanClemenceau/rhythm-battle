export type Direction = 'left' | 'down' | 'up' | 'right';

export type HitResult = 'perfect' | 'good' | 'miss';

export interface Note {
  id: string;
  direction: Direction;
  targetTime: number; // ms depuis début de la chanson
  isHit: boolean;
  hitResult?: HitResult;
}

export interface Beatmap {
  id: string;
  youtubeUrl: string;
  bpm: number;
  startTime: number; // timestamp début du segment 60s
  duration: number;  // toujours 60000ms
  notes: Note[];
}

export interface PlayerState {
  id: string;
  hp: number;          // 0-100
  combo: number;
  maxCombo: number;
  score: number;
  perfectCount: number;
  goodCount: number;
  missCount: number;
}

export interface GameState {
  roomId: string;
  status: 'waiting' | 'countdown' | 'playing' | 'finished';
  players: [PlayerState, PlayerState] | [PlayerState];
  beatmap: Beatmap | null;
  currentTime: number;
  winner?: string;
}
