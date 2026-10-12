"use client";

import { ClipboardCheck, Hammer, RefreshCw, Wrench } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { AssetServiceLog } from "@/lib/assetsMockData";
import { formatDateTime } from "@/lib/utils";

function formatRelativeTime(iso: string) {
  const now = new Date();
  const date = new Date(iso);
  const diff = now.getTime() - date.getTime();
  if (diff < 60 * 1000) return "Just now";
  if (diff < 60 * 60 * 1000) {
    const m = Math.floor(diff / (60 * 1000));
    return `${m} minute${m === 1 ? "" : "s"} ago`;
  }
  if (diff < 24 * 60 * 60 * 1000) {
    const h = Math.floor(diff / (60 * 60 * 1000));
    return `${h} hour${h === 1 ? "" : "s"} ago`;
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();
  if (isYesterday) {
    const time = date.toLocaleString("en-IN", { hour: "numeric", minute: "2-digit" });
    return `Yesterday, ${time}`;
  }
  return formatDateTime(iso);
}

const typeConfig = {
  Service: {
    Icon: Wrench,
    wrap: "bg-sky-500/10 border-sky-500/20 text-sky-600",
  },
  Repair: {
    Icon: Hammer,
    wrap: "bg-amber-500/10 border-amber-500/20 text-amber-600",
  },
  Inspection: {
    Icon: ClipboardCheck,
    wrap: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600",
  },
  "AMC Renewal": {
    Icon: RefreshCw,
    wrap: "bg-violet-500/10 border-violet-500/20 text-violet-600",
  },
} as const;

export function AssetServiceTimeline({ logs }: { logs: AssetServiceLog[] }) {
  if (logs.length === 0) {
    return <p className="text-sm text-muted-foreground">No service history yet.</p>;
  }

  const sorted = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="flex flex-col">
      {sorted.map((entry, idx) => {
        const isLast = idx === sorted.length - 1;
        const cfg = typeConfig[entry.type] ?? typeConfig.Service;
        const Icon = cfg.Icon;
        return (
          <div key={entry.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={`flex size-6 shrink-0 items-center justify-center rounded-full border ${cfg.wrap}`}
              >
                <Icon className="size-3.5" />
              </span>
              {!isLast && <span className="mt-1 min-h-3 w-px flex-1 bg-border" />}
            </div>
            <div className={`flex min-w-0 flex-1 flex-col ${isLast ? "" : "pb-5"}`}>
              <span className="text-sm leading-5">
                <span className="font-medium text-foreground">{entry.type}</span>
                <span className="text-muted-foreground"> — {entry.description}</span>
              </span>
              <span className="inline-flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span>{formatRelativeTime(entry.date)}</span>
                <span>by {entry.loggedBy}</span>
                <Badge variant="outline" className="px-1.5 py-0 text-[11px] font-normal">
                  {entry.type}
                </Badge>
                {entry.vendor && (
                  <span className="truncate text-xs text-muted-foreground">{entry.vendor}</span>
                )}
                {entry.cost !== undefined && (
                  <span className="font-medium text-foreground">
                    ₹{entry.cost.toLocaleString("en-IN")}
                  </span>
                )}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
