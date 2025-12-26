'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { usePartySocketContext } from '@/contexts/PartySocketContext';
import { useGameStore } from '@/stores/gameStore';
import AudioFileLoader from '@/components/lobby/AudioFileLoader';
import GameCanvas from '@/components/game/GameCanvas';
import type { Beatmap } from '@project/shared/types';
import type { AudioAnalysis } from '@/lib/audio/analyzer';

export default function WaitingRoomPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  const playerName = searchParams.get('name') || 'Player';

  const {
    isConnected,
    roomState,
    receivedBeatmap,
    countdownStartAt,
    currentPlayerId,
    joinRoom,
    setReady,
    submitBeatmap: sendBeatmap,
  } = usePartySocketContext();

  const { setBeatmap, setAudioBuffer, startGame, status, setMultiplayer, setCurrentPlayerId, updateGameState } = useGameStore();

  const [isReady, setIsReady] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [localBeatmap, setLocalBeatmap] = useState<Beatmap | null>(null);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const countdownStartedRef = useRef(false);

  // Rejoindre la room dès la connexion
  useEffect(() => {
    if (isConnected && !hasJoined) {
      joinRoom(playerName);
      setHasJoined(true);
      // Enable multiplayer mode
      setMultiplayer(true);
      updateGameState({ roomId });
    }
  }, [isConnected, hasJoined, joinRoom, playerName, setMultiplayer, updateGameState, roomId]);

  // Set current player ID when received from server
  useEffect(() => {
    if (currentPlayerId) {
      setCurrentPlayerId(currentPlayerId);
    }
  }, [currentPlayerId, setCurrentPlayerId]);

  // Initialize both players when room has 2 players
  useEffect(() => {
    if (roomState?.players.length === 2) {
      const playerStates = roomState.players.map(p => ({
        id: p.id,
        hp: 100,
        combo: 0,
        maxCombo: 0,
        score: 0,
        perfectCount: 0,
        goodCount: 0,
        missCount: 0,
      }));
      updateGameState({ players: playerStates as any });
    }
  }, [roomState?.players, updateGameState]);

  // When we receive a beatmap from the server, set it in the game store
  useEffect(() => {
    if (receivedBeatmap && !localBeatmap) {
      setLocalBeatmap(receivedBeatmap);
      setBeatmap(receivedBeatmap);
      // Note: We don't have the audioBuffer for received beatmaps
      // The audio will be loaded when the game starts
    }
  }, [receivedBeatmap, localBeatmap, setBeatmap]);

  const handleBeatmapGenerated = (beatmap: Beatmap, analysis: AudioAnalysis, audioBuffer: AudioBuffer) => {
    setLocalBeatmap(beatmap);
    setBeatmap(beatmap);
    setAudioBuffer(audioBuffer);
    // Envoyer la beatmap aux autres joueurs
    sendBeatmap(beatmap);
  };

  const handleToggleReady = () => {
    const newReady = !isReady;
    setIsReady(newReady);
    setReady(newReady);
  };

  // Listen to server countdown
  useEffect(() => {
    if (!countdownStartAt || countdownStartedRef.current) return;

    countdownStartedRef.current = true;
    setShowCountdown(true);

    // Start at 3 and count down every second
    let remaining = 3;
    setCountdown(remaining);

    const interval = setInterval(() => {
      remaining--;

      if (remaining > 0) {
        setCountdown(remaining);
      } else {
        clearInterval(interval);
        setCountdown(0);
      }
    }, 1000); // Every second

    return () => clearInterval(interval);
  }, [countdownStartAt]);

  // Si le jeu a commencé, afficher le GameCanvas
  if (status === 'playing' || status === 'finished') {
    return <GameCanvas />;
  }

  // Countdown overlay
  if (showCountdown && status !== 'playing') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black">
        <div className="text-center">
          <div className="text-9xl font-bold text-white mb-4 animate-pulse">
            {countdown > 0 ? countdown : 'GO!'}
          </div>
          <p className="text-2xl text-gray-400">Get Ready!</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-b from-gray-900 via-gray-800 to-black">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent mb-2">
            Waiting Room
          </h1>
          <p className="text-gray-400">Room Code: <span className="text-white font-mono text-xl">{roomId}</span></p>
        </div>

        {/* Connection Status */}
        {!isConnected && (
          <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4 text-center">
            <p className="text-yellow-400">🔌 Connecting to server...</p>
          </div>
        )}

        {/* Players */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roomState?.players.map((player, index) => (
            <div
              key={player.id}
              className={`bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border ${
                player.ready ? 'border-green-500' : 'border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Player {index + 1}
                  </h3>
                  <p className="text-gray-400">{player.name}</p>
                </div>
                <div className="text-4xl">
                  {player.ready ? '✅' : '⏳'}
                </div>
              </div>
              {player.ready && (
                <p className="text-green-400 text-sm mt-2">Ready to battle!</p>
              )}
            </div>
          ))}

          {/* Empty slot */}
          {(!roomState || roomState.players.length < 2) && (
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-6 border border-dashed border-gray-600">
              <div className="text-center text-gray-500">
                <div className="text-4xl mb-2">👤</div>
                <p>Waiting for opponent...</p>
                <p className="text-sm mt-2">Share the room code!</p>
              </div>
            </div>
          )}
        </div>

        {/* Song Selection - show if no song has been submitted yet */}
        {!roomState?.songSubmitted && (
          <AudioFileLoader onBeatmapGenerated={handleBeatmapGenerated} />
        )}

        {/* Beatmap Status */}
        {(localBeatmap || receivedBeatmap) && (
          <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4 text-center">
            <p className="text-green-400">✅ Song loaded: Ready to battle!</p>
          </div>
        )}

        {/* Ready Button */}
        <div className="text-center">
          {(localBeatmap || receivedBeatmap) ? (
            <button
              onClick={handleToggleReady}
              className={`px-12 py-4 rounded-lg font-bold text-xl transition-all ${
                isReady
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              {isReady ? '✅ Ready!' : 'Ready Up'}
            </button>
          ) : roomState?.songSubmitted ? (
            <p className="text-blue-400">⏳ Loading song...</p>
          ) : (
            <p className="text-gray-500">Waiting for song to be loaded...</p>
          )}
        </div>

        {/* Status Messages */}
        {roomState?.players.length === 2 && (
          <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4 text-center">
            {roomState.players.every(p => p.ready) && roomState.songSubmitted ? (
              <p className="text-green-400 font-semibold">
                🎮 Both players ready! Starting soon...
              </p>
            ) : (
              <p className="text-blue-300">
                Waiting for both players to be ready...
              </p>
            )}
          </div>
        )}

        {/* Back button */}
        <div className="text-center">
          <Link
            href="/lobby"
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Leave Room
          </Link>
        </div>
      </div>
    </main>
  );
}
