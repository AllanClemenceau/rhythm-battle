import Link from "next/link";

export default function LobbyPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-b from-gray-900 via-gray-800 to-black">
      <div className="max-w-2xl w-full text-center space-y-8">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent mb-4">
          Multiplayer Lobby
        </h1>

        <p className="text-gray-400 text-lg">
          Challenge your friends in a real-time rhythm battle!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Create Room */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 border border-purple-700/50 hover:border-purple-500 transition-colors">
            <div className="text-6xl mb-4">🎮</div>
            <h2 className="text-2xl font-bold text-white mb-3">Create Room</h2>
            <p className="text-gray-400 mb-6">
              Start a private room and invite your friends with a code
            </p>
            <Link
              href="/lobby/create"
              className="block px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold text-lg transition-colors"
            >
              Create Room
            </Link>
          </div>

          {/* Join Room */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 border border-blue-700/50 hover:border-blue-500 transition-colors">
            <div className="text-6xl mb-4">🔗</div>
            <h2 className="text-2xl font-bold text-white mb-3">Join Room</h2>
            <p className="text-gray-400 mb-6">
              Enter a room code to join your friend's battle
            </p>
            <Link
              href="/lobby/join"
              className="block px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-lg transition-colors"
            >
              Join Room
            </Link>
          </div>
        </div>

        {/* Practice Mode */}
        <div className="bg-gray-800/30 rounded-lg p-6 border border-gray-700/50">
          <p className="text-gray-400 mb-4">
            Want to practice first?
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/practice"
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors"
            >
              Practice Mode
            </Link>
            <Link
              href="/"
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
