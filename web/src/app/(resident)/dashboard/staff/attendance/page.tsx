"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { LogIn, LogOut } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableFilterConfig } from "@/components/dataTable";
import { DataTableColumnHeader } from "@/components/dataTableColumnHeader";
import {
  staffAttendanceEvents as staffAttendanceEventsSource,
  staffMembers,
  type StaffAttendanceEvent,
} from "@/lib/staffMockData";
import { useAuth } from "@/hooks/useAuth";
import { avatarUrlForName, getInitials, gradientForName } from "@/lib/utils";
import { PermissionDenied } from "@/components/permissionDenied";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
}

const staffById = new Map(staffMembers.map((s) => [s.id, s]));

type AttendanceRow = StaffAttendanceEvent & { staffName: string; staffRole: string };

export default function StaffAttendancePage() {
  const { user, has } = useAuth();
  const [events, setEvents] = React.useState<StaffAttendanceEvent[]>(() => [
    ...staffAttendanceEventsSource,
  ]);

  const canCheckIn = has("StaffCheckin");
  const canCheckOut = has("StaffCheckout");
  const canView = has("StaffViewAttendance") || canCheckIn || canCheckOut;

  const today = todayStr();
  const roster = React.useMemo(() => staffMembers.filter((s) => s.status !== "inactive"), []);

  function todaysEvent(staffId: string) {
    return events.find((e) => e.staffId === staffId && e.date === today) ?? null;
  }

  function handleCheckIn(staffId: string) {
    const now = new Date().toISOString();
    const event: StaffAttendanceEvent = {
      id: `satt-${staffId}-${Date.now()}`,
      staffId,
      date: today,
      checkInAt: now,
      checkOutAt: null,
      loggedBy: user?.displayName ?? "You",
    };
    staffAttendanceEventsSource.push(event);
    setEvents((prev) => [...prev, event]);
  }

  function handleCheckOut(staffId: string) {
    const now = new Date().toISOString();
    const idx = staffAttendanceEventsSource.findIndex(
      (e) => e.staffId === staffId && e.date === today,
    );
    if (idx !== -1) {
      staffAttendanceEventsSource[idx] = { ...staffAttendanceEventsSource[idx], checkOutAt: now };
    }
    setEvents((prev) =>
      prev.map((e) => (e.staffId === staffId && e.date === today ? { ...e, checkOutAt: now } : e)),
    );
  }

  const logRows = React.useMemo<AttendanceRow[]>(
    () =>
      events
        .map((e) => {
          const member = staffById.get(e.staffId);
          return { ...e, staffName: member?.name ?? e.staffId, staffRole: member?.role ?? "—" };
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [events],
  );

  const columns = React.useMemo<ColumnDef<AttendanceRow>[]>(
    () => [
      {
        id: "staffName",
        accessorKey: "staffName",
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Staff"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-medium text-foreground">{row.original.staffName}</span>
            <span className="truncate text-xs text-muted-foreground">{row.original.staffRole}</span>
          </div>
        ),
      },
      {
        id: "date",
        accessorKey: "date",
        meta: { label: "Date" },
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Date"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-foreground">{row.original.date}</span>
        ),
      },
      {
        id: "checkInAt",
        accessorKey: "checkInAt",
        meta: { label: "Check-in" },
        header: () => <DataTableColumnHeader label="Check-in" />,
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-muted-foreground">
            {row.original.checkInAt ? formatTime(row.original.checkInAt) : "—"}
          </span>
        ),
      },
      {
        id: "checkOutAt",
        accessorKey: "checkOutAt",
        meta: { label: "Check-out" },
        header: () => <DataTableColumnHeader label="Check-out" />,
        cell: ({ row }) =>
          row.original.checkOutAt ? (
            <span className="whitespace-nowrap text-muted-foreground">
              {formatTime(row.original.checkOutAt)}
            </span>
          ) : (
            <Badge variant="outline">On duty</Badge>
          ),
      },
      {
        id: "loggedBy",
        accessorKey: "loggedBy",
        meta: { label: "Logged by" },
        header: () => <DataTableColumnHeader label="Logged by" />,
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-muted-foreground">{row.original.loggedBy}</span>
        ),
      },
    ],
    [],
  );

  const filters = React.useMemo<DataTableFilterConfig<AttendanceRow>[]>(
    () => [
      {
        id: "search",
        label: "Search",
        type: "search",
        placeholder: "Search staff",
        predicate: (row, query) => row.staffName.toLowerCase().includes(query.toLowerCase()),
      },
    ],
    [],
  );

  if (!canView) {
    return <PermissionDenied message="You do not have permission to view staff attendance." />;
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">Staff Attendance</h1>
        <p className="text-sm text-muted-foreground">
          Today's roster and the full gate attendance log for every staff member.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-foreground">Today's roster</h3>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {roster.map((member) => {
            const event = todaysEvent(member.id);
            const [from, to] = gradientForName(member.name);
            return (
              <div
                key={member.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <Avatar size="sm">
                    <AvatarImage src={avatarUrlForName(member.name)} alt={member.name} />
                    <AvatarFallback
                      className="text-[11px] font-medium text-white"
                      style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}
                    >
                      {getInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-medium text-foreground">
                      {member.name}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {member.role} · {member.shift}
                      {event?.checkInAt &&
                        !event.checkOutAt &&
                        ` · In at ${formatTime(event.checkInAt)}`}
                      {event?.checkOutAt && ` · Done for today`}
                    </span>
                  </div>
                </div>
                {!event?.checkInAt && canCheckIn && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0 gap-1.5"
                    onClick={() => handleCheckIn(member.id)}
                  >
                    <LogIn className="size-3.5" />
                    Check in
                  </Button>
                )}
                {event?.checkInAt && !event.checkOutAt && canCheckOut && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0 gap-1.5"
                    onClick={() => handleCheckOut(member.id)}
                  >
                    <LogOut className="size-3.5" />
                    Check out
                  </Button>
                )}
                {event?.checkInAt && event.checkOutAt && (
                  <Badge variant="secondary" className="shrink-0">
                    Done
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <DataTable
        data={logRows}
        columns={columns}
        getRowId={(row) => row.id}
        title="Attendance log"
        filters={filters}
        showPageSize
        pageSize={10}
        itemLabel="entry"
        emptyMessage="No attendance recorded yet."
        initialSorting={[{ id: "date", desc: true }]}
      />
    </div>
  );
}
