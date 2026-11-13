import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-[400px] flex items-center justify-center animate-fade-in">
      <Card className="max-w-md w-full">
        <CardContent className="p-6 text-center flex flex-col items-center gap-4">
          <div className="size-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="text-destructive size-6" />
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-bold text-destructive">Ошибка загрузки</h2>
            <p className="text-muted-foreground text-sm">{error}</p>
          </div>
          <Button onClick={handleRetry} variant="outline">
            <RefreshCw data-icon="inline-start" />
            Повторить попытку
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
