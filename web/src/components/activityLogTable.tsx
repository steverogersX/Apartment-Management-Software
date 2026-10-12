"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableFilterConfig } from "@/components/dataTable";
import { DataTableColumnHeader } from "@/components/dataTableColumnHeader";
import { auditLog, type AuditAction, type AuditLogEntry } from "@/lib/auditLog";
import { formatDateTime } from "@/lib/utils";

function actionVariant(action: AuditAction) {
  if (action === "Approve" || action === "Payment Recorded" || action === "Goods Received")
    return "secondary";
  if (action === "Reject" || action === "Cancel") return "destructive";
  return "outline";
}

const MODULES = ["Assets", "Inventory", "Invoicing", "Purchasing", "Accounts", "Dues and Receipts"];
const ACTIONS: AuditAction[] = [
  "Create",
  "Update",
  "Approve",
  "Reject",
  "Cancel",
  "Status Change",
  "Payment Recorded",
  "Goods Received",
];

export function ActivityLogTable() {
  const columns = React.useMemo<ColumnDef<AuditLogEntry>[]>(
    () => [
      {
        id: "module",
        accessorKey: "module",
        meta: { label: "Module" },
        header: () => <DataTableColumnHeader label="Module" />,
        cell: ({ row }) => <Badge variant="outline">{row.original.module}</Badge>,
      },
      {
        id: "entity",
        accessorFn: (row) => row.entityLabel,
        meta: { label: "Entity" },
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Entity"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium text-foreground">
              {row.original.entityLabel}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {row.original.entityType}
            </span>
          </div>
        ),
      },
      {
        id: "action",
        accessorKey: "action",
        meta: { label: "Action" },
        header: () => <DataTableColumnHeader label="Action" />,
        cell: ({ row }) => (
          <Badge variant={actionVariant(row.original.action)}>{row.original.action}</Badge>
        ),
      },
      {
        id: "performedBy",
        accessorKey: "performedBy",
        meta: { label: "Performed By" },
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Performed By"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-foreground">
            {row.original.performedBy}
          </span>
        ),
      },
      {
        id: "performedAt",
        accessorKey: "performedAt",
        meta: { label: "Date/Time" },
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Date/Time"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            {formatDateTime(row.original.performedAt)}
          </span>
        ),
      },
      {
        id: "details",
        accessorKey: "details",
        meta: { label: "Details" },
        header: () => <DataTableColumnHeader label="Details" />,
        cell: ({ row }) => (
          <span
            className="block max-w-[280px] truncate text-sm text-muted-foreground"
            title={row.original.details ?? ""}
          >
            {row.original.details ?? "—"}
          </span>
        ),
      },
    ],
    [],
  );

  const filters = React.useMemo<DataTableFilterConfig<AuditLogEntry>[]>(
    () => [
      {
        id: "search",
        label: "Search",
        type: "search",
        placeholder: "Search entity or actor",
        predicate: (row, query) => {
          const q = query.toLowerCase();
          return (
            row.entityLabel.toLowerCase().includes(q) || row.performedBy.toLowerCase().includes(q)
          );
        },
      },
      {
        id: "module",
        label: "Module",
        type: "select",
        options: MODULES.map((m) => ({ label: m, value: m })),
        predicate: (row, value) => row.module === value,
      },
      {
        id: "action",
        label: "Action",
        type: "select",
        options: ACTIONS.map((a) => ({ label: a, value: a })),
        predicate: (row, value) => row.action === value,
      },
    ],
    [],
  );

  return (
    <DataTable
      data={[...auditLog]}
      columns={columns}
      getRowId={(r) => r.id}
      title="Activity Log"
      filters={filters}
      enableColumnVisibility
      enableColumnReorder
      enableFilterCustomization
      showPageSize
      pageSize={10}
      itemLabel="entry"
      emptyMessage="No activity yet."
      initialSorting={[{ id: "performedAt", desc: true }]}
    />
  );
}
