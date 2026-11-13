import { SocialMediaFeed } from '@/components/SocialMediaFeed';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { useGameContext } from '@/hooks/useGameContext';

export function SocialMediaPage() {
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
    <div className="flex flex-col page-enter mx-auto w-full max-w-2xl px-0 py-4 sm:px-2 sm:py-6">
      <SocialMediaFeed posts={gameState.socialMedia} />
    </div>
  );
}
