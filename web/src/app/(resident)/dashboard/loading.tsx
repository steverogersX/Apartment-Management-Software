import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5" aria-busy="true" aria-label="Loading">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className="overflow-hidden rounded-md border border-border bg-card">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-7 w-24" />
        </div>
        <div className="flex gap-4 border-b border-border bg-muted/40 px-4 py-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-3.5 flex-1" />
          ))}
        </div>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((row) => (
          <div key={row} className="flex gap-4 border-b border-border px-4 py-3 last:border-b-0">
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
