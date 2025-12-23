import { create } from 'zustand';
import type { GameState, Beatmap, HitResult, Note, PlayerState } from '@project/shared/types';
import { GAME } from '@project/shared/constants';

interface GameStore extends GameState {
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

  // Actions
  setBeatmap: (beatmap) => set({ beatmap, status: 'waiting' }),

  startGame: () => set({
    status: 'playing',
    currentTime: 0,
    players: [createInitialPlayer('player-1')],
  }),

  updateTime: (time) => set({ currentTime: time }),

  registerHit: (noteId, result) => {
    const state = get();
    if (!state.beatmap || state.status !== 'playing') return;

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
  }),
}));
