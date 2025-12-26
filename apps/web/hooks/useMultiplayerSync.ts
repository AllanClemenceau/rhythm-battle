'use client';

import { useEffect } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { usePartySocket } from './usePartySocket';

/**
 * Hook to sync multiplayer game state with the server
 */
export function useMultiplayerSync(roomId: string | null, isMultiplayer: boolean) {
  const { status } = useGameStore();
  const partySocket = usePartySocket(roomId || '');

  // Listen to server messages and update game state
  useEffect(() => {
    if (!isMultiplayer || !roomId) return;

    // This hook will be expanded to listen to server messages
    console.log('🎮 Multiplayer sync active for room:', roomId);

  }, [isMultiplayer, roomId, status]);

  return {
    sendInput: partySocket.sendInput,
    sendMiss: partySocket.sendMiss,
    isConnected: partySocket.isConnected,
  };
}
