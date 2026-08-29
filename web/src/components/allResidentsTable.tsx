"use client";

import * as React from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";

import { cn, getInitials, gradientForName } from "@/lib/utils";
import { staggeredRise } from "@/lib/stagger";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DoodleHouse } from "@/components/icons/doodleHouse";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableFilterConfig } from "@/components/dataTable";
import { DataTableColumnHeader } from "@/components/dataTableColumnHeader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { flats, type FlatOccupancyStatus, type FlatRecord } from "@/lib/flatsMockData";
import {
  residents,
  type ResidentOccupancyType,
  type ResidentStatus,
  type ResidentRecord,
} from "@/lib/residentsMockData";

const OCCUPANCY_LABEL: Record<ResidentOccupancyType, string> = {
  owner: "Owner",
  tenant: "Tenant",
};

const STATUS_DOT: Record<ResidentStatus, string> = {
  active: "bg-emerald-500",
  pending: "bg-amber-500",
  moved_out: "bg-zinc-400",
};

const STATUS_LABEL: Record<ResidentStatus, string> = {
  active: "Active",
  pending: "Pending",
  moved_out: "Moved out",
};

const FLAT_OCCUPANCY_DOT: Record<FlatOccupancyStatus, string> = {
  occupied: "bg-emerald-500",
  vacant: "bg-zinc-400",
};

