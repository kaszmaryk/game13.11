import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useGameState, type LastUpdatedMs } from '@/hooks/useGameState';
import { useTurnCountdown, type TurnCountdownState } from '@/hooks/useTurnCountdown';
import type { GameState } from '@/types/game';

interface GameContextValue {
  gameState: GameState | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
  lastUpdatedMs: LastUpdatedMs;
  countdown: TurnCountdownState;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const { gameState, loading, error, retry, lastUpdatedMs } = useGameState();
  const currentTurn = gameState?.game.currentTurn ?? 0;
  const countdown = useTurnCountdown(lastUpdatedMs, currentTurn);

  const value = useMemo<GameContextValue>(
    () => ({ gameState, loading, error, retry, lastUpdatedMs, countdown }),
    [gameState, loading, error, retry, lastUpdatedMs, countdown],
  );

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

/**
 * Access the shared game state from any component.
 * Must be used inside <GameProvider>.
 */
export function useGameContext(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) {
    throw new Error('useGameContext must be used within <GameProvider>');
  }
  return ctx;
}
