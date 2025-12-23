import Link from "next/link";

export default function LobbyPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-b from-gray-900 via-gray-800 to-black">
      <div className="max-w-2xl w-full text-center space-y-8">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent mb-4">
          Lobby
        </h1>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 border border-gray-700">
          <p className="text-gray-300 text-lg mb-6">
            Multiplayer features are coming in Phase 4!
          </p>

          <p className="text-gray-400 mb-8">
            For now, you can test the core gameplay mechanics in solo mode.
          </p>

          <div className="space-y-4">
            <Link
              href="/game/test"
              className="block w-full px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold text-lg transition-colors"
            >
              🎮 Test Solo Gameplay
            </Link>

            <Link
              href="/"
              className="block w-full px-8 py-4 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold text-lg transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>

        <div className="bg-gray-800/30 rounded-lg p-6 border border-gray-700/50">
          <h3 className="text-xl font-semibold text-white mb-3">Coming Soon:</h3>
          <ul className="text-gray-400 space-y-2 text-left">
            <li>• Private rooms with invite codes</li>
            <li>• Public matchmaking</li>
            <li>• YouTube song selection</li>
            <li>• Real-time multiplayer battles</li>
            <li>• Combo vs combo damage system</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
