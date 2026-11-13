import { memo } from 'react';
import { TimerIcon, RefreshCwIcon, PauseIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGameContext } from '@/hooks/useGameContext';

/**
 * Global countdown bar shown on every page.
 * Counts down 15 minutes from the last context update.
 * Resets automatically when a new context.json is pushed.
 * During turn 0 (briefing) the timer is paused and shows a briefing indicator.
 */
export const DiscussionTimer = memo(function DiscussionTimer() {
  const { lastUpdatedMs, countdown } = useGameContext();

  // Don't render anything until we have an anchor
  if (lastUpdatedMs == null) return null;

  const updatedDate = new Date(lastUpdatedMs);
  const timeStr = updatedDate.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const dateStr = updatedDate.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  });

  return (
    <div
      className={cn(
        "sticky top-14 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80",
        "hidden md:block",
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-12 gap-4">
          {/* Left: label + large timer */}
          <div className="flex items-center gap-3">
            {countdown.active ? (
              <TimerIcon
                className={cn(
                  "size-5 text-muted-foreground flex-shrink-0",
                  countdown.expired && "text-destructive",
                )}
              />
            ) : (
              <PauseIcon className="size-5 text-muted-foreground flex-shrink-0" />
            )}
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {countdown.active ? "Обсуждение хода" : "Брифинг команды"}
            </span>
            <span
              className={cn(
                "font-mono text-2xl font-bold tracking-tight tabular-nums leading-none",
                !countdown.active
                  ? "text-muted-foreground"
                  : countdown.expired
                    ? "text-destructive"
                    : countdown.secondsLeft <= 60
                      ? "text-destructive"
                      : "text-foreground",
              )}
            >
              {countdown.formatted}
            </span>
          </div>

          {/* Right: last-updated timestamp */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground whitespace-nowrap">
            <RefreshCwIcon className="size-3" />
            <span>Обновлено: {dateStr}, {timeStr}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

/**
 * Mobile-friendly compact version of the discussion timer.
 * Rendered inside the mobile bottom nav area or as a floating bar.
 * During turn 0 (briefing) the timer is paused and shows a briefing indicator.
 */
export const DiscussionTimerMobile = memo(function DiscussionTimerMobile() {
  const { lastUpdatedMs, countdown } = useGameContext();

  if (lastUpdatedMs == null) return null;

  const updatedDate = new Date(lastUpdatedMs);
  const timeStr = updatedDate.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={cn(
        "md:hidden fixed bottom-16 left-0 right-0 z-40",
        "border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80",
        "safe-area-pb",
      )}
    >
      <div className="flex items-center justify-between px-4 h-10 gap-3">
        <div className="flex items-center gap-2">
          {countdown.active ? (
            <TimerIcon
              className={cn(
                "size-4 text-muted-foreground flex-shrink-0",
                countdown.expired && "text-destructive",
              )}
            />
          ) : (
            <PauseIcon className="size-4 text-muted-foreground flex-shrink-0" />
          )}
          <span
            className={cn(
              "font-mono text-lg font-bold tracking-tight tabular-nums leading-none",
              !countdown.active
                ? "text-muted-foreground"
                : countdown.expired
                  ? "text-destructive"
                  : countdown.secondsLeft <= 60
                    ? "text-destructive"
                    : "text-foreground",
            )}
          >
            {countdown.formatted}
          </span>
          {!countdown.active && (
            <span className="text-xs text-muted-foreground">Брифинг</span>
          )}
        </div>
        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
          Обновление: {timeStr}
        </span>
      </div>
    </div>
  );
});
