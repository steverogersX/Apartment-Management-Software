"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableFilterConfig } from "@/components/dataTable";
import { DataTableColumnHeader } from "@/components/dataTableColumnHeader";
import { flats, flatOccupancyHistory, flatVehicleHistory } from "@/lib/flatsMockData";
import { residents } from "@/lib/residentsMockData";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

type HistoryEntry =
  | {
      kind: "occupancy";
      id: string;
      residentName: string;
      residentId: string | null;
      flatId: string;
      flatLabel: string;
      detail: string;
      date: string;
      rawDate: string;
    }
  | {
      kind: "vehicle";
      id: string;
      residentName: string;
      residentId: string;
      flatId: string;
      flatLabel: string;
      detail: string;
      date: string;
      rawDate: string;
    };

const flatsById = new Map(flats.map((f) => [f.id, f]));
const residentByName = new Map(residents.map((r) => [r.name, r.id]));

function buildHistoryEntries(): HistoryEntry[] {
  const entries: HistoryEntry[] = [];

  for (const e of flatOccupancyHistory) {
    if (e.moveOutDate === null) continue;
    const flat = flatsById.get(e.flatId);
    const flatLabel = flat ? `${flat.tower}-${flat.flatNumber}` : e.flatId;
    const detail = `${e.occupancyType === "owner" ? "Owner" : "Tenant"}, moved out ${formatDate(e.moveOutDate)}`;
    entries.push({
      kind: "occupancy",
      id: `occupancy-${e.flatId}-${e.residentName}-${e.moveInDate}`,
      residentName: e.residentName,
      residentId: residentByName.get(e.residentName) ?? null,
      flatId: e.flatId,
      flatLabel,
      detail,
      date: formatDate(e.moveOutDate),
      rawDate: e.moveOutDate,
    });
  }

  for (const v of flatVehicleHistory) {
    if (v.isCurrent) continue;
    const flat = flatsById.get(v.flatId);
    const flatLabel = flat ? `${flat.tower}-${flat.flatNumber}` : v.flatId;
    entries.push({
      kind: "vehicle",
      id: `vehicle-${v.registrationNumber}`,
      residentName: v.ownerName,
      residentId: v.residentId,
      flatId: v.flatId,
      flatLabel,
      detail: `${v.registrationNumber} · ${v.make} ${v.model}`,
      date: "—",
      rawDate: "",
    });
  }

  entries.sort((a, b) => {
    if (!a.rawDate && !b.rawDate) return 0;
    if (!a.rawDate) return 1;
    if (!b.rawDate) return -1;
    return new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime();
  });

  return entries;
}

export function HistoryTable() {
  const searchParams = useSearchParams();
  const residentIdParam = searchParams.get("residentId");
  const flatIdParam = searchParams.get("flatId");

  const allEntries = React.useMemo(() => buildHistoryEntries(), []);

  const residentNameParam = React.useMemo(() => {
    if (!residentIdParam) return null;
    const r = residents.find((x) => x.id === residentIdParam);
    return r?.name ?? null;
  }, [residentIdParam]);

  const filteredEntries = React.useMemo(() => {
    let result = allEntries;
    if (residentIdParam) {
      result = result.filter(
        (e) =>
          e.residentId === residentIdParam ||
          (residentNameParam && e.residentName === residentNameParam),
      );
    }
    if (flatIdParam) {
      result = result.filter((e) => e.flatId === flatIdParam);
    }
    return result;
  }, [allEntries, residentIdParam, residentNameParam, flatIdParam]);

  const columns = React.useMemo<ColumnDef<HistoryEntry>[]>(
    () => [
      {
        id: "kind",
        accessorKey: "kind",
        meta: { label: "Type" },
        header: () => <DataTableColumnHeader label="Type" />,
        cell: ({ row }) => (
          <Badge variant={row.original.kind === "occupancy" ? "secondary" : "outline"}>
            {row.original.kind === "occupancy" ? "Occupancy" : "Vehicle"}
          </Badge>
        ),
      },
      {
        id: "residentName",
        accessorKey: "residentName",
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Resident"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-foreground">{row.original.residentName}</span>
        ),
      },
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
          <Link
            href="/dashboard/people-hub/flats"
            className="whitespace-nowrap font-medium text-foreground underline-offset-2 hover:underline"
          >
            {row.original.flatLabel}
          </Link>
        ),
      },
      {
        id: "detail",
        accessorKey: "detail",
        meta: { label: "Detail" },
        header: () => <DataTableColumnHeader label="Detail" />,
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-muted-foreground">{row.original.detail}</span>
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
          <span className="whitespace-nowrap text-muted-foreground">{row.original.date}</span>
        ),
      },
    ],
    [],
  );

  const filters = React.useMemo<DataTableFilterConfig<HistoryEntry>[]>(
    () => [
      {
        id: "search",
        label: "Search",
        type: "search",
        placeholder: "Search resident or flat",
        predicate: (row, query) => {
          const q = query.toLowerCase();
          return (
            row.residentName.toLowerCase().includes(q) || row.flatLabel.toLowerCase().includes(q)
          );
        },
      },
      {
        id: "groupBy",
        label: "Group by",
        type: "groupBy",
        options: [
          { label: "None", value: "none" },
          { label: "Flat", value: "flat" },
          { label: "Resident", value: "resident" },
        ],
        groupBy: (row, value) => (value === "flat" ? row.flatLabel : row.residentName),
      },
    ],
    [],
  );

  return (
    <DataTable
      data={filteredEntries}
      columns={columns}
      getRowId={(row) => row.id}
      title="History"
      filters={filters}
      enableColumnReorder
      enableColumnVisibility
      enableFilterCustomization
      showPageSize
      pageSize={8}
      itemLabel="record"
      emptyMessage="No history records match these filters."
    />
  );
}
