'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function JoinLobbyPage() {
  const router = useRouter();
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleJoin = () => {
    if (!playerName.trim()) {
      alert('Please enter your name');
      return;
    }

    if (!roomCode.trim()) {
      alert('Please enter a room code');
      return;
    }

    setIsJoining(true);
    // Rediriger vers la waiting room (normalize to lowercase)
    router.push(`/lobby/${roomCode.trim().toLowerCase()}?name=${encodeURIComponent(playerName)}`);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-b from-gray-900 via-gray-800 to-black">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-4">
            Join Room
          </h1>
          <p className="text-gray-400 text-lg">
            Enter the room code to join your friend!
          </p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 space-y-4">
          <div>
            <label htmlFor="room-code" className="block text-sm text-gray-400 mb-2">
              Room Code
            </label>
            <input
              id="room-code"
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toLowerCase())}
              placeholder="Enter room code..."
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-center text-2xl font-mono lowercase"
              style={{ textTransform: 'lowercase' }}
              maxLength={8}
            />
          </div>

          <div>
            <label htmlFor="player-name" className="block text-sm text-gray-400 mb-2">
              Your Name
            </label>
            <input
              id="player-name"
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              placeholder="Enter your name..."
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              maxLength={20}
            />
          </div>

          <button
            onClick={handleJoin}
            disabled={isJoining || !playerName.trim() || !roomCode.trim()}
            className="w-full px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold text-lg transition-colors"
          >
            {isJoining ? 'Joining...' : 'Join Room'}
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
