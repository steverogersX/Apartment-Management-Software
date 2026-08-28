"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowDown, ArrowRight, ArrowUp } from "lucide-react";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DataTable, type DataTableFilterConfig } from "@/components/dataTable";
import { DataTableColumnHeader } from "@/components/dataTableColumnHeader";
import { ComplaintPriority, ComplaintStatus, complaints } from "@/lib/mockData";

export type ComplaintRow = {
  id: string;
  ticketNumber: string;
  title: string;
  category: string;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  createdAt: string;
  societyName?: string;
  assignedTo?: { name: string; initials: string } | null;
};

const STATUS_DOT: Record<ComplaintStatus, string> = {
  open: "bg-blue-500",
  in_progress: "bg-amber-500",
  resolved: "bg-emerald-500",
  escalated: "bg-red-500",
};

const STATUS_LABEL: Record<ComplaintStatus, string> = {
  open: "Open",
  in_progress: "In progress",
  resolved: "Resolved",
  escalated: "Escalated",
};

const PRIORITY_META: Record<
  ComplaintPriority,
  { label: string; color: string; icon: React.ComponentType<{ className?: string }> }
> = {
  high: { label: "High", color: "text-red-600 dark:text-red-400", icon: ArrowUp },
  medium: { label: "Medium", color: "text-amber-600 dark:text-amber-400", icon: ArrowRight },
  low: { label: "Low", color: "text-muted-foreground", icon: ArrowDown },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function ComplaintsTable({
  data: dataProp,
  title = "Recent complaints",
  compact = false,
  showSociety = false,
  showAssignee = true,
  showPageSize = false,
}: {
  data?: ComplaintRow[];
  title?: string;
  compact?: boolean;
  showSociety?: boolean;
  showAssignee?: boolean;
  showPageSize?: boolean;
}) {
  const source = dataProp ?? complaints;

  const columns = React.useMemo<ColumnDef<ComplaintRow>[]>(() => {
    const all: ColumnDef<ComplaintRow>[] = [
      {
        id: "ticketNumber",
        accessorKey: "ticketNumber",
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Ticket"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="font-mono text-xs font-medium tabular-nums text-foreground">
            {row.original.ticketNumber}
          </span>
        ),
      },
      {
        id: "title",
        accessorKey: "title",
        header: () => <DataTableColumnHeader label="Issue" />,
        cell: ({ row }) => (
          <div className="flex min-w-0 max-w-[240px] flex-col">
            <span className="truncate font-medium text-foreground">{row.original.title}</span>
            <span className="truncate text-xs text-muted-foreground">{row.original.category}</span>
          </div>
        ),
      },
      {
        id: "societyName",
        accessorKey: "societyName",
        header: () => <DataTableColumnHeader label="Society" />,
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-foreground">{row.original.societyName}</span>
        ),
      },
      {
        id: "status",
        accessorKey: "status",
        meta: { label: "Status" },
        header: () => <DataTableColumnHeader label="Status" />,
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <div className="flex items-center gap-2">
              <span className={cn("size-1.5 shrink-0 rounded-full", STATUS_DOT[status])} />
              <span className="whitespace-nowrap text-foreground">{STATUS_LABEL[status]}</span>
            </div>
          );
        },
      },
      {
        id: "priority",
        accessorKey: "priority",
        meta: { label: "Priority" },
        header: () => <DataTableColumnHeader label="Priority" />,
        cell: ({ row }) => {
          const meta = PRIORITY_META[row.original.priority];
          const Icon = meta.icon;
          return (
            <div className={cn("flex items-center gap-1.5 font-medium", meta.color)}>
              <Icon className="size-3.5" />
              {meta.label}
            </div>
          );
        },
      },
      {
        id: "createdAt",
        accessorKey: "createdAt",
        meta: { label: "Raised" },
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Raised"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-muted-foreground">
            {formatDate(row.original.createdAt)}
          </span>
        ),
      },
      {
        id: "assignedTo",
        accessorKey: "assignedTo",
        meta: { label: "Assigned to" },
        header: () => <DataTableColumnHeader label="Assigned to" />,
        cell: ({ row }) => {
          const assignee = row.original.assignedTo;
          if (!assignee) {
            return <span className="whitespace-nowrap text-muted-foreground">Unassigned</span>;
          }
          return (
            <div className="flex items-center gap-2">
              <Avatar size="sm">
                <AvatarFallback className="text-[10px]">{assignee.initials}</AvatarFallback>
              </Avatar>
              <span className="whitespace-nowrap text-foreground">{assignee.name}</span>
            </div>
          );
        },
      },
    ];

    return all.filter((c) => {
      if (compact && (c.id === "createdAt" || c.id === "assignedTo")) return false;
      if (c.id === "societyName") return showSociety;
      if (c.id === "assignedTo") return showAssignee;
      return true;
    });
  }, [compact, showSociety, showAssignee]);

  const filters = React.useMemo<DataTableFilterConfig<ComplaintRow>[]>(
    () => [
      {
        id: "status",
        label: "Status",
        type: "select",
        options: (["open", "in_progress", "resolved", "escalated"] as ComplaintStatus[]).map(
          (s) => ({
            label: STATUS_LABEL[s],
            value: s,
          }),
        ),
        predicate: (row, value) => row.status === value,
      },
    ],
    [],
  );

  return (
    <DataTable
      data={source}
      columns={columns}
      title={title}
      filters={filters}
      showPageSize={showPageSize}
      pageSize={compact ? 5 : 8}
      itemLabel="complaint"
      emptyMessage="No complaints match this filter."
      initialSorting={compact ? [] : [{ id: "createdAt", desc: true }]}
    />
  );
}
