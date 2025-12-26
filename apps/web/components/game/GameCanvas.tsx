'use client';

import { useGameLoop } from '@/hooks/useGameLoop';
import { useGameAudio } from '@/hooks/useGameAudio';
import { useGameStore } from '@/stores/gameStore';
import { useInputHandler } from '@/hooks/useInputHandler';
import { useAutoMiss } from '@/hooks/useAutoMiss';
import { usePartySocketContext } from '@/contexts/PartySocketContext';
import { useEffect } from 'react';
import NoteTrack from './NoteTrack';
import PlayerHUD from './PlayerHUD';
import OpponentHUD from './OpponentHUD';
import HitFeedback from './HitFeedback';
import type { Direction } from '@project/shared/types';

const TRACK_ORDER: Direction[] = ['left', 'down', 'up', 'right'];

export default function GameCanvas() {
  const { beatmap, currentTime, players, status, isMultiplayer, setSendFunctions } = useGameStore();
  const { lastHitResult } = useInputHandler();

  // Get PartySocket from context (only available in multiplayer)
  const partySocket = usePartySocketContext();

  // Determine which player is "me" vs "opponent" based on player ID
  const currentPlayerId = partySocket?.currentPlayerId;
  const myPlayerIndex = players.findIndex(p => p.id === currentPlayerId);
  const currentPlayer = myPlayerIndex !== -1 ? players[myPlayerIndex] : players[0];
  const opponentPlayer = myPlayerIndex !== -1 ? players[1 - myPlayerIndex] : players[1];


  // Set send functions for multiplayer mode
  useEffect(() => {
    if (isMultiplayer && partySocket) {
      setSendFunctions(partySocket.sendInput, partySocket.sendMiss);
    } else {
      setSendFunctions(null, null);
    }
  }, [isMultiplayer, setSendFunctions, partySocket]);

  useGameLoop(); // Active la boucle de jeu
  useGameAudio(); // Active la lecture audio synchronisée
  useAutoMiss(); // Auto-register misses for notes that pass without being hit (fixed threshold)

  if (!beatmap) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400 text-xl">No beatmap loaded</div>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black overflow-hidden">
      {/* HUD Joueur */}
      <div className="absolute top-4 left-4 z-10">
        <PlayerHUD player={currentPlayer} />
      </div>

      {/* HUD Adversaire (si multijoueur) */}
      {isMultiplayer && opponentPlayer && (
        <div className="absolute top-4 right-4 z-10">
          <OpponentHUD player={opponentPlayer} />
        </div>
      )}

      {/* Timer (décalé si multijoueur) */}
      <div className={`absolute top-4 z-10 bg-gray-800/90 backdrop-blur-sm rounded-lg p-4 ${
        isMultiplayer ? 'left-1/2 -translate-x-1/2' : 'right-4'
      }`}>
        <div className="text-center">
          <div className="text-gray-400 text-sm mb-1">Time</div>
          <div className="text-3xl font-bold text-white">
            {Math.floor(currentTime / 1000)}s
          </div>
        </div>
      </div>

      {/* Zone de jeu centrale */}
      <div className="absolute inset-0 flex justify-center items-center">
        <div className="relative flex gap-4">
          {TRACK_ORDER.map((direction) => (
            <NoteTrack
              key={direction}
              direction={direction}
              notes={beatmap.notes.filter(n => n.direction === direction)}
              currentTime={currentTime}
            />
          ))}
        </div>
      </div>

      {/* Hit Feedback */}
      <HitFeedback result={lastHitResult} />

      {/* Instructions (si pas encore started) */}
      {status === 'waiting' && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center z-10">
          <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-6">
            <p className="text-white text-lg mb-2">Use arrow keys to hit the notes!</p>
            <p className="text-gray-400 text-sm">Hit the notes when they reach the bottom zone</p>
          </div>
        </div>
      )}
    </div>
  );
}
