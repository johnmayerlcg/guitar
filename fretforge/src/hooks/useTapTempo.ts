import { useRef, useCallback } from 'react';

const TAP_WINDOW = 2000;

export function useTapTempo(onBpmChange: (bpm: number) => void) {
  const tapsRef = useRef<number[]>([]);

  const tap = useCallback(() => {
    const now = Date.now();
    const taps = tapsRef.current;
    taps.push(now);

    while (taps.length > 1 && now - taps[0] > TAP_WINDOW) {
      taps.shift();
    }

    if (taps.length >= 2) {
      const intervals: number[] = [];
      for (let i = 1; i < taps.length; i++) {
        intervals.push(taps[i] - taps[i - 1]);
      }
      const avgMs = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const newBpm = Math.round(60000 / avgMs);
      onBpmChange(Math.max(30, Math.min(260, newBpm)));
    }
  }, [onBpmChange]);

  return { tap };
}
