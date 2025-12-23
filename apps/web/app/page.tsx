import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <div className="text-center space-y-8">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            RhythmBattle
          </h1>

          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Face your opponent in an epic rhythm battle. Submit a YouTube track,
            hit the beats, build your combo, and defeat your rival!
          </p>

          <div className="flex gap-4 justify-center pt-8">
            <Link
              href="/lobby"
              className="px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold text-lg transition-colors"
            >
              Play Now
            </Link>

            <a
              href="#how-to-play"
              className="px-8 py-4 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold text-lg transition-colors"
            >
              How to Play
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16">
            <div className="p-6 bg-gray-800/50 rounded-lg">
              <h3 className="text-xl font-bold mb-2 text-purple-400">🎵 Your Music</h3>
              <p className="text-gray-400">
                Submit any YouTube track. The game auto-generates the beatmap.
              </p>
            </div>

            <div className="p-6 bg-gray-800/50 rounded-lg">
              <h3 className="text-xl font-bold mb-2 text-pink-400">⚡ Build Combos</h3>
              <p className="text-gray-400">
                Hit perfect notes to build massive combos and deal devastating damage.
              </p>
            </div>

            <div className="p-6 bg-gray-800/50 rounded-lg">
              <h3 className="text-xl font-bold mb-2 text-blue-400">🏆 Battle Real-time</h3>
              <p className="text-gray-400">
                Face opponents in synchronized 60-second rhythm battles.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
