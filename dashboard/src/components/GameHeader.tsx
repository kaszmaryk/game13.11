import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { GameMetadata } from '@/types/game';

interface GameHeaderProps {
  game: GameMetadata;
}

export const GameHeader = memo(function GameHeader({ game }: GameHeaderProps) {
  const { t } = useTranslation();

  const getStatusVariant = (status: string): "default" | "secondary" | "outline" | "destructive" => {
    switch (status) {
      case 'active':
        return 'default';
      case 'completed':
        return 'secondary';
      case 'paused':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Активна';
      case 'completed':
        return 'Завершена';
      case 'paused':
        return 'На паузе';
      default:
        return status;
    }
  };

  return (
    <Card className="mb-4 md:mb-6 animate-fade-in">
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col gap-3 md:gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
            <div className="min-w-0">
              <h1 className="text-xl md:text-2xl font-bold break-words">{game.title}</h1>
              <p className="text-sm md:text-base text-muted-foreground mt-1">{game.currentPeriod}</p>
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge variant="secondary" className="text-xs md:text-base whitespace-nowrap">
                {t('game.currentTurn')} {game.currentTurn} / {game.totalTurns}
              </Badge>
              <Badge variant={getStatusVariant(game.status)} className="whitespace-nowrap">
                {getStatusText(game.status)}
              </Badge>
            </div>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground">
            {t('contextInfo.startDate')}: {new Date(game.startDate).toLocaleDateString('ru-RU')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
});
