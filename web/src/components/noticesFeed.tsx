"use client";

import Link from "next/link";
import { Droplets, CalendarDays, Sparkles, Info, ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { useNow } from "@/hooks/useNow";
import { NoticeKind, notices } from "@/lib/mockData";

const KIND_META: Record<
  NoticeKind,
  { icon: React.ComponentType<{ className?: string }>; className: string }
> = {
  maintenance: { icon: Droplets, className: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  event: { icon: CalendarDays, className: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
  feature: {
    icon: Sparkles,
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  general: { icon: Info, className: "bg-muted text-muted-foreground" },
};

function relativeTime(iso: string, now: number) {
  const diffMs = now - new Date(iso).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Today";
  if (days === 1) return "1d";
  if (days < 7) return `${days}d`;
  return `${Math.floor(days / 7)}w`;
}

export function NoticesFeed() {
  const now = useNow();

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-md border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold text-foreground">Recent notices</h3>
        <span className="flex size-5 items-center justify-center rounded-full bg-muted text-[11px] font-medium text-muted-foreground">
          {notices.filter((n) => n.unread).length}
        </span>
      </div>

      <div className="flex flex-1 flex-col">
        {notices.map((notice) => {
          const meta = KIND_META[notice.kind];
          const Icon = meta.icon;
          return (
            <div
              key={notice.id}
              className="flex gap-3 border-b border-border px-4 py-3 transition-colors last:border-b-0 hover:bg-muted/40"
            >
              <span
                className={cn(
                  "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md",
                  meta.className,
                )}
              >
                <Icon className="size-3.5" />
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <div className="flex items-start justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                    {notice.unread && (
                      <span className="size-1.5 shrink-0 rounded-full bg-blue-500" />
                    )}
                    {notice.title}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground" suppressHydrationWarning>
                    {now ? relativeTime(notice.postedAt, now) : ""}
                  </span>
                </div>
                <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                  {notice.excerpt}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <Link
        href="/dashboard/notices"
        className="flex items-center justify-center gap-1 border-t border-border px-4 py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
      >
        View all notices
        <ArrowRight className="size-3.5" />
      </Link>
    </div>
  );
}
