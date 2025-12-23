'use client';

import type { PlayerState } from '@project/shared/types';

interface PlayerHUDProps {
  player: PlayerState;
}

export default function PlayerHUD({ player }: PlayerHUDProps) {
  const hpPercentage = (player.hp / 100) * 100;
  const hpColor = player.hp > 50 ? 'bg-green-500' : player.hp > 30 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-4 min-w-[250px]">
      {/* HP Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-400">HP</span>
          <span className="text-white font-bold">{Math.floor(player.hp)}</span>
        </div>
        <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full ${hpColor} transition-all duration-300 ease-out`}
            style={{ width: `${hpPercentage}%` }}
          />
        </div>
      </div>

      {/* Combo */}
      <div className="mb-2">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">Combo</span>
          <span className="text-3xl font-bold text-purple-400">
            {player.combo}x
          </span>
        </div>
        {player.maxCombo > 0 && (
          <div className="text-xs text-gray-500 text-right">
            Max: {player.maxCombo}x
          </div>
        )}
      </div>

      {/* Score */}
      <div className="mb-2">
        <div className="flex justify-between">
          <span className="text-gray-400 text-sm">Score</span>
          <span className="text-xl font-bold text-white">
            {Math.floor(player.score).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 text-xs mt-3 pt-3 border-t border-gray-700">
        <div className="text-center">
          <div className="text-yellow-400 font-bold">{player.perfectCount}</div>
          <div className="text-gray-500">Perfect</div>
        </div>
        <div className="text-center">
          <div className="text-green-400 font-bold">{player.goodCount}</div>
          <div className="text-gray-500">Good</div>
        </div>
        <div className="text-center">
          <div className="text-red-400 font-bold">{player.missCount}</div>
          <div className="text-gray-500">Miss</div>
        </div>
      </div>
    </div>
  );
}
