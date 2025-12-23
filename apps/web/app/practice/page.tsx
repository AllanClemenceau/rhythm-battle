'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AudioFileLoader from '@/components/lobby/AudioFileLoader';
import GameCanvas from '@/components/game/GameCanvas';
import { useGameStore } from '@/stores/gameStore';
import type { Beatmap } from '@project/shared/types';
import type { AudioAnalysis } from '@/lib/audio/analyzer';

export default function PracticePage() {
  const router = useRouter();
  const { setBeatmap, startGame, resetGame, status } = useGameStore();
  const [analysis, setAnalysis] = useState<AudioAnalysis | null>(null);
  const [isReady, setIsReady] = useState(false);

  const handleBeatmapGenerated = (beatmap: Beatmap, audioAnalysis: AudioAnalysis) => {
    setBeatmap(beatmap);
    setAnalysis(audioAnalysis);
    setIsReady(true);
  };

  const handleStart = () => {
    startGame();
  };

  const handleRestart = () => {
    resetGame();
    setIsReady(false);
    setAnalysis(null);
  };

  const handleBack = () => {
    router.push('/');
  };

  if (isReady && status !== 'waiting') {
    return (
      <div className="relative">
        <GameCanvas />

        {/* Overlay pour contrôles */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
          {status === 'waiting' && (
            <div className="pointer-events-auto">
              <button
                onClick={handleStart}
                className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-2xl rounded-lg shadow-lg transition-colors"
              >
                START GAME
              </button>
            </div>
          )}

          {status === 'finished' && (
            <div className="pointer-events-auto bg-gray-800/95 backdrop-blur-sm rounded-lg p-8 text-center">
              <h2 className="text-4xl font-bold text-white mb-4">Song Complete!</h2>
              <div className="flex gap-4">
                <button
                  onClick={handleRestart}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors"
                >
                  Try Another Song
                </button>
                <button
                  onClick={handleBack}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-colors"
                >
                  Back to Menu
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Instructions en bas */}
        {status === 'waiting' && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10">
            <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg px-6 py-4">
              <div className="text-center">
                <p className="text-white font-semibold mb-2">
                  {analysis && `${Math.round(analysis.bpm)} BPM • ${analysis.beats.length} beats detected`}
                </p>
                <div className="flex gap-6 text-sm">
                  <div>
                    <span className="text-pink-400">←</span>
                    <span className="text-gray-400 ml-2">Left</span>
                  </div>
                  <div>
                    <span className="text-blue-400">↓</span>
                    <span className="text-gray-400 ml-2">Down</span>
                  </div>
                  <div>
                    <span className="text-green-400">↑</span>
                    <span className="text-gray-400 ml-2">Up</span>
                  </div>
                  <div>
                    <span className="text-yellow-400">→</span>
                    <span className="text-gray-400 ml-2">Right</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-b from-gray-900 via-gray-800 to-black">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent mb-4">
            Practice Mode
          </h1>
          <p className="text-gray-400 text-lg">
            Load your own music and practice your rhythm skills!
          </p>
        </div>

        <AudioFileLoader onBeatmapGenerated={handleBeatmapGenerated} />

        {isReady && (
          <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-6 text-center animate-fade-in">
            <p className="text-green-400 font-semibold mb-4">
              ✓ Beatmap generated successfully!
            </p>
            <button
              onClick={handleStart}
              className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xl rounded-lg transition-colors"
            >
              Start Playing
            </button>
          </div>
        )}

        <div className="flex justify-center gap-4">
          <Link
            href="/game/test"
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors"
          >
            Try Test Mode
          </Link>
          <Link
            href="/"
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
