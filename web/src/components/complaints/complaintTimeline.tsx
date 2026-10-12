"use client";

import { ArrowUpCircle, Circle, CircleCheck, Clock3 } from "lucide-react";

import { cn, formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { ComplaintStatus, ComplaintStatusEvent } from "@/lib/mockData";

const STAGE_META: Record<
  ComplaintStatus,
  { label: string; icon: typeof Circle; iconClass: string }
> = {
  open: {
    label: "Opened",
    icon: Circle,
    iconClass: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  },
  in_progress: {
    label: "In progress",
    icon: Clock3,
    iconClass: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  },
  resolved: {
    label: "Resolved",
    icon: CircleCheck,
    iconClass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  },
  escalated: {
    label: "Escalated",
    icon: ArrowUpCircle,
    iconClass: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
  },
};

export function ComplaintTimeline({ events }: { events: ComplaintStatusEvent[] }) {
  if (events.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
        No activity recorded yet.
      </p>
    );
  }

  const chronological = [...events].sort(
    (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime(),
  );

  return (
    <div className="flex flex-col">
      {chronological.map((event, index) => {
        const isCurrent = index === chronological.length - 1;
        const meta = STAGE_META[event.status];
        const Icon = meta.icon;
        return (
          <div key={event.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full",
                  meta.iconClass,
                )}
              >
                <Icon className="size-3.5" />
              </span>
              {!isCurrent && <span className="w-px flex-1 bg-border" />}
            </div>
            <div className={cn("flex flex-col gap-0.5", isCurrent ? "pb-0.5" : "pb-5")}>
              <p className="flex items-center gap-1.5 pt-0.5 text-sm font-medium text-foreground">
                {meta.label}
                {isCurrent && (
                  <Badge variant="outline" className="text-[10px]">
                    Current stage
                  </Badge>
                )}
              </p>
              <p className="text-sm text-muted-foreground">{event.note}</p>
              <p className="text-[11px] text-muted-foreground/80">
                {formatDateTime(event.at)} · by {event.by}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
