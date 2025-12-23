'use client';

import { useEffect, useState } from 'react';
import type { HitResult } from '@project/shared/types';
import { getHitResultColor, getHitResultText } from '@/lib/game/scoring';

interface HitFeedbackProps {
  result: HitResult | null;
  onComplete?: () => void;
}

export default function HitFeedback({ result, onComplete }: HitFeedbackProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (result) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [result, onComplete]);

  if (!result || !visible) return null;

  const color = getHitResultColor(result);
  const text = getHitResultText(result);

  return (
    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
      <div
        className={`text-6xl font-bold ${color} animate-slide-up drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]`}
      >
        {text}
      </div>
    </div>
  );
}
