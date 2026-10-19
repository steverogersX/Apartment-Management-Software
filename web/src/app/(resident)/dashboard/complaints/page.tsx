"use client";

import * as React from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CalendarDays,
  CircleCheck,
  Home,
  Tag,
  UserRound,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { ComplaintsTable, type ComplaintRow } from "@/components/complaintsTable";
import { ComplaintTimeline } from "@/components/complaints/complaintTimeline";
import {
  complaints as complaintsSource,
  complaintStatusEvents as complaintStatusEventsSource,
  type Complaint,
  type ComplaintStatus,
  type ComplaintStatusEvent,
} from "@/lib/mockData";
import { useAuth } from "@/hooks/useAuth";
import { avatarUrlForName } from "@/lib/utils";
import { PermissionDenied } from "@/components/permissionDenied";
import { useToast } from "@/components/ui/toast";
import { PageIcon } from "@/components/pageIcon";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

const STATUS_LABEL: Record<ComplaintStatus, string> = {
  open: "Open",
  in_progress: "In progress",
  resolved: "Resolved",
  escalated: "Escalated",
};

const STATUS_VARIANT: Record<ComplaintStatus, "default" | "secondary" | "outline" | "destructive"> =
  {
    open: "secondary",
    in_progress: "outline",
    resolved: "default",
    escalated: "destructive",
  };

const PRIORITY_META: Record<
  string,
  { label: string; color: string; icon: React.ComponentType<{ className?: string }> }
> = {
  high: { label: "High", color: "text-red-600 dark:text-red-400", icon: ArrowUp },
  medium: { label: "Medium", color: "text-amber-600 dark:text-amber-400", icon: ArrowRight },
  low: { label: "Low", color: "text-muted-foreground", icon: ArrowDown },
};

export default function ComplaintsPage() {
  const { toast } = useToast();
  const { user, has } = useAuth();
  const [complaintsData, setComplaintsData] = React.useState<Complaint[]>(() => [
    ...complaintsSource,
  ]);
  const [statusEvents, setStatusEvents] = React.useState<ComplaintStatusEvent[]>(() => [
    ...complaintStatusEventsSource,
  ]);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState(false);

  const selected = React.useMemo(
    () => complaintsData.find((c) => c.id === selectedId) ?? null,
    [complaintsData, selectedId],
  );
  const timeline = React.useMemo(
    () => (selected ? statusEvents.filter((e) => e.complaintId === selected.id) : []),
    [selected, statusEvents],
  );

  function handleResolve() {
    if (!selected) return;
    const now = new Date().toISOString();
    const idx = complaintsSource.findIndex((c) => c.id === selected.id);
    if (idx !== -1) {
      complaintsSource[idx] = { ...complaintsSource[idx], status: "resolved", resolvedAt: now };
    }
    setComplaintsData((prev) =>
      prev.map((c) => (c.id === selected.id ? { ...c, status: "resolved", resolvedAt: now } : c)),
    );
    const event: ComplaintStatusEvent = {
      id: `cse-${selected.id}-${Date.now()}`,
      complaintId: selected.id,
      status: "resolved",
      note: "Marked resolved by the resident who raised it",
      at: now,
      by: user?.displayName ?? selected.raisedBy,
    };
    complaintStatusEventsSource.push(event);
    setStatusEvents((prev) => [...prev, event]);
    toast({ title: "Complaint marked resolved" });
  }

  if (!has("ComplaintsRaise")) {
    return <PermissionDenied message="You do not have permission to view this page." />;
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5">
      <div>
        <h1 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground">
          <PageIcon />
          My Complaints
        </h1>
        <p className="text-sm text-muted-foreground">
          Raise, track, and resolve issues for Flat 304 — only you can mark your own ticket
          resolved.
        </p>
      </div>
      <ComplaintsTable
        data={complaintsData as unknown as ComplaintRow[]}
        onRowClick={(row: ComplaintRow) => {
          setSelectedId(row.id);
          setOpen(true);
        }}
      />

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
          {selected && (
            <>
              <SheetHeader className="border-b border-border p-4 text-left">
                <SheetTitle className="flex items-center gap-2 text-base">
                  {selected.ticketNumber}
                  <Badge variant={STATUS_VARIANT[selected.status]} className="capitalize">
                    {STATUS_LABEL[selected.status]}
                  </Badge>
                </SheetTitle>
                <SheetDescription className="text-sm font-medium text-foreground">
                  {selected.title}
                </SheetDescription>
              </SheetHeader>

              <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex flex-col gap-1">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Tag className="size-3.5" />
                      Category
                    </span>
                    <span className="font-medium text-foreground">{selected.category}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <CalendarDays className="size-3.5" />
                      Created
                    </span>
                    <span className="font-medium text-foreground">
                      {formatDateTime(selected.createdAt)}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Priority</span>
                    {(() => {
                      const meta = PRIORITY_META[selected.priority];
                      const Icon = meta.icon;
                      return (
                        <span
                          className={`inline-flex items-center gap-1 font-medium ${meta.color}`}
                        >
                          <Icon className="size-3.5" />
                          {meta.label}
                        </span>
                      );
                    })()}
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Home className="size-3.5" />
                      Flat
                    </span>
                    <span className="font-medium text-foreground">
                      {selected.tower}-{selected.flatNumber}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-xs text-muted-foreground">Assigned to</span>
                  {selected.assignedTo ? (
                    <div className="flex items-center gap-2">
                      <Avatar size="sm">
                        <AvatarImage
                          src={avatarUrlForName(selected.assignedTo.name)}
                          alt={selected.assignedTo.name}
                        />
                        <AvatarFallback className="text-[11px]">
                          {selected.assignedTo.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-foreground">
                        {selected.assignedTo.name}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">Not yet assigned</span>
                  )}
                </div>

                <Separator />

                <div className="flex flex-col gap-4">
                  <h4 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                    <UserRound className="size-3.5 text-muted-foreground" />
                    Timeline · {timeline.length}
                  </h4>
                  <ComplaintTimeline events={timeline} />
                </div>

                {selected.status !== "resolved" && (
                  <div className="flex flex-col gap-2 border-t border-border pt-4">
                    <Button size="sm" className="w-full gap-1.5" onClick={handleResolve}>
                      <CircleCheck className="size-3.5" />
                      Mark resolved
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Only you, as the resident who raised this ticket, can mark it resolved —
                      committee and staff can assign or escalate it, but not close it out.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
