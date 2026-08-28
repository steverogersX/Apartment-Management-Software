"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  CalendarDays,
  CircleCheck,
  CircleDot,
  CircleSlash,
  CircleX,
  Clock,
  DoorOpen,
  QrCode,
  Ticket,
  UserRound,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataTable, type DataTableFilterConfig } from "@/components/dataTable";
import { DataTableColumnHeader } from "@/components/dataTableColumnHeader";
import { VisitorPass } from "@/components/visitorPass";
import { Visitor, VisitorStatus, visitors_log } from "@/lib/mockData";

const STATUS_META: Record<
  VisitorStatus,
  { label: string; color: string; icon: React.ComponentType<{ className?: string }> }
> = {
  expected: { label: "Expected", color: "text-blue-600 dark:text-blue-400", icon: Clock },
  entered: { label: "Inside", color: "text-amber-600 dark:text-amber-400", icon: DoorOpen },
  completed: {
    label: "Completed",
    color: "text-emerald-600 dark:text-emerald-400",
    icon: CircleCheck,
  },
  denied: { label: "Denied", color: "text-red-600 dark:text-red-400", icon: CircleX },
  expired: { label: "Expired", color: "text-muted-foreground", icon: CircleSlash },
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(time: string) {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
}

const columns: ColumnDef<Visitor>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader
        icon={UserRound}
        label="Visitor"
        sorted={column.getIsSorted()}
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2.5">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <UserRound className="size-3.5" />
        </span>
        <span className="truncate font-medium text-foreground">{row.original.name}</span>
      </div>
    ),
  },
  {
    id: "date",
    accessorKey: "date",
    meta: { label: "Date" },
    header: ({ column }) => (
      <DataTableColumnHeader
        icon={CalendarDays}
        label="Date"
        sorted={column.getIsSorted()}
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      />
    ),
    cell: ({ row }) => (
      <span className="flex items-center gap-1.5 whitespace-nowrap text-muted-foreground">
        {formatDate(row.original.date)}
      </span>
    ),
  },
  {
    id: "time",
    accessorKey: "time",
    meta: { label: "Time" },
    header: () => <DataTableColumnHeader icon={Clock} label="Time" />,
    cell: ({ row }) => (
      <span className="whitespace-nowrap tabular-nums text-muted-foreground">
        {formatTime(row.original.time)}
      </span>
    ),
  },
  {
    id: "status",
    accessorKey: "status",
    meta: { label: "Status" },
    header: () => <DataTableColumnHeader icon={CircleDot} label="Status" />,
    cell: ({ row }) => {
      const meta = STATUS_META[row.original.status];
      const Icon = meta.icon;
      return (
        <div className={cn("flex items-center gap-1.5 font-medium", meta.color)}>
          <Icon className="size-3.5" />
          <span className="whitespace-nowrap">{meta.label}</span>
        </div>
      );
    },
  },
  {
    id: "passCode",
    accessorKey: "passCode",
    meta: { label: "Pass" },
    header: () => <DataTableColumnHeader icon={Ticket} label="Pass" />,
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">{row.original.passCode}</span>
    ),
  },
  {
    id: "action",
    enableHiding: false,
    header: () => null,
    cell: () => (
      <div className="flex justify-end">
        <span className="flex items-center gap-1 text-xs text-muted-foreground/70 transition-colors group-hover/row:text-foreground">
          <QrCode className="size-4" />
        </span>
      </div>
    ),
  },
];

export function VisitorsTable() {
  const [selected, setSelected] = React.useState<Visitor | null>(null);

  const filters = React.useMemo<DataTableFilterConfig<Visitor>[]>(
    () => [
      {
        id: "search",
        label: "Search",
        type: "search",
        placeholder: "Search visitors…",
        predicate: (row, query) => row.name.toLowerCase().includes(query.trim().toLowerCase()),
      },
      {
        id: "status",
        label: "Status",
        type: "select",
        options: (["expected", "entered", "completed", "denied", "expired"] as VisitorStatus[]).map(
          (s) => ({ label: STATUS_META[s].label, value: s }),
        ),
        predicate: (row, value) => row.status === value,
      },
    ],
    [],
  );

  return (
    <>
      <DataTable
        data={visitors_log}
        columns={columns}
        title="Visitor log"
        filters={filters}
        showPageSize
        pageSize={5}
        itemLabel="visitor"
        emptyMessage="No visitors match your filters."
        initialSorting={[{ id: "date", desc: true }]}
        onRowClick={setSelected}
      />

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Visitor pass</DialogTitle>
            <DialogDescription>Entry pass details for this visitor.</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="my-1">
              <VisitorPass
                name={selected.name}
                date={selected.date}
                time={selected.time}
                code={selected.passCode}
                status={selected.status}
              />
            </div>
          )}
          <DialogFooter>
            <DialogClose render={<Button type="button" />}>Close</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
