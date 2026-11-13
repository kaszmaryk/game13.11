import { useState, useEffect } from 'react';

const DISCUSSION_MS = 15 * 60 * 1000; // 15 minutes in milliseconds

export interface TurnCountdownState {
  /** Seconds remaining in the discussion window. */
  secondsLeft: number;
  /** Formatted MM:SS string. */
  formatted: string;
  /** Whether the countdown has reached zero. */
  expired: boolean;
  /** Progress fraction 0..1 (1 = full time remaining, 0 = expired). */
  progress: number;
  /** Whether the timer is active (false during briefing / turn 0). */
  active: boolean;
}

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/**
 * Anchor-based countdown hook.
 * Counts down 15 minutes from `anchorMs` (epoch ms).
 * When `anchorMs` changes (new context pushed), the timer resets automatically.
 *
 * @param anchorMs  Epoch-ms timestamp of the last context update (timer anchor).
 * @param currentTurn  Current game turn. Timer is inactive during turn 0 (briefing).
 */
export function useTurnCountdown(anchorMs: number | null, currentTurn: number): TurnCountdownState {
  // Timer is only active from turn 1 onwards; turn 0 is briefing with no countdown
  const active = currentTurn >= 1;

  const computeRemaining = (): number => {
    if (!active || anchorMs == null) return 0;
    const elapsed = Date.now() - anchorMs;
    return Math.max(0, Math.ceil((DISCUSSION_MS - elapsed) / 1000));
  };

  const [secondsLeft, setSecondsLeft] = useState<number>(computeRemaining);

  // Reset immediately when anchor or turn changes
  useEffect(() => {
    setSecondsLeft(computeRemaining());
  }, [anchorMs, active]);

  // Tick every second — only when timer is active
  useEffect(() => {
    if (!active || anchorMs == null) return;

    const id = setInterval(() => {
      const remaining = computeRemaining();
      setSecondsLeft((prev) => (prev === remaining ? prev : remaining));
      if (remaining <= 0) clearInterval(id);
    }, 1000);

    return () => clearInterval(id);
  }, [anchorMs, active]);

  const expired = active ? secondsLeft <= 0 : false;
  const progress = active && anchorMs != null ? Math.min(1, secondsLeft / (DISCUSSION_MS / 1000)) : 0;

  return {
    secondsLeft,
    formatted: active ? formatTime(secondsLeft) : '--:--',
    expired,
    progress,
    active,
  };
}
