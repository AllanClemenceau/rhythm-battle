'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { v4 as uuid } from 'uuid';

export default function CreateLobbyPage() {
  const router = useRouter();
  const [playerName, setPlayerName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = () => {
    if (!playerName.trim()) {
      alert('Please enter your name');
      return;
    }

    setIsCreating(true);
    // Créer un ID de room unique
    const roomId = uuid().slice(0, 8);
    // Rediriger vers la waiting room
    router.push(`/lobby/${roomId}?name=${encodeURIComponent(playerName)}`);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-b from-gray-900 via-gray-800 to-black">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent mb-4">
            Create Room
          </h1>
          <p className="text-gray-400 text-lg">
            Create a private room and invite your friends!
          </p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 space-y-4">
          <div>
            <label htmlFor="player-name" className="block text-sm text-gray-400 mb-2">
              Your Name
            </label>
            <input
              id="player-name"
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="Enter your name..."
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              maxLength={20}
            />
          </div>

          <button
            onClick={handleCreate}
            disabled={isCreating || !playerName.trim()}
            className="w-full px-8 py-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold text-lg transition-colors"
          >
            {isCreating ? 'Creating...' : 'Create Room'}
          </button>
        </div>

        <div className="text-center">
          <Link
            href="/lobby"
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Back to Lobby
          </Link>
        </div>
      </div>
    </main>
  );
}
