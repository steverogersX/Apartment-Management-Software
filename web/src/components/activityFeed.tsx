"use client";

import * as React from "react";
import { format, formatDistanceToNow, isToday } from "date-fns";
import { AlertTriangle, Check, Sparkles, Ticket, X } from "lucide-react";

import { cn, getInitials, gradientForName } from "@/lib/utils";
import { useNow } from "@/hooks/useNow";
import { Button } from "@/components/ui/button";
import { type Complaint, type ComplaintStatus, complaints, visitors_log } from "@/lib/mockData";

const COMPLAINT_STATUS_META: Record<
  ComplaintStatus,
  { icon: React.ComponentType<{ className?: string }>; className: string }
> = {
  open: { icon: Ticket, className: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  in_progress: { icon: Ticket, className: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  resolved: { icon: Ticket, className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  escalated: { icon: AlertTriangle, className: "bg-red-500/10 text-red-600 dark:text-red-400" },
};

type ActivityEntry = {
  id: string;
  timestamp: number;
  urgent: boolean;
  primary: string;
  secondary: string;
  timeLabel: string;
} & ({ kind: "visitor"; name: string } | { kind: "complaint"; status: ComplaintStatus });

function describeVisitor(v: (typeof visitors_log)[number], now: number): ActivityEntry {
  const dt = new Date(`${v.date}T${v.time}:00`);
  return {
    id: `visitor-${v.id}`,
    kind: "visitor",
    name: v.name,
    timestamp: dt.getTime(),
    urgent: dt.getTime() - now > 0 && dt.getTime() - now < 1000 * 60 * 60,
    primary: v.name,
    secondary: `Expected visitor · Pass ${v.passCode}`,
    timeLabel: isToday(dt) ? `Today, ${format(dt, "h:mm a")}` : format(dt, "MMM d, h:mm a"),
  };
}

function describeComplaint(c: Complaint): ActivityEntry {
  return {
    id: `complaint-${c.id}`,
    kind: "complaint",
    status: c.status,
    timestamp: new Date(c.createdAt).getTime(),
    urgent: c.status === "escalated",
    primary: c.title,
    secondary: `${c.ticketNumber} · ${c.category}`,
    timeLabel: formatDistanceToNow(new Date(c.createdAt), { addSuffix: true }),
  };
}

function buildActivity(now: number): ActivityEntry[] {
  const recentVisitors = visitors_log
    .filter((v) => v.status === "expected")
    .map((v) => describeVisitor(v, now));

  const recentComplaints = complaints
    .filter(
      (c) =>
        c.status === "escalated" ||
        (c.status === "open" && now - new Date(c.createdAt).getTime() < 1000 * 60 * 60 * 24 * 3),
    )
    .map(describeComplaint);

  return [...recentVisitors, ...recentComplaints].sort((a, b) => {
    if (a.urgent !== b.urgent) return a.urgent ? -1 : 1;
    return b.timestamp - a.timestamp;
  });
}

function ActivityIcon({ entry }: { entry: ActivityEntry }) {
  if (entry.kind === "visitor") {
    const [from, to] = gradientForName(entry.name);
    return (
      <span
        className="flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white"
        style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}
      >
        {getInitials(entry.name)}
      </span>
    );
  }

  const meta = COMPLAINT_STATUS_META[entry.status];
  const Icon = meta.icon;
  return (
    <span
      className={cn("flex size-8 shrink-0 items-center justify-center rounded-md", meta.className)}
    >
      <Icon className="size-4" />
    </span>
  );
}

function ActivityRow({ entry }: { entry: ActivityEntry }) {
  return (
    <div
      className={cn(
        "flex gap-3 border-b border-border px-4 py-3 transition-colors last:border-b-0 hover:bg-muted/40",
        entry.urgent && "border-l-2 border-l-red-500",
      )}
    >
      <ActivityIcon entry={entry} />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-start justify-between gap-2">
          <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
            {entry.urgent && <span className="size-1.5 shrink-0 rounded-full bg-red-500" />}
            {entry.primary}
          </span>
          <span className="shrink-0 text-xs text-muted-foreground">{entry.timeLabel}</span>
        </div>
        <p className="truncate text-xs text-muted-foreground">{entry.secondary}</p>

        {entry.kind === "visitor" && (
          <div className="mt-1.5 flex gap-1.5">
            <Button variant="outline" size="xs" className="gap-1">
              <Check className="size-3" />
              Approve
            </Button>
            <Button variant="ghost" size="xs" className="gap-1 text-muted-foreground">
              <X className="size-3" />
              Deny
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 py-10 text-center">
      <Sparkles className="size-5 text-muted-foreground/50" />
      <p className="text-sm text-muted-foreground">All quiet for now.</p>
    </div>
  );
}

export function ActivityFeed() {
  const now = useNow();

  const activity = React.useMemo(() => (now ? buildActivity(now) : []), [now]);
  const today = activity.filter((a) => isToday(new Date(a.timestamp)));
  const earlier = activity.filter((a) => !isToday(new Date(a.timestamp)));

  return (
    <div className="flex flex-col overflow-hidden rounded-md border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold text-foreground">What&apos;s happening</h3>
        {activity.length > 0 && (
          <span className="flex size-5 items-center justify-center rounded-full bg-muted text-[11px] font-medium text-muted-foreground">
            {activity.length}
          </span>
        )}
      </div>

      {now === null ? null : activity.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col">
          {today.length > 0 && (
            <>
              <div className="px-4 pt-2.5 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                Today
              </div>
              {today.map((entry) => (
                <ActivityRow key={entry.id} entry={entry} />
              ))}
            </>
          )}
          {earlier.length > 0 && (
            <>
              <div className="px-4 pt-2.5 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                Earlier this week
              </div>
              {earlier.map((entry) => (
                <ActivityRow key={entry.id} entry={entry} />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
