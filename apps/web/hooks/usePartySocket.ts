'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import PartySocket from 'partysocket';
import type { ClientMessage, ServerMessage, RoomState } from '@project/shared/types';
import type { Beatmap, HitResult, Direction } from '@project/shared/types';
import { useGameStore } from '@/stores/gameStore';

const PARTYKIT_HOST = process.env.NEXT_PUBLIC_PARTYKIT_HOST || 'localhost:1999';

interface UsePartySocketReturn {
  isConnected: boolean;
  roomState: RoomState | null;
  receivedBeatmap: Beatmap | null;
  countdownStartAt: number | null;
  joinRoom: (playerName: string) => void;
  setReady: (ready: boolean) => void;
  submitSong: (youtubeUrl: string, startTime?: number) => void;
  submitBeatmap: (beatmap: Beatmap) => void;
  sendInput: (noteId: string, result: HitResult, timestamp: number) => void;
  sendMiss: (direction: Direction, timestamp: number) => void;
}

export function usePartySocket(roomId: string): UsePartySocketReturn {
  const socketRef = useRef<PartySocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [receivedBeatmap, setReceivedBeatmap] = useState<Beatmap | null>(null);
  const [countdownStartAt, setCountdownStartAt] = useState<number | null>(null);
  const updateGameState = useGameStore(state => state.updateGameState);

  useEffect(() => {
    console.log('🔌 Connecting to PartyKit...', { roomId, host: PARTYKIT_HOST });

    const socket = new PartySocket({
      host: PARTYKIT_HOST,
      room: roomId,
    });

    socket.addEventListener('open', () => {
      console.log('✅ Connected to PartyKit room:', roomId);
      setIsConnected(true);
    });

    socket.addEventListener('message', (event) => {
      try {
        const message: ServerMessage = JSON.parse(event.data);
        handleMessage(message);
      } catch (error) {
        console.error('Failed to parse message:', error);
      }
    });

    socket.addEventListener('close', () => {
      console.log('🔌 Disconnected from PartyKit');
      setIsConnected(false);
    });

    socket.addEventListener('error', (error) => {
      console.error('PartySocket error:', error);
    });

    socketRef.current = socket;

    return () => {
      socket.close();
    };
  }, [roomId]);

  const handleMessage = useCallback((message: ServerMessage) => {
    console.log('📨 Message from server:', message);

    switch (message.type) {
      case 'room_state':
        setRoomState(message.payload);
        break;
      case 'player_joined':
        // Géré par le composant qui écoute roomState
        break;
      case 'player_left':
        // Géré par le composant
        break;
      case 'player_ready':
        // Géré par le composant
        break;
      case 'beatmap_received':
        console.log('🎵 Beatmap received from server:', message.payload.beatmap);
        setReceivedBeatmap(message.payload.beatmap);
        break;
      case 'countdown_start':
        console.log('⏱️ Countdown starting at:', message.payload.startAt);
        setCountdownStartAt(message.payload.startAt);
        break;
      case 'game_start':
        console.log('🎮 Game starting:', message.payload);
        updateGameState({
          status: 'playing',
          beatmap: message.payload.beatmap,
        });
        break;
      case 'game_update':
        // Sync game state from server
        updateGameState(message.payload);
        break;
      case 'hit_registered':
        // Géré par le composant de jeu
        break;
      case 'damage_dealt':
        // Géré par le composant de jeu
        break;
      case 'game_end':
        // Géré par le composant de jeu
        break;
      case 'error':
        console.error('Server error:', message.payload.message);
        break;
    }
  }, [updateGameState]);

  const send = useCallback((message: ClientMessage) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
      console.log('📤 Sent to server:', message);
    } else {
      console.warn('Cannot send message, socket not connected');
    }
  }, []);

  const joinRoom = useCallback((playerName: string) => {
    send({ type: 'join', payload: { playerName } });
  }, [send]);

  const setReady = useCallback((ready: boolean) => {
    send({ type: 'ready', payload: { ready } });
  }, [send]);

  const submitSong = useCallback((youtubeUrl: string, startTime?: number) => {
    send({ type: 'submit_song', payload: { youtubeUrl, startTime } });
  }, [send]);

  const submitBeatmap = useCallback((beatmap: Beatmap) => {
    // Envoyer la beatmap via un message custom
    // Le serveur devra gérer ce message
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

  return {
    isConnected,
    roomState,
    receivedBeatmap,
    countdownStartAt,
    joinRoom,
    setReady,
    submitSong,
    submitBeatmap,
    sendInput,
    sendMiss,
  };
}
