import type { ComponentType, ReactNode } from "react";

import { cn } from "@/lib/utils";

export type TimelineItem = {
  id: string;
  icon: ComponentType<{ className?: string }>;
  tone: string;
  title: ReactNode;
  meta: ReactNode;
};

export function Timeline({ items, emptyMessage }: { items: TimelineItem[]; emptyMessage: string }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <div className="flex flex-col">
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        const Icon = item.icon;
        return (
          <div key={item.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full border",
                  item.tone,
                )}
              >
                <Icon className="size-3.5" />
              </span>
              {!isLast && <span className="mt-1 min-h-3 w-px flex-1 bg-border" />}
            </div>
            <div className={cn("flex min-w-0 flex-1 flex-col", !isLast && "pb-5")}>
              <span className="text-sm leading-5">{item.title}</span>
              <span className="inline-flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {item.meta}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
