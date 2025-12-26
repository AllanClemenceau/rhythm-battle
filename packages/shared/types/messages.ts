import type { GameState, PlayerState, HitResult, Direction, Beatmap } from './game';

// Client -> Server
export type ClientMessage =
  | { type: 'join'; payload: { playerName: string } }
  | { type: 'ready'; payload: { ready: boolean } }
  | { type: 'submit_song'; payload: { youtubeUrl: string; startTime?: number } }
  | { type: 'input'; payload: { noteId: string; result: HitResult; timestamp: number } }
  | { type: 'miss'; payload: { direction: Direction; timestamp: number } };

// Server -> Client
export type ServerMessage =
  | { type: 'room_state'; payload: RoomState }
  | { type: 'joined'; payload: { playerId: string } }
  | { type: 'player_joined'; payload: { player: PlayerState } }
  | { type: 'player_left'; payload: { playerId: string } }
  | { type: 'player_ready'; payload: { playerId: string; ready: boolean } }
  | { type: 'beatmap_received'; payload: { beatmap: Beatmap } }
  | { type: 'countdown_start'; payload: { startAt: number } }
  | { type: 'game_start'; payload: { beatmap: Beatmap; audioUrl: string } }
  | { type: 'game_update'; payload: GameState }
  | { type: 'hit_registered'; payload: { playerId: string; noteId: string; result: HitResult } }
  | { type: 'damage_dealt'; payload: { fromId: string; toId: string; damage: number } }
  | { type: 'game_end'; payload: { winner: string; finalState: GameState } }
  | { type: 'error'; payload: { message: string } };

export interface RoomState {
  roomId: string;
  players: Array<{
    id: string;
    name: string;
    ready: boolean;
  }>;
  songSubmitted: boolean;
  youtubeUrl?: string;
}
