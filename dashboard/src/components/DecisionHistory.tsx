import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { Decision } from '@/types/game';
import { Calendar, User, ArrowRight, AlertCircle } from 'lucide-react';

interface DecisionHistoryProps {
  decisions: Decision[];
}

export const DecisionHistory = memo(function DecisionHistory({ decisions }: DecisionHistoryProps) {
  const { t } = useTranslation();
  
  // Sort decisions by date (newest first)
  const sortedDecisions = [...decisions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <section className="w-full py-4 md:py-6">
      <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">{t('decisions.title')}</h2>
      
      {sortedDecisions.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center flex flex-col items-center gap-2 text-muted-foreground">
            <AlertCircle className="size-8" />
            <p>Пока нет записанных решений</p>
          </CardContent>
        </Card>
      ) : (
        <TooltipProvider>
          <Accordion className="w-full">
            {sortedDecisions.map((decision, index) => (
              <AccordionItem key={`${decision.turn}-${index}`} value={`item-${index}`}>
                <AccordionTrigger className="text-left min-w-0">
                  <div className="flex items-center gap-2 md:gap-3 min-w-0 w-full">
                    <Calendar className="size-4 md:size-5 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <Tooltip>
                        <TooltipTrigger className="block truncate cursor-default w-full text-left font-semibold text-sm md:text-base">
                          {decision.action}
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[90vw]">
                          {decision.action}
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger className="block truncate cursor-default w-full text-left text-xs md:text-sm text-muted-foreground">
                          {t('timeline.turn')} {decision.turn} • {new Date(decision.date).toLocaleDateString('ru-RU')}
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="max-w-[90vw]">
                          {t('timeline.turn')} {decision.turn} • {new Date(decision.date).toLocaleDateString('ru-RU')}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Badge variant="outline" className="shrink-0 text-xs max-w-[30%] truncate">
                      {decision.actor}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-3 md:gap-4 pt-2 pl-4 md:pl-8">
                    <div className="flex items-start gap-2">
                      <User className="size-4 md:size-5 shrink-0 mt-0.5 text-muted-foreground" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{t('decisions.actor')}</p>
                        <p className="text-sm text-muted-foreground break-words">{decision.actor}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <ArrowRight className="size-4 md:size-5 shrink-0 mt-0.5 text-muted-foreground" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{t('decisions.description')}</p>
                        <p className="text-sm text-muted-foreground break-words">{decision.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <AlertCircle className="size-4 md:size-5 shrink-0 mt-0.5 text-muted-foreground" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{t('decisions.impact')}</p>
                        <p className="text-sm text-muted-foreground break-words">{decision.impact}</p>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </TooltipProvider>
      )}
    </section>
  );
});