const FLAT_OCCUPANCY_LABEL: Record<FlatOccupancyStatus, string> = {
  occupied: "Occupied",
  vacant: "Vacant",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function ResidentFlatSubRow({ resident }: { resident: ResidentRecord }) {
  const flatsForResident = React.useMemo(
    () => flats.filter((f) => f.id === resident.flatId),
    [resident.flatId],
  );

  if (flatsForResident.length === 0) {
    return (
      <div className="py-3" style={{ paddingLeft: 68, paddingRight: 16 }}>
        <div className="mb-1.5 text-[11px] font-medium tracking-widest text-muted-foreground">
          FLAT
        </div>
        <div className="overflow-hidden rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow className="border-border bg-muted/40 hover:bg-muted/40">
                <TableHead className="h-8 bg-muted/40 px-4 text-xs">Flat</TableHead>
                <TableHead className="h-8 bg-muted/40 px-4 text-xs">Floor</TableHead>
                <TableHead className="h-8 bg-muted/40 px-4 text-xs">Type</TableHead>
                <TableHead className="h-8 bg-muted/40 px-4 text-xs">Area</TableHead>
                <TableHead className="h-8 bg-muted/40 px-4 text-xs">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="h-16 text-center text-sm text-muted-foreground">
                  No flat
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="py-3" style={{ paddingLeft: 68, paddingRight: 16 }}>
      <div className="mb-1.5 text-[11px] font-medium tracking-widest text-muted-foreground">
        FLAT
      </div>
      <div className="overflow-hidden rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow className="border-border bg-muted/40 hover:bg-muted/40">
              <TableHead className="h-8 bg-muted/40 px-4 text-xs">Flat</TableHead>
              <TableHead className="h-8 bg-muted/40 px-4 text-xs">Floor</TableHead>
              <TableHead className="h-8 bg-muted/40 px-4 text-xs">Type</TableHead>
              <TableHead className="h-8 bg-muted/40 px-4 text-xs">Area</TableHead>
              <TableHead className="h-8 bg-muted/40 px-4 text-xs">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {flatsForResident.map((flat: FlatRecord, index: number) => {
              const rise = staggeredRise(index);
              return (
                <TableRow
                  key={flat.id}
                  className={cn("border-border hover:bg-muted/50", rise.className)}
                  style={rise.style}
                >
                  <TableCell className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        <DoodleHouse className="size-3.5" />
                      </span>
                      <Link
                        href={`/dashboard/people-hub/flats/${flat.id}`}
                        className="truncate text-sm font-medium text-foreground underline-offset-2 hover:underline"
                      >
                        {flat.tower}-{flat.flatNumber}
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-2">
                    <span className="whitespace-nowrap text-sm text-muted-foreground">
                      {flat.floor}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-2">
                    <Badge variant="outline">{flat.type}</Badge>
                  </TableCell>
                  <TableCell className="px-4 py-2">
                    <span className="whitespace-nowrap text-sm text-muted-foreground">
                      {flat.areaSqft.toLocaleString("en-IN")} sq ft
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "size-1.5 shrink-0 rounded-full",
                          FLAT_OCCUPANCY_DOT[flat.occupancyStatus],
                        )}
                      />
                      <span className="whitespace-nowrap text-sm text-foreground">
                        {FLAT_OCCUPANCY_LABEL[flat.occupancyStatus]}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export function AllResidentsTable() {
  const columns = React.useMemo<ColumnDef<ResidentRecord>[]>(
    () => [
      {
        id: "name",
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Resident"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => {
          const [from, to] = gradientForName(row.original.name);
          return (
            <Link
              href={`/dashboard/people-hub/residents/${row.original.id}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2.5 rounded-md px-1 py-0.5 -mx-1 hover:bg-muted/50 transition-colors"
            >
              <Avatar size="sm">
                <AvatarImage
                  src={`https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(row.original.id)}`}
                  alt={row.original.name}
                />
                <AvatarFallback
                  className="text-[10px] font-semibold text-white"
                  style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}
                >
                  {getInitials(row.original.name)}
                </AvatarFallback>
              </Avatar>
              <span className="truncate text-sm font-medium text-foreground">
                {row.original.name}
              </span>
            </Link>
          );
        },
      },
      {
        id: "flat",
        accessorFn: (row) => `${row.tower}-${row.flatNumber}`,
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Flat"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <Link
            href={`/dashboard/people-hub/flats/${row.original.flatId}`}
            onClick={(e) => e.stopPropagation()}
            className="whitespace-nowrap text-sm font-medium text-foreground underline-offset-2 hover:underline"
          >
            {row.original.tower}-{row.original.flatNumber}
          </Link>
        ),
      },
      {
        id: "occupancyType",
        accessorKey: "occupancyType",
        meta: { label: "Occupancy" },
        header: () => <DataTableColumnHeader label="Occupancy" />,
        cell: ({ row }) => (
          <Badge variant={row.original.occupancyType === "owner" ? "secondary" : "outline"}>
            {OCCUPANCY_LABEL[row.original.occupancyType]}
          </Badge>
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
            <span className="inline-flex items-center gap-1.5">
              <span className={cn("size-1.5 shrink-0 rounded-full", STATUS_DOT[status])} />
              <span className="whitespace-nowrap text-sm text-foreground">
                {STATUS_LABEL[status]}
              </span>
            </span>
          );
        },
      },
      {
        id: "phone",
        accessorKey: "phone",
        meta: { label: "Phone" },
        header: () => <DataTableColumnHeader label="Phone" />,
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            {row.original.phone}
          </span>
        ),
      },
      {
        id: "moveInDate",
        accessorKey: "moveInDate",
        meta: { label: "Move-in" },
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Move-in"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            {formatDate(row.original.moveInDate)}
          </span>
        ),
      },
    ],
    [],
  );

  const filters = React.useMemo<DataTableFilterConfig<ResidentRecord>[]>(
    () => [
      {
        id: "search",
        label: "Search",
        type: "search",
        placeholder: "Search name, flat or phone",
        predicate: (row, query) => {
          const q = query.toLowerCase();
          return (
            row.name.toLowerCase().includes(q) ||
            `${row.tower}-${row.flatNumber}`.toLowerCase().includes(q) ||
            row.flatNumber.toLowerCase().includes(q) ||
            row.phone.toLowerCase().includes(q)
          );
        },
      },
      {
        id: "occupancyType",
        label: "Occupancy",
        type: "select",
        options: (["owner", "tenant"] as ResidentOccupancyType[]).map((v) => ({
          label: OCCUPANCY_LABEL[v],
          value: v,
        })),
        predicate: (row, value) => row.occupancyType === value,
      },
      {
        id: "status",
        label: "Status",
        type: "select",
        options: (["active", "pending", "moved_out"] as ResidentStatus[]).map((v) => ({
          label: STATUS_LABEL[v],
          value: v,
        })),
        predicate: (row, value) => row.status === value,
      },
      {
        id: "groupBy",
        label: "Group by",
        type: "groupBy",
        options: [
          { label: "None", value: "none" },
          { label: "Tower", value: "tower" },
          { label: "Status", value: "status" },
        ],
        groupBy: (row, value) =>
          value === "status" ? STATUS_LABEL[row.status] : `Tower ${row.tower}`,
      },
    ],
    [],
  );

  const renderSubRow = React.useCallback(
    (row: ResidentRecord) => <ResidentFlatSubRow resident={row} />,
    [],
  );

  return (
    <DataTable
      data={residents}
      columns={columns}
      getRowId={(r) => r.id}
      renderSubRow={renderSubRow}
      title="All residents"
      filters={filters}
      enableRowSelection
      enableColumnVisibility
      enableColumnReorder
      enableFilterCustomization
      showPageSize
      pageSize={8}
      itemLabel="resident"
      emptyMessage="No residents match these filters."
    />
  );
}
