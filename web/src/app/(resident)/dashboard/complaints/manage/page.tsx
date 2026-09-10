"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUp, CalendarDays, Home, Tag, UserRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ComplaintsTable, type ComplaintRow } from "@/components/complaintsTable";
import { ComplaintTimeline } from "@/components/complaints/complaintTimeline";
import {
  complaints as complaintsSource,
  complaintStatusEvents as complaintStatusEventsSource,
  type Complaint,
  type ComplaintStatus,
  type ComplaintStatusEvent,
} from "@/lib/mockData";
import { residents } from "@/lib/residentsMockData";
import { users } from "@/lib/usersMockData";
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

export default function ComplaintsManagePage() {
  const { has } = useAuth();

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

  const selectedTimeline = React.useMemo(
    () => (selected ? statusEvents.filter((e) => e.complaintId === selected.id) : []),
    [selected, statusEvents],
  );

  const raisedByFlat = React.useMemo(() => {
    if (!selected) return null;
    if (selected.tower && selected.flatNumber) return `${selected.tower}-${selected.flatNumber}`;
    const resident = residents.find((r) => r.name === selected.raisedBy);
    return resident ? `${resident.tower}-${resident.flatNumber}` : null;
  }, [selected]);

  function updateComplaint(id: string, patch: Partial<Complaint>) {
    const idx = complaintsSource.findIndex((c) => c.id === id);
    if (idx !== -1) {
      complaintsSource[idx] = { ...complaintsSource[idx], ...patch };
    }
    setComplaintsData((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  function handleRowClick(row: ComplaintRow) {
    setSelectedId(row.id);
    setOpen(true);
  }

  function handleAssign(userName: string | null) {
    if (!userName || !selected) return;
    const user = users.find((u) => u.name === userName);
    if (!user) return;
    const initials = getInitials(user.name);
    updateComplaint(selected.id, { assignedTo: { name: user.name, initials } });
  }

  function handleStatusChange(status: ComplaintStatus) {
    if (!selected) return;
    const patch: Partial<Complaint> = { status };
    if (status === "resolved") {
      patch.resolvedAt = new Date().toISOString();
    }
    updateComplaint(selected.id, patch);

    const note =
      status === "in_progress"
        ? "Marked in progress"
        : status === "resolved"
          ? "Marked resolved"
          : status === "escalated"
            ? "Escalated"
            : "Status updated";
    const event: ComplaintStatusEvent = {
      id: `cse-${selected.id}-${Date.now()}`,
      complaintId: selected.id,
      status,
      note,
      at: new Date().toISOString(),
      by: "You",
    };
    complaintStatusEventsSource.push(event);
    setStatusEvents((prev) => [...prev, event]);
  }

  const canAssign = has("ComplaintsAssign");
  const canEscalate = has("ComplaintsEscalate");

  // Assignee options: committee/admin users, filtered to non-resident roles
  const assigneeOptions = React.useMemo(() => {
    const allowedRoles = new Set(["Society Admin", "Secretary", "Treasurer", "Committee Member"]);
    return users.filter((u) => allowedRoles.has(u.role));
  }, []);

  if (!has("ComplaintsViewAll")) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm text-muted-foreground">
          You do not have permission to view complaints.
        </p>
        <Link href="/dashboard" className="text-sm font-medium text-foreground underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">Complaints</h1>
        <p className="text-sm text-muted-foreground">All complaints across the society.</p>
      </div>

      <ComplaintsTable
        data={complaintsData as unknown as ComplaintRow[]}
        title="All complaints"
        showSociety={false}
        showAssignee
        enableGrouping
        onRowClick={handleRowClick}
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
                    <span className="font-medium text-foreground">{raisedByFlat ?? "—"}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <UserRound className="size-3.5" />
                    Raised by
                  </span>
                  <div className="flex items-center gap-2.5">
                    {(() => {
                      const [from, to] = gradientForName(selected.raisedBy);
                      return (
                        <Avatar size="sm">
                          <AvatarImage
                            src={avatarUrlForName(selected.raisedBy)}
                            alt={selected.raisedBy}
                          />
                          <AvatarFallback
                            className="text-[11px] font-medium text-white"
                            style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}
                          >
                            {getInitials(selected.raisedBy)}
                          </AvatarFallback>
                        </Avatar>
                      );
                    })()}
                    <span className="text-sm font-medium text-foreground">{selected.raisedBy}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-xs text-muted-foreground">Status</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={STATUS_VARIANT[selected.status]} className="capitalize">
                      {STATUS_LABEL[selected.status]}
                    </Badge>
                    {selected.assignedTo && (
                      <span className="text-xs text-muted-foreground">
                        · Assigned to {selected.assignedTo.name}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-xs text-muted-foreground">Assigned to</span>
                  {selected.assignedTo ? (
                    <Link
                      href={`/dashboard/complaints/assignee/${encodeURIComponent(selected.assignedTo.name)}`}
                      className="flex w-fit items-center gap-2 hover:underline"
                    >
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
                    </Link>
                  ) : (
                    <span className="text-sm text-muted-foreground">Unassigned</span>
                  )}
                </div>

                <Separator />

                <div className="flex flex-col gap-4">
                  <h4 className="text-sm font-semibold text-foreground">
                    Timeline · {selectedTimeline.length}
                  </h4>
                  <ComplaintTimeline events={selectedTimeline} />
                </div>

                <div className="flex flex-col gap-3 border-t border-border pt-4">
                  <h4 className="text-sm font-semibold text-foreground">Actions</h4>

                  {canAssign && (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs font-medium text-foreground">Assign</span>
                      <Select value={selected.assignedTo?.name ?? ""} onValueChange={handleAssign}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select assignee" />
                        </SelectTrigger>
                        <SelectContent className="min-w-72">
                          {assigneeOptions.map((u) => (
                            <SelectItem key={u.id} value={u.name}>
                              {u.name} · {u.role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {canAssign && selected.status === "open" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-fit"
                      onClick={() => handleStatusChange("in_progress")}
                    >
                      Mark in progress
                    </Button>
                  )}

                  {canEscalate &&
                    selected.status !== "escalated" &&
                    selected.status !== "resolved" && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleStatusChange("escalated")}
                      >
                        Escalate
                      </Button>
                    )}

                  <p className="text-xs text-muted-foreground">
                    Only the resident who raised this ticket can mark it resolved.
                  </p>

                  {!canAssign && !canEscalate && (
                    <p className="text-xs text-muted-foreground">
                      You do not have permission to perform actions.
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
