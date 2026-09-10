"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableFilterConfig } from "@/components/dataTable";
import { DataTableColumnHeader } from "@/components/dataTableColumnHeader";
import {
  frequentVisitors as initialFrequentVisitors,
  type FrequentVisitor,
} from "@/lib/visitorsMockData";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const CATEGORY_LABEL: Record<FrequentVisitor["category"], string> = {
  guest: "Guest",
  delivery: "Delivery",
  cab: "Cab",
  service: "Service",
  other: "Other",
};

export function FrequentVisitorsTable() {
  const [fastTrack, setFastTrack] = React.useState<Set<string>>(new Set());

  function toggleFastTrack(id: string) {
    setFastTrack((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const columns = React.useMemo<ColumnDef<FrequentVisitor>[]>(
    () => [
      {
        id: "name",
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Visitor"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="truncate text-sm font-medium text-foreground">
              {row.original.name}
            </span>
            <span className="truncate text-xs text-muted-foreground">{row.original.phone}</span>
          </div>
        ),
      },
      {
        id: "category",
        accessorKey: "category",
        meta: { label: "Category" },
        header: () => <DataTableColumnHeader label="Category" />,
        cell: ({ row }) => <Badge variant="outline">{CATEGORY_LABEL[row.original.category]}</Badge>,
      },
      {
        id: "flatsVisited",
        accessorFn: (row) => row.flatsVisited.join(", "),
        meta: { label: "Flats Visited" },
        header: () => <DataTableColumnHeader label="Flats Visited" />,
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.flatsVisited.join(", ")}
          </span>
        ),
      },
      {
        id: "visitCount",
        accessorKey: "visitCount",
        meta: { label: "Visits" },
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Visits"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="text-sm font-medium text-foreground">{row.original.visitCount}</span>
        ),
      },
      {
        id: "lastVisit",
        accessorKey: "lastVisit",
        meta: { label: "Last Visit" },
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Last Visit"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            {formatDate(row.original.lastVisit)}
          </span>
        ),
      },
      {
        id: "fastTrack",
        accessorKey: "visitCount",
        meta: { label: "Fast-track" },
        header: () => <DataTableColumnHeader label="Fast-track" />,
        cell: ({ row }) => {
          const isFast = fastTrack.has(row.original.id);
          return (
            <Button
              variant={isFast ? "secondary" : "outline"}
              size="sm"
              className="h-7 gap-1.5 text-xs"
              onClick={() => toggleFastTrack(row.original.id)}
            >
              {isFast ? "Fast-tracked" : "Fast-track"}
            </Button>
          );
        },
      },
    ],
    [fastTrack],
  );

  const filters = React.useMemo<DataTableFilterConfig<FrequentVisitor>[]>(
    () => [
      {
        id: "search",
        label: "Search",
        type: "search",
        placeholder: "Search name or phone…",
        predicate: (row, q) =>
          row.name.toLowerCase().includes(q.toLowerCase()) ||
          row.phone.toLowerCase().includes(q.toLowerCase()),
      },
      {
        id: "category",
        label: "Category",
        type: "select",
        options: (["guest", "delivery", "cab", "service", "other"] as const).map((c) => ({
          label: CATEGORY_LABEL[c],
          value: c,
        })),
        predicate: (row, v) => row.category === v,
      },
      {
        id: "groupBy",
        label: "Group by",
        type: "groupBy",
        options: [
          { label: "None", value: "none" },
          { label: "Category", value: "category" },
        ],
        groupBy: (row, value) => (value === "category" ? CATEGORY_LABEL[row.category] : ""),
      },
    ],
    [],
  );

  return (
    <DataTable
      data={initialFrequentVisitors}
      columns={columns}
      title="Frequent visitors"
      filters={filters}
      enableColumnVisibility
      enableColumnReorder
      enableFilterCustomization
      showPageSize
      pageSize={8}
      itemLabel="visitor"
      emptyMessage="No frequent visitors."
    />
  );
}
