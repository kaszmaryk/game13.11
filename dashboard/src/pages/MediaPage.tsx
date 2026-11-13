import { NewspaperSection } from '@/components/NewspaperSection';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { useGameContext } from '@/hooks/useGameContext';

export function MediaPage() {
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

  return (
    <div className="flex flex-col gap-6 page-enter">
      <NewspaperSection
        articles={gameState.newspapers}
        turnCalendar={gameState.turnCalendar}
      />
    </div>
  );
}
