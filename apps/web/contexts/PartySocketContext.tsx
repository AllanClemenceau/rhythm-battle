'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react';
import PartySocket from 'partysocket';
import type { ClientMessage, ServerMessage, RoomState } from '@project/shared/types';
import type { Beatmap, HitResult, Direction } from '@project/shared/types';
import { useGameStore } from '@/stores/gameStore';

const PARTYKIT_HOST = process.env.NEXT_PUBLIC_PARTYKIT_HOST || 'localhost:1999';

interface PartySocketContextValue {
  isConnected: boolean;
  roomState: RoomState | null;
  receivedBeatmap: Beatmap | null;
  countdownStartAt: number | null;
  currentPlayerId: string | null;
  joinRoom: (playerName: string) => void;
  setReady: (ready: boolean) => void;
  submitBeatmap: (beatmap: Beatmap) => void;
  sendInput: (noteId: string, result: HitResult, timestamp: number) => void;
  sendMiss: (direction: Direction, timestamp: number) => void;
}

const PartySocketContext = createContext<PartySocketContextValue | null>(null);

export function PartySocketProvider({ roomId, children }: { roomId: string; children: ReactNode }) {
  const socketRef = useRef<PartySocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [receivedBeatmap, setReceivedBeatmap] = useState<Beatmap | null>(null);
  const [countdownStartAt, setCountdownStartAt] = useState<number | null>(null);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const updateGameState = useGameStore(state => state.updateGameState);

  const handleMessage = useCallback((message: ServerMessage) => {
    switch (message.type) {
      case 'room_state':
        setRoomState(message.payload);
        break;
      case 'joined':
        // Server confirms our player ID
        setCurrentPlayerId(message.payload.playerId);
        break;
      case 'beatmap_received':
        setReceivedBeatmap(message.payload.beatmap);
        break;
      case 'countdown_start':
        setCountdownStartAt(message.payload.startAt);
        break;
      case 'game_start':
        updateGameState({
          status: 'playing',
          beatmap: message.payload.beatmap,
        });
        break;
      case 'game_update':
        // Sync game state from server
        const payload = message.payload;

        if (payload.players) {
          // Always update - let React handle re-render optimization
          // The server is the source of truth for multiplayer games
          updateGameState(payload);
        } else {
          // No players in payload, just update whatever was sent
          updateGameState(payload);
        }
        break;
      default:
        // Other messages handled elsewhere
        break;
    }
  }, [updateGameState]);

  useEffect(() => {
    const socket = new PartySocket({
      host: PARTYKIT_HOST,
      room: roomId,
    });

    socket.addEventListener('open', () => {
      setIsConnected(true);
    });

    socket.addEventListener('message', (event) => {
      try {
        const message: ServerMessage = JSON.parse(event.data);
        handleMessage(message);
      } catch (error) {
        console.error('[PartySocketProvider] Failed to parse message:', error);
      }
    });

    socket.addEventListener('close', () => {
      setIsConnected(false);
    });

    socket.addEventListener('error', (error) => {
      console.error('[PartySocketProvider] PartySocket error:', error);
    });

    socketRef.current = socket;

    return () => {
      socket.close();
    };
  }, [roomId, handleMessage]);

  const send = useCallback((message: ClientMessage) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    }
  }, []);

  const joinRoom = useCallback((playerName: string) => {
    send({ type: 'join', payload: { playerName } });
  }, [send]);

  const setReady = useCallback((ready: boolean) => {
    send({ type: 'ready', payload: { ready } });
  }, [send]);

  const submitBeatmap = useCallback((beatmap: Beatmap) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'set_beatmap',
        payload: { beatmap },
      }));
    }
  }, []);

  const sendInput = useCallback((noteId: string, result: HitResult, timestamp: number) => {
    send({ type: 'input', payload: { noteId, result, timestamp } });
  }, [send]);

  const sendMiss = useCallback((direction: Direction, timestamp: number) => {
    send({ type: 'miss', payload: { direction, timestamp } });
  }, [send]);

  return (
    <PartySocketContext.Provider
      value={{
        isConnected,
        roomState,
        receivedBeatmap,
        countdownStartAt,
        currentPlayerId,
        joinRoom,
        setReady,
        submitBeatmap,
        sendInput,
        sendMiss,
      }}
    >
      {children}
    </PartySocketContext.Provider>
  );
}

export function usePartySocketContext() {
  const context = useContext(PartySocketContext);
  if (!context) {
    // Return null if not in provider (for solo mode)
    return null;
  }
  return context;
}
