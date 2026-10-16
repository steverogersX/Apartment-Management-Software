"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { avatarUrlForName, formatCurrency, formatDate } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableFilterConfig } from "@/components/dataTable";
import { DataTableColumnHeader } from "@/components/dataTableColumnHeader";
import { staffMembers } from "@/lib/staffMockData";
import {
  MAINTENANCE_CATEGORIES,
  type MaintenanceCategory,
  type MaintenanceLogEntry,
  type MaintenanceScope,
} from "@/lib/maintenanceMockData";

export type MaintenanceRow = MaintenanceLogEntry & { placeLabel?: string };

const staffById = new Map(staffMembers.map((s) => [s.id, s]));

function placeLabelFor(row: MaintenanceLogEntry) {
  if (row.scope === "flat") return `${row.tower}-${row.flatNumber}`;
  return row.location ?? "Society";
}

export function MaintenanceTable({
  data: dataProp,
  title = "Maintenance log",
  toolbarActions,
  showPageSize = false,
  enableGrouping = false,
  onRowClick,
}: {
  data: MaintenanceRow[];
  title?: string;
  toolbarActions?: React.ReactNode;
  showPageSize?: boolean;
  enableGrouping?: boolean;
  onRowClick?: (row: MaintenanceRow) => void;
}) {
  const source = React.useMemo(
    () => dataProp.map((row) => ({ ...row, placeLabel: row.placeLabel ?? placeLabelFor(row) })),
    [dataProp],
  );

  const columns = React.useMemo<ColumnDef<MaintenanceRow>[]>(
    () => [
      {
        id: "performedOn",
        accessorKey: "performedOn",
        meta: { label: "Date" },
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Date"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-foreground">
            {formatDate(row.original.performedOn)}
          </span>
        ),
      },
      {
        id: "scope",
        accessorKey: "scope",
        meta: { label: "Scope" },
        header: () => <DataTableColumnHeader label="Scope" />,
        cell: ({ row }) => (
          <Badge variant={row.original.scope === "society" ? "secondary" : "outline"}>
            {row.original.scope === "society" ? "Society" : "Flat"}
          </Badge>
        ),
      },
      {
        id: "place",
        accessorKey: "placeLabel",
        meta: { label: "Flat / Location" },
        header: () => <DataTableColumnHeader label="Flat / Location" />,
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-foreground">{row.original.placeLabel}</span>
        ),
      },
      {
        id: "category",
        accessorKey: "category",
        meta: { label: "Category" },
        header: () => <DataTableColumnHeader label="Category" />,
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-foreground">{row.original.category}</span>
        ),
      },
      {
        id: "description",
        accessorKey: "description",
        header: () => <DataTableColumnHeader label="Work done" />,
        cell: ({ row }) => (
          <span className="block max-w-[280px] truncate text-muted-foreground">
            {row.original.description}
          </span>
        ),
      },
      {
        id: "staffId",
        accessorKey: "staffId",
        meta: { label: "Done by" },
        header: () => <DataTableColumnHeader label="Done by" />,
        cell: ({ row }) => {
          const staff = row.original.staffId ? staffById.get(row.original.staffId) : null;
          if (!staff) {
            return <span className="whitespace-nowrap text-muted-foreground">Unassigned</span>;
          }
          return (
            <div className="flex w-fit items-center gap-2">
              <Avatar size="sm">
                <AvatarImage src={avatarUrlForName(staff.name)} alt={staff.name} />
                <AvatarFallback className="text-[10px]">
                  {staff.name
                    .split(" ")
                    .map((p) => p[0])
                    .join("")
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-col">
                <span className="whitespace-nowrap text-foreground">{staff.name}</span>
                <span className="whitespace-nowrap text-[11px] text-muted-foreground">
                  {staff.role}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        id: "cost",
        accessorKey: "cost",
        meta: { label: "Cost" },
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Cost"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="whitespace-nowrap tabular-nums text-foreground">
            {row.original.cost != null ? formatCurrency(row.original.cost) : "—"}
          </span>
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

  const filters = React.useMemo<DataTableFilterConfig<MaintenanceRow>[]>(() => {
    const base: DataTableFilterConfig<MaintenanceRow>[] = [
      {
        id: "search",
        label: "Search",
        type: "search",
        placeholder: "Search flat, location, or work done",
        predicate: (row, query) => {
          const q = query.toLowerCase();
          return (
            (row.placeLabel ?? "").toLowerCase().includes(q) ||
            row.description.toLowerCase().includes(q)
          );
        },
      },
      {
        id: "scope",
        label: "Scope",
        type: "select",
        options: (["flat", "society"] as MaintenanceScope[]).map((s) => ({
          label: s === "flat" ? "Flat" : "Society",
          value: s,
        })),
        predicate: (row, value) => row.scope === value,
      },
      {
        id: "category",
        label: "Category",
        type: "select",
        options: MAINTENANCE_CATEGORIES.map((c: MaintenanceCategory) => ({ label: c, value: c })),
        predicate: (row, value) => row.category === value,
      },
    ];
    if (enableGrouping) {
      base.push({
        id: "groupBy",
        label: "Group by",
        type: "groupBy",
        options: [
          { label: "None", value: "none" },
          { label: "Scope", value: "scope" },
          { label: "Flat / Location", value: "place" },
          { label: "Category", value: "category" },
        ],
        groupBy: (row, value) =>
          value === "scope"
            ? row.scope === "society"
              ? "Society"
              : "Flat"
            : value === "place"
              ? (row.placeLabel ?? "—")
              : row.category,
      });
    }
    return base;
  }, [enableGrouping]);

  return (
    <DataTable
      data={source}
      columns={columns}
      getRowId={(row) => row.id}
      title={title}
      filters={filters}
      toolbarActions={toolbarActions}
      showPageSize={showPageSize}
      pageSize={10}
      itemLabel="entry"
      emptyMessage="No maintenance recorded yet."
      initialSorting={[{ id: "performedOn", desc: true }]}
      onRowClick={onRowClick}
    />
  );
}
