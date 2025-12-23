'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import GameCanvas from '@/components/game/GameCanvas';
import { useGameStore } from '@/stores/gameStore';
import { createSimpleBeatmap } from '@/lib/utils/testBeatmap';

export default function TestGamePage() {
  const router = useRouter();
  const { setBeatmap, startGame, resetGame, status } = useGameStore();

  useEffect(() => {
    // Charger la beatmap de test au montage
    const beatmap = createSimpleBeatmap();
    setBeatmap(beatmap);
  }, [setBeatmap]);

  const handleStart = () => {
    startGame();
  };

  const handleRestart = () => {
    resetGame();
    const beatmap = createSimpleBeatmap();
    setBeatmap(beatmap);
  };

  const handleBack = () => {
    router.push('/');
  };

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
            <h2 className="text-4xl font-bold text-white mb-4">Game Over!</h2>
            <div className="flex gap-4">
              <button
                onClick={handleRestart}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors"
              >
                Play Again
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
              <p className="text-white font-semibold mb-2">🎮 Controls</p>
              <div className="flex gap-6 text-sm">
                <div>
                  <span className="text-pink-400">←</span>
                  <span className="text-gray-400 ml-2">Left Arrow</span>
                </div>
                <div>
                  <span className="text-blue-400">↓</span>
                  <span className="text-gray-400 ml-2">Down Arrow</span>
                </div>
                <div>
                  <span className="text-green-400">↑</span>
                  <span className="text-gray-400 ml-2">Up Arrow</span>
                </div>
                <div>
                  <span className="text-yellow-400">→</span>
                  <span className="text-gray-400 ml-2">Right Arrow</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
