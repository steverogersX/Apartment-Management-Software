"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageCircle, Pin, Plus, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { FORUM_CATEGORIES, forumThreads } from "@/lib/forumMockData";
import { useAuth } from "@/hooks/useAuth";
import { avatarUrlForName, getInitials, gradientForName } from "@/lib/utils";

function formatRelativeTime(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function DiscussionForumPage() {
  const router = useRouter();
  const { has } = useAuth();
  const canPost = has("ForumPost");

  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState<string>("all");
  const [sort, setSort] = React.useState<"latest" | "replies" | "newest">("latest");

  const filteredAndSorted = React.useMemo(() => {
    let list = [...forumThreads];

    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (t) => t.title.toLowerCase().includes(q) || t.body.toLowerCase().includes(q),
      );
    }

    if (category !== "all") {
      list = list.filter((t) => t.category === category);
    }

    // pinned first, then sort
    list.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      if (sort === "latest")
        return new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime();
      if (sort === "replies") {
        if (b.replyCount !== a.replyCount) return b.replyCount - a.replyCount;
        return new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime();
      }
      // newest
      return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
    });

    return list;
  }, [query, category, sort]);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold tracking-tight text-foreground">Discussion Forum</h1>
        <p className="text-sm text-muted-foreground">
          Ask questions, share ideas, and discuss society matters.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search title or body…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={category} onValueChange={(v) => setCategory((v as string) ?? "all")}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {FORUM_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => setSort((v as typeof sort) ?? "latest")}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest activity</SelectItem>
              <SelectItem value="replies">Most replies</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {canPost && (
          <Button
            size="sm"
            className="gap-1.5 sm:shrink-0"
            render={<Link href="/dashboard/discussion-forum/new" />}
          >
            <Plus className="size-3.5" />
            New thread
          </Button>
        )}
      </div>

      <Card className="overflow-hidden p-0">
        {filteredAndSorted.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">No threads found.</div>
        ) : (
          <div className="divide-y divide-border">
            {filteredAndSorted.map((thread) => {
              const [from, to] = gradientForName(thread.authorName);
              return (
                <button
                  key={thread.id}
                  type="button"
                  onClick={() => router.push(`/dashboard/discussion-forum/${thread.id}`)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50"
                >
                  <Avatar size="sm" className="shrink-0">
                    <AvatarImage
                      src={avatarUrlForName(thread.authorName)}
                      alt={thread.authorName}
                    />
                    <AvatarFallback
                      className="text-[11px] font-medium text-white"
                      style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}
                    >
                      {getInitials(thread.authorName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                      {thread.pinned && <Pin className="size-3 shrink-0 text-muted-foreground" />}
                      <span className="truncate text-sm font-semibold text-foreground">
                        {thread.title}
                      </span>
                      {thread.locked && (
                        <Badge variant="outline" className="px-1 py-0 text-[10px]">
                          Locked
                        </Badge>
                      )}
                    </div>
                    <p className="line-clamp-1 text-xs text-muted-foreground">{thread.body}</p>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant="outline" className="text-[10px]">
                        {thread.category}
                      </Badge>
                      {(thread.tags ?? []).slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[10px]">
                          {tag}
                        </Badge>
                      ))}
                      {(thread.tags?.length ?? 0) > 2 && (
                        <span className="text-xs text-muted-foreground">
                          +{(thread.tags?.length ?? 0) - 2}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="hidden shrink-0 flex-col items-end gap-1 text-xs text-muted-foreground sm:flex">
                    <span className="inline-flex items-center gap-1">
                      <MessageCircle className="size-3.5" />
                      {thread.replyCount}
                    </span>
                    <span>{formatRelativeTime(thread.lastActivityAt)}</span>
                  </div>
                  {/* mobile fallback */}
                  <div className="flex shrink-0 flex-col items-end gap-1 text-xs text-muted-foreground sm:hidden">
                    <span className="inline-flex items-center gap-1">
                      <MessageCircle className="size-3" />
                      {thread.replyCount}
                    </span>
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
