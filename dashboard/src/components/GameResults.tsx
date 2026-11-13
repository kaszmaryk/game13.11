import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Trophy, CheckCircle2, XCircle, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Organ, OrganScore } from '@/types/game';

interface GameResultsProps {
  gameOverMessage: string;
  organScores: Record<string, OrganScore>;
  organs: Organ[];
  className?: string;
}

/** Map organ id → display color from the organs array. */
function buildColorMap(organs: Organ[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const o of organs) {
    map[o.id] = o.color;
  }
  return map;
}

/** Sort organ scores descending by score value. */
function sortedEntries(organScores: Record<string, OrganScore>): [string, OrganScore][] {
  return Object.entries(organScores).sort(([, a], [, b]) => b.score - a.score);
}

function scoreVariant(score: number): 'default' | 'secondary' | 'destructive' {
  if (score >= 80) return 'default';
  if (score >= 50) return 'secondary';
  return 'destructive';
}

/** Parse the gameOverMessage into structured sections. */
function parseGameOverMessage(message: string) {
  const lines = message.split('\n').filter((l) => l.trim() !== '');

  const achievements: string[] = [];
  const unresolved: string[] = [];
  const narrativeLines: string[] = [];

  let section: 'narrative' | 'achievements' | 'unresolved' = 'narrative';

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('КЛЮЧЕВЫЕ ДОСТИЖЕНИЯ')) {
      section = 'achievements';
      continue;
    }
    if (trimmed.startsWith('НЕРЕШЁННЫЕ ВОПРОСЫ')) {
      section = 'unresolved';
      continue;
    }
    if (section === 'achievements' && trimmed.startsWith('✅')) {
      achievements.push(trimmed.replace(/^✅\s*/, ''));
    } else if (section === 'unresolved' && trimmed.startsWith('❌')) {
      unresolved.push(trimmed.replace(/^❌\s*/, ''));
    } else if (section === 'narrative') {
      narrativeLines.push(trimmed);
    }
  }

  return { narrative: narrativeLines.join('\n\n'), achievements, unresolved };
}

export const GameResults = memo(function GameResults({
  gameOverMessage,
  organScores,
  organs,
  className,
}: GameResultsProps) {
  const colorMap = buildColorMap(organs);
  const organNameMap: Record<string, string> = {};
  for (const o of organs) {
    organNameMap[o.id] = o.name;
  }

  const sorted = sortedEntries(organScores);
  const winnerId = sorted.length > 0 ? sorted[0][0] : null;
  const { narrative, achievements, unresolved } = parseGameOverMessage(gameOverMessage);

  return (
    <div className={cn("flex flex-col gap-6 animate-fade-in", className)}>
      {/* Hero banner */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Trophy className="size-6 text-primary" />
            <div className="flex flex-col gap-1">
              <CardTitle className="text-lg md:text-xl">Игра окончена</CardTitle>
              <CardDescription>Финальные результаты и итоги симуляции</CardDescription>
            </div>
          </div>
        </CardHeader>
        {narrative && (
          <CardContent>
            <p className="text-sm leading-relaxed whitespace-pre-line">{narrative}</p>
          </CardContent>
        )}
      </Card>

      {/* Achievements & Unresolved side by side on larger screens */}
      {(achievements.length > 0 || unresolved.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-5 text-success" />
                  <CardTitle className="text-base">Ключевые достижения</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="flex flex-col gap-2">
                  {achievements.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="size-4 mt-0.5 flex-shrink-0 text-success" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {unresolved.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <XCircle className="size-5 text-destructive" />
                  <CardTitle className="text-base">Нерешённые вопросы</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="flex flex-col gap-2">
                  {unresolved.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <XCircle className="size-4 mt-0.5 flex-shrink-0 text-destructive" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Organ scores */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Flag className="size-5 text-primary" />
            <div className="flex flex-col gap-1">
              <CardTitle className="text-base">Итоги по органам</CardTitle>
              <CardDescription>Финальные баллы каждого участника симуляции</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {sorted.map(([organId, data], index) => {
              const isWinner = organId === winnerId;
              const displayName = organNameMap[organId] ?? organId;
              const organColor = colorMap[organId];

              return (
                <div key={organId} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {organColor && (
                        <span
                          className="size-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: organColor }}
                        />
                      )}
                      <span className={cn("text-sm font-medium truncate", isWinner && "text-primary font-bold")}>
                        {displayName}
                      </span>
                      {isWinner && (
                        <Badge variant="default">
                          Победитель
                        </Badge>
                      )}
                    </div>
                    <Badge variant={scoreVariant(data.score)} className="tabular-nums">
                      {data.score}
                    </Badge>
                  </div>
                  <Progress value={data.score} max={100} />
                  {data.goalsMet.length > 0 && (
                    <ul className="flex flex-col gap-1 pl-2">
                      {data.goalsMet.map((goal, gi) => (
                        <li key={gi} className="text-xs text-muted-foreground flex items-start gap-1.5">
                          <span className="mt-1 size-1 rounded-full bg-muted-foreground/40 flex-shrink-0" />
                          <span>{goal}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {index < sorted.length - 1 && <Separator />}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
});
