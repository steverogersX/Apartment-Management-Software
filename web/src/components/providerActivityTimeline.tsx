"use client";

import { Ban, ShieldCheck, UserMinus, UserPlus } from "lucide-react";

import { Timeline } from "@/components/timeline";
import { Badge } from "@/components/ui/badge";
import { serviceProviders } from "@/lib/providersMockData";
import type { ProviderActivityLog } from "@/lib/providersMockData";
import { formatRelativeTime } from "@/lib/utils";

const actionConfig = {
  flat_assigned: {
    Icon: UserPlus,
    wrap: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600",
    verb: "assigned",
    flatPrefix: "to",
  },
  flat_removed: {
    Icon: UserMinus,
    wrap: "bg-muted border-border text-muted-foreground",
    verb: "removed",
    flatPrefix: "from",
  },
  provider_blocked: {
    Icon: Ban,
    wrap: "bg-red-500/10 border-red-500/20 text-red-600",
    verb: "blocked",
    flatPrefix: null,
  },
  provider_unblocked: {
    Icon: ShieldCheck,
    wrap: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600",
    verb: "unblocked",
    flatPrefix: null,
  },
} as const;

export function ProviderActivityTimeline({
  logs,
  providerName: providerNameProp,
}: {
  logs: ProviderActivityLog[];
  providerName?: string;
}) {
  const sorted = [...logs].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  return (
    <Timeline
      emptyMessage="No activity yet."
      items={sorted.map((entry) => {
        const cfg = actionConfig[entry.action];
        const providerName =
          providerNameProp ??
          serviceProviders.find((p) => p.id === entry.providerId)?.name ??
          "Provider";
        return {
          id: entry.id,
          icon: cfg.Icon,
          tone: cfg.wrap,
          title: (
            <>
              <span className="font-medium text-foreground">{entry.actor}</span>
              <span className="text-muted-foreground"> {cfg.verb} </span>
              <span className="font-medium text-foreground">{providerName}</span>
              {cfg.flatPrefix && (
                <span className="text-muted-foreground">
                  {" "}
                  {cfg.flatPrefix} {entry.flatNumber}
                </span>
              )}
            </>
          ),
          meta: (
            <>
              <span>{formatRelativeTime(entry.timestamp)}</span>
              {entry.flatNumber && (
                <Badge variant="outline" className="px-1.5 py-0 text-[11px] font-normal">
                  {entry.flatNumber}
                </Badge>
              )}
            </>
          ),
        };
      })}
    />
  );
}
