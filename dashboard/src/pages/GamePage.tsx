import { GameHeader } from '@/components/GameHeader';
import { MetricsBoard } from '@/components/MetricsBoard';
import { TimelineView } from '@/components/TimelineView';
import { DecisionHistory } from '@/components/DecisionHistory';
import { GameResults } from '@/components/GameResults';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { useGameContext } from '@/hooks/useGameContext';

export function GamePage() {
  const { gameState, loading, error, retry } = useGameContext();

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={retry} />;
  }

  if (!gameState) {
    return (
      <div className="min-h-[400px] flex items-center justify-center animate-fade-in">
        <p className="text-lg text-muted-foreground">Нет данных для отображения</p>
      </div>
    );
  }

  const isGameOver = gameState.game.isGameOver === true;

  return (
    <div className="flex flex-col gap-8 page-enter">
      <GameHeader game={gameState.game} />
      {isGameOver && gameState.game.gameOverMessage && gameState.game.organScores && (
        <GameResults
          gameOverMessage={gameState.game.gameOverMessage}
          organScores={gameState.game.organScores}
          organs={gameState.organs}
        />
      )}
      <MetricsBoard metrics={gameState.metrics} organs={gameState.organs} />
      <TimelineView turns={gameState.turnCalendar} />
      <DecisionHistory decisions={gameState.decisions} />
    </div>
  );
}
