"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarDays, MapPin, Plus, Search } from "lucide-react";

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
import { getMeetingStatus, meetings } from "@/lib/meetingsMockData";
import { useAuth } from "@/hooks/useAuth";
import { avatarUrlForName, getInitials, gradientForName } from "@/lib/utils";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function MeetingsPage() {
  const router = useRouter();
  const { has } = useAuth();
  const canCreate = has("MeetingsSchedule");
  const currentUser = "Arvind Deshmukh";

  const [query, setQuery] = React.useState("");
  const [filter, setFilter] = React.useState<"all" | "upcoming" | "past" | "cancelled">("all");

  const filtered = React.useMemo(() => {
    let list = [...meetings];
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.agenda.toLowerCase().includes(q) ||
          (m.location?.toLowerCase().includes(q) ?? false),
      );
    }
    if (filter !== "all") {
      list = list.filter((m) => getMeetingStatus(m) === filter);
    }
    list.sort((a, b) => {
      const order = { upcoming: 0, past: 1, cancelled: 2 } as const;
      const sa = getMeetingStatus(a);
      const sb = getMeetingStatus(b);
      if (order[sa] !== order[sb]) return order[sa] - order[sb];
      if (sa === "upcoming")
        return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
      if (sa === "past")
        return new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime();
      return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
    });
    return list;
  }, [query, filter]);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold tracking-tight text-foreground">Meetings</h1>
        <p className="text-sm text-muted-foreground">
          Scheduled gatherings for the society — RSVP and stay updated.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search meetings…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="past">Past</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {canCreate && (
          <Button
            size="sm"
            className="gap-1.5 sm:shrink-0"
            render={<Link href="/dashboard/meetings/new" />}
          >
            <Plus className="size-3.5" />
            New meeting
          </Button>
        )}
      </div>

      <Card className="overflow-hidden p-0">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">No meetings found.</div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((meeting) => {
              const status = getMeetingStatus(meeting);
              const rsvp = meeting.rsvps.find((r) => r.name === currentUser);
              const rsvpLabel = rsvp
                ? rsvp.response === "yes"
                  ? "You're attending"
                  : rsvp.response === "no"
                    ? "You RSVP'd no"
                    : "You RSVP'd maybe"
                : null;
              const [from, to] = gradientForName(meeting.organizerName);
              return (
                <button
                  key={meeting.id}
                  type="button"
                  onClick={() => router.push(`/dashboard/meetings/${meeting.id}`)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50"
                >
                  <Avatar size="sm" className="shrink-0">
                    <AvatarImage
                      src={avatarUrlForName(meeting.organizerName)}
                      alt={meeting.organizerName}
                    />
                    <AvatarFallback
                      className="text-[11px] font-medium text-white"
                      style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}
                    >
                      {getInitials(meeting.organizerName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="truncate text-sm font-semibold text-foreground">
                        {meeting.title}
                      </span>
                      <Badge
                        variant={
                          status === "upcoming"
                            ? "default"
                            : status === "past"
                              ? "secondary"
                              : "outline"
                        }
                        className="px-1.5 py-0 text-[10px] capitalize"
                      >
                        {status}
                      </Badge>
                      {rsvpLabel && (
                        <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
                          {rsvpLabel}
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="size-3" />
                        {formatDateTime(meeting.scheduledAt)}
                      </span>
                      {meeting.location && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="size-3" />
                          <span className="truncate max-w-[160px]">{meeting.location}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="hidden shrink-0 flex-col items-end gap-1 text-xs text-muted-foreground sm:flex">
                    <span>
                      {meeting.organizerName} · {meeting.organizerFlat}
                    </span>
                    <span>
                      {meeting.rsvps.length} RSVP{meeting.rsvps.length === 1 ? "" : "s"}
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
