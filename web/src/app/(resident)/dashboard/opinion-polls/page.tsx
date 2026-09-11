"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BarChart3, Clock, Plus, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { isPollClosed, opinionPolls } from "@/lib/pollsMockData";
import { useAuth } from "@/hooks/useAuth";

function formatRelativeTime(iso: string) {
  const diffMs = new Date(iso).getTime() - Date.now();
  const absMs = Math.abs(diffMs);
  const minutes = Math.round(absMs / 60000);
  const isFuture = diffMs > 0;
  if (minutes < 1) return isFuture ? "closes now" : "closed just now";
  if (minutes < 60) return isFuture ? `closes in ${minutes}m` : `closed ${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return isFuture ? `closes in ${hours}h` : `closed ${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return isFuture ? `closes in ${days}d` : `closed ${days}d ago`;
  return isFuture
    ? `closes ${new Date(iso).toLocaleDateString("en-IN")}`
    : `closed ${new Date(iso).toLocaleDateString("en-IN")}`;
}

export default function OpinionPollsPage() {
  const router = useRouter();
  const { has } = useAuth();
  const canCreate = has("PollsCreate");
  const currentUser = "Arvind Deshmukh";

  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"all" | "open" | "closed">("all");

  const filtered = React.useMemo(() => {
    let list = [...opinionPolls];
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.question.toLowerCase().includes(q) ||
          (p.description?.toLowerCase().includes(q) ?? false),
      );
    }
    if (statusFilter !== "all") {
      list = list.filter((p) => (statusFilter === "open" ? !isPollClosed(p) : isPollClosed(p)));
    }
    // newest first
    list.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
    return list;
  }, [query, statusFilter]);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold tracking-tight text-foreground">Opinion Polls</h1>
        <p className="text-sm text-muted-foreground">
          Casual questions for the community — vote and see results.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search polls…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {canCreate && (
          <Button
            size="sm"
            className="gap-1.5 sm:shrink-0"
            render={<Link href="/dashboard/opinion-polls/new" />}
          >
            <Plus className="size-3.5" />
            New poll
          </Button>
        )}
      </div>

      <Card className="overflow-hidden p-0">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">No polls found.</div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((poll) => {
              const closed = isPollClosed(poll);
              const totalVotes = poll.options.reduce((sum, o) => sum + o.votes.length, 0);
              const hasVoted = poll.options.some((o) => o.votes.includes(currentUser));
              return (
                <button
                  key={poll.id}
                  type="button"
                  onClick={() => router.push(`/dashboard/opinion-polls/${poll.id}`)}
                  className="flex w-full cursor-pointer flex-col gap-2 px-4 py-3 text-left transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="truncate text-sm font-semibold text-foreground">
                        {poll.question}
                      </span>
                      <Badge
                        variant={closed ? "secondary" : "default"}
                        className="px-1.5 py-0 text-[10px] capitalize"
                      >
                        {closed ? "Closed" : "Open"}
                      </Badge>
                      {hasVoted && (
                        <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
                          Voted
                        </Badge>
                      )}
                    </div>
                    {poll.description && (
                      <p className="line-clamp-1 text-xs text-muted-foreground">
                        {poll.description}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <BarChart3 className="size-3" />
                        {totalVotes} vote{totalVotes === 1 ? "" : "s"}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3" />
                        {formatRelativeTime(poll.closesAt)}
                      </span>
                    </div>
                  </div>
                  <div className="hidden shrink-0 items-center gap-2 sm:flex">
                    <Badge variant="outline" className="text-[10px]">
                      {poll.pollType === "single" ? "Single" : "Multiple"}
                    </Badge>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
