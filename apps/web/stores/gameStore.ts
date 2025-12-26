import { create } from 'zustand';
import type { GameState, Beatmap, HitResult, Note, PlayerState } from '@project/shared/types';
import { GAME } from '@project/shared/constants';

type SendInputFn = (noteId: string, result: HitResult, timestamp: number) => void;
type SendMissFn = (direction: string, timestamp: number) => void;

interface GameStore extends GameState {
  // Audio
  audioBuffer: AudioBuffer | null;
  setAudioBuffer: (audioBuffer: AudioBuffer | null) => void;

  // Multiplayer
  isMultiplayer: boolean;
  currentPlayerId: string | null;
  hitNoteIds: Set<string>; // Track which notes this player has hit (for multiplayer)
  setMultiplayer: (isMultiplayer: boolean) => void;
  setCurrentPlayerId: (playerId: string | null) => void;
  updateGameState: (state: Partial<GameState>) => void;
  setSendFunctions: (sendInput: SendInputFn | null, sendMiss: SendMissFn | null) => void;
  sendInputFn: SendInputFn | null;
  sendMissFn: SendMissFn | null;

  // Actions
  setBeatmap: (beatmap: Beatmap) => void;
  startGame: () => void;
  updateTime: (time: number) => void;
  registerHit: (noteId: string, result: HitResult) => void;
  registerMiss: () => void;
  resetGame: () => void;
}

const createInitialPlayer = (id: string): PlayerState => ({
  id,
  hp: GAME.INITIAL_HP,
  combo: 0,
  maxCombo: 0,
  score: 0,
  perfectCount: 0,
  goodCount: 0,
  missCount: 0,
});

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  roomId: 'solo',
  status: 'waiting',
  players: [createInitialPlayer('player-1')],
  beatmap: null,
  currentTime: 0,
  audioBuffer: null,
  isMultiplayer: false,
  currentPlayerId: null,
  hitNoteIds: new Set(),
  sendInputFn: null,
  sendMissFn: null,

  // Actions
  setAudioBuffer: (audioBuffer) => set({ audioBuffer }),

  setMultiplayer: (isMultiplayer) => set({ isMultiplayer }),

  setCurrentPlayerId: (playerId) => set({ currentPlayerId: playerId }),

  updateGameState: (state) => set((current) => {
    // Ensure we create new references for nested objects to trigger re-renders
    if (state.players) {
      return {
        ...current,
        ...state,
        players: state.players.map(p => ({ ...p })),
      };
    }
    return { ...current, ...state };
  }),

  setSendFunctions: (sendInputFn, sendMissFn) => set({ sendInputFn, sendMissFn }),

  setBeatmap: (beatmap) => set({ beatmap, status: 'waiting' }),

  startGame: () => {
    const state = get();
    set({
      status: 'playing',
      currentTime: 0,
      hitNoteIds: new Set(), // Reset hit notes when starting game
      // In multiplayer, keep existing players; in solo, reset to single player
      players: state.isMultiplayer ? state.players : [createInitialPlayer('player-1')],
    });
  },

  updateTime: (time) => set({ currentTime: time }),

  registerHit: (noteId, result) => {
    const state = get();
    if (!state.beatmap || state.status !== 'playing') return;

    // In multiplayer mode, send input to server
    if (state.isMultiplayer && state.sendInputFn) {
      state.sendInputFn(noteId, result, Date.now());

      // Only track that this note has been hit locally (to prevent double-hitting)
      // DON'T update stats - let the server be the source of truth
      const newHitNoteIds = new Set(state.hitNoteIds);
      newHitNoteIds.add(noteId);

      set({ hitNoteIds: newHitNoteIds });
      return;
    }

    // Solo mode - update locally
    const player = state.players[0];
    const beatmap = state.beatmap;

    // Mettre à jour la note
    const updatedNotes = beatmap.notes.map(note =>
      note.id === noteId ? { ...note, isHit: true, hitResult: result } : note
    );

    // Mettre à jour le joueur selon le résultat
    let updatedPlayer = { ...player };

    if (result === 'miss') {
      updatedPlayer.combo = 0;
      updatedPlayer.missCount++;
    } else {
      updatedPlayer.combo++;
      updatedPlayer.maxCombo = Math.max(updatedPlayer.maxCombo, updatedPlayer.combo);

      if (result === 'perfect') {
        updatedPlayer.perfectCount++;
        updatedPlayer.score += 100 * (1 + updatedPlayer.combo * 0.01);
      } else {
        updatedPlayer.goodCount++;
        updatedPlayer.score += 50 * (1 + updatedPlayer.combo * 0.01);
      }
    }

    set({
      beatmap: { ...beatmap, notes: updatedNotes },
      players: [updatedPlayer],
    });
  },

  registerMiss: () => {
    const state = get();
    if (state.status !== 'playing') return;

    // In multiplayer mode, send miss to server
    if (state.isMultiplayer && state.sendMissFn) {
      state.sendMissFn('left', Date.now()); // Direction doesn't matter for empty miss
      // DON'T update stats - let the server be the source of truth
      return;
    }

    // Solo mode - update locally
    const player = state.players[0];
    set({
      players: [{
        ...player,
        combo: 0,
        missCount: player.missCount + 1,
      }],
    });
  },

  resetGame: () => set({
    status: 'waiting',
    currentTime: 0,
    players: [createInitialPlayer('player-1')],
    beatmap: null,
    audioBuffer: null,
    hitNoteIds: new Set(),
  }),
}));
