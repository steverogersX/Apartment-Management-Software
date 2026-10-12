"use client";

import * as React from "react";
import Link from "next/link";
import { CalendarHeart, Plus, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AddEventForm } from "@/components/events/addEventForm";
import { useAuth } from "@/hooks/useAuth";
import {
  communityEvents,
  fundingSummary,
  type AddEventInput,
  type CommunityEvent,
} from "@/lib/eventsMockData";
import { formatCurrency, formatDate } from "@/lib/utils";

type StatusFilter = "Open" | "Closed" | "All";

function EventCard({ event }: { event: CommunityEvent }) {
  const { funded, pending, fundedPct } = fundingSummary(event);
  return (
    <Link href={`/dashboard/accounts/events/${event.id}`}>
      <Card className="h-full transition-colors hover:border-foreground/20">
        <CardHeader className="gap-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <CalendarHeart className="size-4 text-muted-foreground" />
              {event.name}
            </CardTitle>
            <Badge variant={event.status === "Open" ? "secondary" : "outline"}>
              {event.status}
            </Badge>
          </div>
          <p className="line-clamp-2 text-xs text-muted-foreground">{event.description}</p>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-xs text-muted-foreground">Event date {formatDate(event.eventDate)}</p>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${fundedPct}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              <span className="font-medium text-foreground">{formatCurrency(funded)}</span> of{" "}
              {formatCurrency(event.targetAmount)}
            </span>
            {pending > 0 ? (
              <span className="text-amber-600 dark:text-amber-400">
                {formatCurrency(pending)} pending
              </span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400">Fully funded</span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function EventsPage() {
  const { has } = useAuth();
  const canManage = has("EventsManage");
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("Open");
  const [createOpen, setCreateOpen] = React.useState(false);
  const [version, setVersion] = React.useState(0);

  const events = React.useMemo(
    () =>
      communityEvents
        .filter((e) => statusFilter === "All" || e.status === statusFilter)
        .sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [statusFilter, version],
  );

  function handleCreate(values: AddEventInput) {
    communityEvents.push({
      id: crypto.randomUUID(),
      name: values.name,
      description: values.description ?? "",
      targetAmount: values.targetAmount,
      eventDate: values.eventDate,
      status: "Open",
      createdBy: "You",
      createdAt: new Date().toISOString(),
      closedAt: null,
    });
    setVersion((v) => v + 1);
    setCreateOpen(false);
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Events</h1>
          <p className="text-sm text-muted-foreground">
            Community events funded by voluntary flat contributions — festivals, celebrations, and
            society-wide collections.
          </p>
        </div>
        {canManage && (
          <Button size="sm" className="gap-1.5" onClick={() => setCreateOpen(true)}>
            <Plus className="size-3.5" />
            New event
          </Button>
        )}
      </div>

      <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1 self-start">
        {(["Open", "Closed", "All"] as StatusFilter[]).map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setStatusFilter(status)}
          >
            {status}
          </Button>
        ))}
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="flex h-32 flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
            <Sparkles className="size-5" />
            No {statusFilter !== "All" ? statusFilter.toLowerCase() : ""} events yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New event</DialogTitle>
            <DialogDescription>
              Create a community event and share it with every flat.
            </DialogDescription>
          </DialogHeader>
          <AddEventForm onSave={handleCreate} onCancel={() => setCreateOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
