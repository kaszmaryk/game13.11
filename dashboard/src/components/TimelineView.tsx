import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { TurnCalendar } from '@/types/game';
import { CheckCircle, Clock, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimelineViewProps {
  turns: TurnCalendar[];
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'completed':
      return <CheckCircle className="text-primary" />;
    case 'active':
      return <Clock className="text-primary animate-pulse" />;
    case 'upcoming':
      return <Circle className="text-muted-foreground" />;
    default:
      return <Circle className="text-muted-foreground" />;
  }
}

function getStatusVariant(status: string): "default" | "secondary" | "outline" {
  switch (status) {
    case 'completed':
      return 'secondary';
    case 'active':
      return 'default';
    case 'upcoming':
      return 'outline';
    default:
      return 'outline';
  }
}

const STAGGER_CLASSES = [
  'stagger-1', 'stagger-2', 'stagger-3', 'stagger-4', 'stagger-5',
];

export const TimelineView = memo(function TimelineView({ turns }: TimelineViewProps) {
  const { t } = useTranslation();

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return t('timeline.completed');
      case 'active':
        return t('timeline.active');
      case 'upcoming':
        return t('timeline.upcoming');
      default:
        return status;
    }
  };

  return (
    <section className="w-full py-4 md:py-6">
      <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">{t('timeline.title')}</h2>
      <div className="flex flex-col gap-3 md:gap-4">
        {turns.map((turn, index) => (
          <Card 
            key={turn.turn} 
            className={cn(
              "animate-slide-up",
              STAGGER_CLASSES[index % STAGGER_CLASSES.length],
              turn.status === 'active' && "ring-2 ring-primary/30"
            )}
          >
            <CardContent className="p-3 md:p-4">
              <div className="flex items-start gap-2 md:gap-4">
                <div className="flex-shrink-0 mt-1 text-muted-foreground">
                  {getStatusIcon(turn.status)}
                </div>
                
                <div className="flex-grow min-w-0">
                  <div className="flex items-center justify-between mb-1 md:mb-2 gap-2">
                    <h3 className="text-lg md:text-xl font-semibold truncate">
                      {t('timeline.turn')} {turn.turn}
                    </h3>
                    <Badge variant={getStatusVariant(turn.status)} className="flex-shrink-0 text-xs md:text-sm">
                      {getStatusText(turn.status)}
                    </Badge>
                  </div>
                  
                  <p className="text-sm md:text-base text-muted-foreground mb-2">{turn.periodRu}</p>
                  
                  {turn.roundSummary && (
                    <div className="mt-3 p-3 rounded-md bg-accent/50 border border-border/50">
                      <p className="text-sm font-medium mb-1 flex items-center gap-2">
                        <span>📋</span>
                        <span>Итоги раунда</span>
                      </p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{turn.roundSummary}</p>
                    </div>
                  )}

                  {turn.keyEvents && turn.keyEvents.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium mb-2">Ключевые события:</p>
                      <ul className="flex flex-col gap-1">
                        {turn.keyEvents.map((event, eventIndex) => (
                          <li key={eventIndex} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-muted-foreground mt-1">•</span>
                            <span>{event}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
});
