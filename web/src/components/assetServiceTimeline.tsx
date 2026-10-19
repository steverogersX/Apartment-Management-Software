"use client";

import { ClipboardCheck, Hammer, RefreshCw, Wrench } from "lucide-react";

import { Timeline } from "@/components/timeline";
import { Badge } from "@/components/ui/badge";
import type { AssetServiceLog } from "@/lib/assetsMockData";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";

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
  const sorted = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <Timeline
      emptyMessage="No service history yet."
      items={sorted.map((entry) => {
        const cfg = typeConfig[entry.type] ?? typeConfig.Service;
        return {
          id: entry.id,
          icon: cfg.Icon,
          tone: cfg.wrap,
          title: (
            <>
              <span className="font-medium text-foreground">{entry.type}</span>
              <span className="text-muted-foreground"> — {entry.description}</span>
            </>
          ),
          meta: (
            <>
              <span>{formatRelativeTime(entry.date)}</span>
              <span>by {entry.loggedBy}</span>
              <Badge variant="outline" className="px-1.5 py-0 text-[11px] font-normal">
                {entry.type}
              </Badge>
              {entry.vendor && (
                <span className="truncate text-xs text-muted-foreground">{entry.vendor}</span>
              )}
              {entry.cost !== undefined && (
                <span className="font-medium text-foreground">{formatCurrency(entry.cost)}</span>
              )}
            </>
          ),
        };
      })}
    />
  );
}
