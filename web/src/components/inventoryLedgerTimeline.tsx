"use client";

import { ArrowDown, ArrowUp, UserRound } from "lucide-react";

import { Timeline } from "@/components/timeline";
import { Badge } from "@/components/ui/badge";
import type { StockTransaction } from "@/lib/inventoryMockData";
import { formatRelativeTime } from "@/lib/utils";

const typeConfig = {
  "Stock In": {
    Icon: ArrowDown,
    wrap: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600",
  },
  "Stock Out": {
    Icon: ArrowUp,
    wrap: "bg-red-500/10 border-red-500/20 text-red-600",
  },
  "Staff Allotment": {
    Icon: UserRound,
    wrap: "bg-amber-500/10 border-amber-500/20 text-amber-600",
  },
} as const;

export function InventoryLedgerTimeline({ logs }: { logs: StockTransaction[] }) {
  const sorted = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <Timeline
      emptyMessage="No transactions yet."
      items={sorted.map((entry) => {
        const cfg = typeConfig[entry.type] ?? typeConfig["Stock In"];
        const qtySign = entry.type === "Stock In" ? "+" : "-";
        return {
          id: entry.id,
          icon: cfg.Icon,
          tone: cfg.wrap,
          title: (
            <>
              <span className="font-medium text-foreground">{entry.type}</span>
              <span className="text-muted-foreground"> — {entry.reason}</span>
              <span className="font-medium text-foreground">
                {" "}
                {qtySign}
                {entry.quantity}
              </span>
              <span className="text-muted-foreground"> → {entry.balanceAfter}</span>
            </>
          ),
          meta: (
            <>
              <span>{formatRelativeTime(entry.date)}</span>
              <span>by {entry.recordedBy}</span>
              <Badge variant="outline" className="px-1.5 py-0 text-[11px] font-normal">
                {entry.type}
              </Badge>
              {entry.allottedTo && (
                <span className="truncate text-xs text-muted-foreground">{entry.allottedTo}</span>
              )}
            </>
          ),
        };
      })}
    />
  );
}
