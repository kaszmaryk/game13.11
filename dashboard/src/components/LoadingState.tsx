import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function LoadingState() {
  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* Header skeleton */}
      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col gap-3">
            <Skeleton className="h-8 w-3/4 max-w-md" />
            <Skeleton className="h-5 w-1/2 max-w-sm" />
            <Skeleton className="h-4 w-1/3 max-w-xs" />
          </div>
        </CardContent>
      </Card>

      {/* Metrics grid skeleton */}
      <section>
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2 p-3 md:p-6">
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
                <Skeleton className="h-8 w-2/3 mb-2" />
                <Skeleton className="h-2 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Timeline skeleton */}
      <section>
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Skeleton className="size-6 rounded-full flex-shrink-0" />
                  <div className="flex-grow flex flex-col gap-2">
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
