import { memo, useState, useMemo, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { NewspaperArticle, TurnCalendar } from '@/types/game';
import { Newspaper, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NewspaperSectionProps {
  articles: NewspaperArticle[];
  turnCalendar?: TurnCalendar[];
}

function getSentimentVariant(sentiment: string): "default" | "secondary" | "destructive" | "outline" {
  switch (sentiment) {
    case 'negative':
      return 'destructive';
    case 'positive':
      return 'default';
    case 'neutral':
    default:
      return 'secondary';
  }
}

/** Format a date range for a round header */
function formatRoundPeriod(turn: TurnCalendar): string {
  return turn.periodRu;
}

const STAGGER_CLASSES = [
  'stagger-1', 'stagger-2', 'stagger-3', 'stagger-4', 'stagger-5', 'stagger-6',
];

/**
 * Expandable text block that is clamped by default and can be toggled
 * via a showMore / collapse button.
 */
function ExpandableText({
  text,
  clampLines = 3,
  className,
}: {
  text: string;
  clampLines?: number;
  className?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [isClamped, setIsClamped] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    setIsClamped(el.scrollHeight > el.clientHeight + 1);
  }, [text, expanded]);

  return (
    <div className="flex flex-col gap-1">
      <p
        ref={textRef}
        className={cn(
          "text-sm text-muted-foreground",
          !expanded && `line-clamp-${clampLines}`,
          className,
        )}
      >
        {text}
      </p>
      {isClamped && (
        <Button
          variant="ghost"
          size="sm"
          className="self-start h-auto px-0 py-0.5 text-xs"
          onClick={() => setExpanded((prev) => !prev)}
          aria-label={expanded ? 'Свернуть' : 'Показать больше'}
        >
          {expanded ? 'Свернуть' : 'Показать больше'}
        </Button>
      )}
    </div>
  );
}

export const NewspaperSection = memo(function NewspaperSection({
  articles,
  turnCalendar = [],
}: NewspaperSectionProps) {
  const { t } = useTranslation();

  // Build a lookup map: turn number → TurnCalendar entry
  const turnMap = useMemo(() => {
    const map = new Map<number, TurnCalendar>();
    for (const tc of turnCalendar) {
      map.set(tc.turn, tc);
    }
    return map;
  }, [turnCalendar]);

  // Group articles by round, sorted newest round first, then newest article first within each round
  const groupedArticles = useMemo(() => {
    const groups = new Map<number, NewspaperArticle[]>();

    for (const article of articles) {
      const existing = groups.get(article.turn);
      if (existing) {
        existing.push(article);
      } else {
        groups.set(article.turn, [article]);
      }
    }

    // Sort articles within each group by publishedAt descending
    for (const [, groupArticles] of groups) {
      groupArticles.sort(
        (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
      );
    }

    // Convert to sorted array of [turn, articles] — newest turn first
    return [...groups.entries()].sort((a, b) => b[0] - a[0]);
  }, [articles]);

  return (
    <section className="w-full py-4 md:py-6">
      <div className="flex items-center gap-2 mb-3 md:mb-4">
        <Newspaper className="size-6 text-muted-foreground" />
        <h2 className="text-xl md:text-2xl font-bold">{t('newspapers.title')}</h2>
      </div>

      {articles.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center flex flex-col items-center gap-2 text-muted-foreground">
            <Newspaper className="size-8" />
            <p>{t('newspapers.empty')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-6">
          {groupedArticles.map(([turn, groupArticles], groupIndex) => {
            const turnInfo = turnMap.get(turn);
            const roundLabel = `${t('timeline.turn')} ${turn}`;
            const roundPeriod = turnInfo ? formatRoundPeriod(turnInfo) : undefined;

            return (
              <div key={turn} className="flex flex-col gap-3">
                {/* Round header with date range */}
                <div className="flex items-center gap-2 px-1">
                  <Badge variant="outline" className="text-xs font-semibold tracking-wide uppercase">
                    {roundLabel}
                  </Badge>
                  {roundPeriod && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <CalendarDays className="size-3" />
                      {roundPeriod}
                    </span>
                  )}
                </div>

                {/* Articles grid for this round */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  {groupArticles.map((article, index) => {
                    const publishedDate = new Date(article.publishedAt);

                    return (
                      <Card
                        key={article.id}
                        className={cn(
                          "h-full animate-scale-in",
                          STAGGER_CLASSES[(groupIndex + index) % STAGGER_CLASSES.length],
                        )}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex flex-wrap gap-1 flex-grow">
                              <Badge variant="outline">
                                {article.source}
                              </Badge>
                              <Badge variant={getSentimentVariant(article.sentiment)}>
                                {t(`newspapers.sentiment.${article.sentiment}`)}
                              </Badge>
                            </div>
                          </div>
                          <CardTitle className="line-clamp-2 mt-2">
                            {article.headline}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3">
                          <ExpandableText text={article.summary} clampLines={2} />
                          {article.text && (
                            <ExpandableText
                              text={article.text}
                              clampLines={4}
                              className="text-muted-foreground/80"
                            />
                          )}
                        </CardContent>
                        <CardFooter className="justify-between">
                          <p className="text-xs text-muted-foreground">
                            {publishedDate.toLocaleDateString('ru-RU')}
                          </p>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
});
