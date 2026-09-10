"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpFromLine,
  Banknote,
  CalendarHeart,
  CircleCheck,
  CirclePlus,
  Landmark,
  Lock,
} from "lucide-react";

import { avatarUrlForName, cn, getInitials, gradientForName } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { RecordContributionForm } from "@/components/events/recordContributionForm";
import { RecordTopUpForm } from "@/components/events/recordTopUpForm";
import { useAuth } from "@/hooks/useAuth";
import {
  communityEvents,
  contributionsFor,
  eventContributions,
  eventTopUps,
  fundingSummary,
  topUpsFor,
  type EventContribution,
  type EventTopUp,
  type RecordContributionInput,
  type RecordTopUpInput,
} from "@/lib/eventsMockData";
import { flats } from "@/lib/flatsMockData";
import { residents } from "@/lib/residentsMockData";

function formatCurrency(amount: number) {
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

type TimelineEntry =
  | { kind: "contribution"; id: string; date: string; data: EventContribution }
  | { kind: "topup"; id: string; date: string; data: EventTopUp };

function EventTimeline({ entries }: { entries: TimelineEntry[] }) {
  if (entries.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
        No contributions recorded yet.
      </p>
    );
  }
  return (
    <div className="flex flex-col">
      {entries.map((entry, index) => {
        const isLast = index === entries.length - 1;
        const isTopUp = entry.kind === "topup";
        const [from, to] = !isTopUp ? gradientForName(entry.data.residentName) : ["", ""];
        return (
          <div key={entry.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              {isTopUp ? (
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400">
                  <Landmark className="size-3.5" />
                </span>
              ) : (
                <Avatar className="size-6 shrink-0">
                  <AvatarImage
                    src={avatarUrlForName(entry.data.residentName)}
                    alt={entry.data.residentName}
                  />
                  <AvatarFallback
                    className="text-[9px] font-semibold text-white"
                    style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}
                  >
                    {getInitials(entry.data.residentName)}
                  </AvatarFallback>
                </Avatar>
              )}
              {!isLast && <span className="w-px flex-1 bg-border" />}
            </div>
            <div className={cn("flex flex-col gap-0.5", isLast ? "pb-0.5" : "pb-5")}>
              {isTopUp ? (
                <>
                  <p className="pt-0.5 text-sm font-medium text-foreground">
                    Society top-up{" "}
                    <span className="font-normal text-muted-foreground">
                      {formatCurrency(entry.data.amount)}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">{entry.data.note}</p>
                </>
              ) : (
                <>
                  <p className="pt-0.5 text-sm font-medium text-foreground">
                    {entry.data.residentName}{" "}
                    <span className="font-normal text-muted-foreground">
                      gave {formatCurrency(entry.data.amount)}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {entry.data.flatLabel} · {entry.data.mode}
                    {entry.data.note ? ` · ${entry.data.note}` : ""}
                  </p>
                </>
              )}
              <p className="text-[11px] text-muted-foreground/80">
                {formatDateTime(entry.date)} · by {entry.data.recordedBy}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function EventDetailPage() {
  const params = useParams<{ eventId: string }>();
  const router = useRouter();
  const { has } = useAuth();
  const canManage = has("EventsManage");

  const [version, setVersion] = React.useState(0);
  const [contributeOpen, setContributeOpen] = React.useState(false);
  const [topUpOpen, setTopUpOpen] = React.useState(false);
  const [closeOpen, setCloseOpen] = React.useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const event = React.useMemo(
    () => communityEvents.find((e) => e.id === params.eventId),
    [params.eventId, version],
  );

  if (!has("EventsViewAll") && !has("EventsViewOwn")) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm text-muted-foreground">You do not have permission to view events.</p>
        <Link href="/dashboard" className="text-sm font-medium text-foreground underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <p className="text-sm text-muted-foreground">Event not found.</p>
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline"
        >
          <ArrowLeft className="size-3.5" />
          Back
        </button>
      </div>
    );
  }

  const { contributed, toppedUp, pending, fundedPct } = fundingSummary(event);

  const timeline: TimelineEntry[] = [
    ...contributionsFor(event.id).map((c) => ({
      kind: "contribution" as const,
      id: c.id,
      date: c.date,
      data: c,
    })),
    ...topUpsFor(event.id).map((t) => ({
      kind: "topup" as const,
      id: t.id,
      date: t.date,
      data: t,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  function handleContribute(values: RecordContributionInput) {
    if (!event) return;
    const flat = flats.find((f) => f.id === values.flatId);
    const resident = residents.find((r) => r.id === values.residentId);
    eventContributions.push({
      id: crypto.randomUUID(),
      eventId: event.id,
      flatId: values.flatId,
      flatLabel: flat ? `${flat.tower}-${flat.flatNumber}` : values.flatId,
      residentName: resident?.name ?? "Unknown resident",
      amount: values.amount,
      mode: values.mode,
      date: new Date(values.date).toISOString(),
      note: values.note?.trim() ? values.note.trim() : null,
      recordedBy: "You",
    });
    setVersion((v) => v + 1);
    setContributeOpen(false);
  }

  function handleTopUp(values: RecordTopUpInput) {
    if (!event) return;
    eventTopUps.push({
      id: crypto.randomUUID(),
      eventId: event.id,
      amount: values.amount,
      note: values.note,
      date: new Date(values.date).toISOString(),
      recordedBy: "You",
    });
    setVersion((v) => v + 1);
    setTopUpOpen(false);
  }

  function handleClose() {
    if (!event) return;
    const index = communityEvents.findIndex((e) => e.id === event.id);
    if (index === -1) return;
    communityEvents[index] = {
      ...communityEvents[index],
      status: "Closed",
      closedAt: new Date().toISOString(),
    };
    setVersion((v) => v + 1);
    setCloseOpen(false);
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Back
      </button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground">
              <CalendarHeart className="size-5 text-muted-foreground" />
              {event.name}
            </h1>
            <Badge variant={event.status === "Open" ? "secondary" : "outline"}>
              {event.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{event.description}</p>
          <p className="text-xs text-muted-foreground">
            Event date {formatDate(event.eventDate)} · Created by {event.createdBy} on{" "}
            {formatDate(event.createdAt)}
            {event.closedAt ? ` · Closed ${formatDate(event.closedAt)}` : ""}
          </p>
        </div>
        {canManage && event.status === "Open" && (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              onClick={() => setContributeOpen(true)}
            >
              <CirclePlus className="size-3.5" />
              Record contribution
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              onClick={() => setTopUpOpen(true)}
              disabled={pending === 0}
            >
              <ArrowUpFromLine className="size-3.5" />
              Society top-up
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-muted-foreground"
              onClick={() => setCloseOpen(true)}
            >
              <Lock className="size-3.5" />
              Close event
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <p className="text-xs text-muted-foreground">Target</p>
            <CardTitle className="text-xl tabular-nums">
              {formatCurrency(event.targetAmount)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <p className="text-xs text-muted-foreground">Collected from flats</p>
            <CardTitle className="text-xl tabular-nums">{formatCurrency(contributed)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <p className="text-xs text-muted-foreground">Society top-up</p>
            <CardTitle className="text-xl tabular-nums">{formatCurrency(toppedUp)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <p className="text-xs text-muted-foreground">Pending</p>
            <CardTitle
              className={cn(
                "text-xl tabular-nums",
                pending > 0
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-emerald-600 dark:text-emerald-400",
              )}
            >
              {pending > 0 ? formatCurrency(pending) : "₹0"}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-2 pt-6">
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${fundedPct}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{fundedPct.toFixed(0)}% funded</span>
            {pending === 0 && (
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <CircleCheck className="size-3.5" />
                Fully funded
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Banknote className="size-4 text-muted-foreground" />
              History · {timeline.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EventTimeline entries={timeline} />
          </CardContent>
        </Card>
      </div>

      <Dialog open={contributeOpen} onOpenChange={setContributeOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Record contribution</DialogTitle>
            <DialogDescription>
              Log an amount a flat has given toward {event.name}.
            </DialogDescription>
          </DialogHeader>
          <RecordContributionForm
            onSave={handleContribute}
            onCancel={() => setContributeOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={topUpOpen} onOpenChange={setTopUpOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Society top-up</DialogTitle>
            <DialogDescription>
              Cover some or all of the shortfall from society funds.
            </DialogDescription>
          </DialogHeader>
          <RecordTopUpForm
            pendingAmount={pending}
            onSave={handleTopUp}
            onCancel={() => setTopUpOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={closeOpen} onOpenChange={setCloseOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Close this event?</DialogTitle>
            <DialogDescription>
              {pending > 0
                ? `There's still ${formatCurrency(pending)} pending against the target. Closing stops new contributions — you can still record a society top-up first if you'd rather cover it.`
                : "This event is fully funded. Closing stops new contributions and freezes its final numbers."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setCloseOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleClose}>Close event</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
