"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableFilterConfig } from "@/components/dataTable";
import { DataTableColumnHeader } from "@/components/dataTableColumnHeader";
import type { FlatMaintenanceDue, MaintenancePaymentStatus } from "@/lib/maintenanceMockData";
import { StatusIcon } from "@/components/statusIcon";

export type DuesRow = FlatMaintenanceDue & { flatLabel?: string };

const STATUS_LABEL: Record<MaintenancePaymentStatus, string> = {
  paid: "Paid",
  pending: "Pending",
  overdue: "Overdue",
};

export function MaintenanceDuesTable({
  data,
  title = "Maintenance dues",
  showFlat = true,
  toolbarActions,
  onRowClick,
}: {
  data: DuesRow[];
  title?: string;
  showFlat?: boolean;
  toolbarActions?: React.ReactNode;
  onRowClick?: (row: DuesRow) => void;
}) {
  const source = React.useMemo(
    () => data.map((d) => ({ ...d, flatLabel: d.flatLabel ?? `${d.tower}-${d.flatNumber}` })),
    [data],
  );

  const columns = React.useMemo<ColumnDef<DuesRow>[]>(() => {
    const all: ColumnDef<DuesRow>[] = [
      {
        id: "flatLabel",
        accessorKey: "flatLabel",
        meta: { label: "Flat" },
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Flat"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-medium text-foreground">{row.original.flatLabel}</span>
            <span className="truncate text-xs text-muted-foreground">{row.original.ownerName}</span>
          </div>
        ),
      },
      {
        id: "period",
        accessorKey: "period",
        header: () => <DataTableColumnHeader label="Period" />,
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-foreground">{row.original.period}</span>
        ),
      },
      {
        id: "amount",
        accessorKey: "amount",
        meta: { label: "Amount" },
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Amount"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="whitespace-nowrap tabular-nums text-foreground">
            {formatCurrency(row.original.amount)}
          </span>
        ),
      },
      {
        id: "dueDate",
        accessorKey: "dueDate",
        meta: { label: "Due date" },
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Due date"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-foreground">
            {formatDate(row.original.dueDate)}
          </span>
        ),
      },
      {
        id: "status",
        accessorKey: "status",
        meta: { label: "Status" },
        header: () => <DataTableColumnHeader label="Status" />,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <StatusIcon status={row.original.status} />
            <span className="whitespace-nowrap text-foreground">
              {STATUS_LABEL[row.original.status]}
            </span>
          </div>
        ),
      },
      {
        id: "paidDate",
        accessorKey: "paidDate",
        meta: { label: "Paid on" },
        header: () => <DataTableColumnHeader label="Paid on" />,
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-muted-foreground">
            {row.original.paidDate ? formatDate(row.original.paidDate) : "—"}
          </span>
        ),
      },
      {
        id: "paidMode",
        accessorKey: "paidMode",
        meta: { label: "Mode" },
        header: () => <DataTableColumnHeader label="Mode" />,
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-muted-foreground">
            {row.original.paidMode ?? "—"}
          </span>
        ),
      },
      {
        id: "receiptNumber",
        accessorKey: "receiptNumber",
        meta: { label: "Receipt" },
        header: () => <DataTableColumnHeader label="Receipt" />,
        cell: ({ row }) => (
          <span className="whitespace-nowrap font-mono text-xs text-muted-foreground">
            {row.original.receiptNumber ?? "—"}
          </span>
        ),
      },
    ];
    return showFlat ? all : all.filter((c) => c.id !== "flatLabel");
  }, [showFlat]);

  const filters = React.useMemo<DataTableFilterConfig<DuesRow>[]>(() => {
    const periods = [...source]
      .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
      .map((d) => d.period)
      .filter((p, i, all) => all.indexOf(p) === i);
    const towers = [...new Set(source.map((d) => d.tower))].sort();
    const modes = [...new Set(source.map((d) => d.paidMode).filter((m) => m !== null))].sort();
    const list: DataTableFilterConfig<DuesRow>[] = [
      {
        id: "search",
        label: "Search",
        type: "search",
        placeholder: showFlat ? "Search flat, owner or receipt" : "Search period or receipt",
        predicate: (row, query) => {
          const q = query.toLowerCase();
          return (
            (row.flatLabel ?? "").toLowerCase().includes(q) ||
            row.ownerName.toLowerCase().includes(q) ||
            row.period.toLowerCase().includes(q) ||
            (row.receiptNumber ?? "").toLowerCase().includes(q)
          );
        },
      },
      {
        id: "period",
        label: "Month",
        type: "select",
        options: periods.map((p) => ({ label: p, value: p })),
        predicate: (row, value) => row.period === value,
      },
      {
        id: "status",
        label: "Status",
        type: "select",
        options: (["paid", "pending", "overdue"] as MaintenancePaymentStatus[]).map((s) => ({
          label: STATUS_LABEL[s],
          value: s,
        })),
        predicate: (row, value) => row.status === value,
      },
    ];
    if (showFlat && towers.length > 1) {
      list.push({
        id: "tower",
        label: "Tower",
        type: "select",
        options: towers.map((t) => ({ label: `Tower ${t}`, value: t })),
        predicate: (row, value) => row.tower === value,
      });
    }
    if (modes.length > 1) {
      list.push({
        id: "mode",
        label: "Payment mode",
        type: "select",
        options: modes.map((m) => ({ label: m, value: m })),
        predicate: (row, value) => row.paidMode === value,
      });
    }
    return list;
  }, [source, showFlat]);

  return (
    <DataTable
      data={source}
      columns={columns}
      getRowId={(row) => row.id}
      title={title}
      filters={filters}
      toolbarActions={toolbarActions}
      showPageSize
      pageSize={10}
      itemLabel="record"
      emptyMessage="No maintenance dues found."
      initialSorting={[{ id: "dueDate", desc: true }]}
      onRowClick={onRowClick}
    />
  );
}
