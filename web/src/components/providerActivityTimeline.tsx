"use client";

import { Ban, ShieldCheck, UserMinus, UserPlus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { serviceProviders } from "@/lib/providersMockData";
import type { ProviderActivityLog } from "@/lib/providersMockData";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

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

const actionConfig = {
  flat_assigned: {
    Icon: UserPlus,
    wrap: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600",
  },
  flat_removed: {
    Icon: UserMinus,
    wrap: "bg-muted border-border text-muted-foreground",
  },
  provider_blocked: {
    Icon: Ban,
    wrap: "bg-red-500/10 border-red-500/20 text-red-600",
  },
  provider_unblocked: {
    Icon: ShieldCheck,
    wrap: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600",
  },
} as const;

export function ProviderActivityTimeline({
  logs,
  providerName: providerNameProp,
}: {
  logs: ProviderActivityLog[];
  providerName?: string;
}) {
  if (logs.length === 0) {
    return <p className="text-sm text-muted-foreground">No activity yet.</p>;
  }

  const sorted = [...logs].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  return (
    <div className="flex flex-col">
      {sorted.map((entry, idx) => {
        const isLast = idx === sorted.length - 1;
        const cfg = actionConfig[entry.action];
        const Icon = cfg.Icon;
        const providerName =
          providerNameProp ??
          serviceProviders.find((p) => p.id === entry.providerId)?.name ??
          "Provider";
        return (
          <div key={entry.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={`flex size-6 shrink-0 items-center justify-center rounded-full border ${cfg.wrap}`}
              >
                <Icon className="size-3.5" />
              </span>
              {!isLast && <span className="w-px flex-1 bg-border mt-1 min-h-3" />}
            </div>
            <div className={`flex min-w-0 flex-1 flex-col ${isLast ? "" : "pb-5"}`}>
              <span className="text-sm leading-5">
                {entry.action === "flat_assigned" && (
                  <>
                    <span className="font-medium text-foreground">{entry.actor}</span>
                    <span className="text-muted-foreground"> assigned </span>
                    <span className="font-medium text-foreground">{providerName}</span>
                    <span className="text-muted-foreground"> to {entry.flatNumber}</span>
                  </>
                )}
                {entry.action === "flat_removed" && (
                  <>
                    <span className="font-medium text-foreground">{entry.actor}</span>
                    <span className="text-muted-foreground"> removed </span>
                    <span className="font-medium text-foreground">{providerName}</span>
                    <span className="text-muted-foreground"> from {entry.flatNumber}</span>
                  </>
                )}
                {entry.action === "provider_blocked" && (
                  <>
                    <span className="font-medium text-foreground">{entry.actor}</span>
                    <span className="text-muted-foreground"> blocked </span>
                    <span className="font-medium text-foreground">{providerName}</span>
                  </>
                )}
                {entry.action === "provider_unblocked" && (
                  <>
                    <span className="font-medium text-foreground">{entry.actor}</span>
                    <span className="text-muted-foreground"> unblocked </span>
                    <span className="font-medium text-foreground">{providerName}</span>
                  </>
                )}
              </span>
              <span className="inline-flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span>{formatRelativeTime(entry.timestamp)}</span>
                {entry.flatNumber && (
                  <Badge variant="outline" className="px-1.5 py-0 text-[11px] font-normal">
                    {entry.flatNumber}
                  </Badge>
                )}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
