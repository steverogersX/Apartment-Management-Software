"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Clock3,
  Download,
  Eye,
  Layers,
  MoreHorizontal,
  Receipt,
  TrendingUp,
  Wallet,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable, type DataTableFilterConfig } from "@/components/dataTable";
import { DataTableColumnHeader } from "@/components/dataTableColumnHeader";
import {
  getChargesByCycle,
  maintenanceHistory,
  type MaintenanceHistoryEntry,
  type MaintenanceHistoryStatus,
} from "@/lib/maintenanceMockData";
import {
  chargesToCsv,
  CycleBreakdownDialog,
  downloadCsv,
} from "@/components/maintenance/cycleBreakdownDialog";

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const statusBadgeClass: Record<MaintenanceHistoryStatus, string> = {
  collected:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",
  partial:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300",
  overdue:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300",
  draft:
    "border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300",
};

const statusLabel: Record<MaintenanceHistoryStatus, string> = {
  collected: "Collected",
  partial: "Partial",
  overdue: "Overdue",
  draft: "Draft",
};

export default function MaintenanceHistoryPage() {
  const [breakdownCycle, setBreakdownCycle] = React.useState<MaintenanceHistoryEntry | null>(null);
  const [breakdownOpen, setBreakdownOpen] = React.useState(false);

  const openBreakdown = React.useCallback((cycle: MaintenanceHistoryEntry) => {
    setBreakdownCycle(cycle);
    setBreakdownOpen(true);
  }, []);

  const downloadCycleReport = React.useCallback((cycle: MaintenanceHistoryEntry) => {
    downloadCsv(
      `maintenance-${cycle.monthKey}-breakdown.csv`,
      chargesToCsv(getChargesByCycle(cycle.id)),
    );
  }, []);

  const exportAllCycles = React.useCallback(() => {
    const header =
      "Month,Type,Towers,Flats,Per Flat,Expected,Collected,Outstanding,Status,Due Date";
    const lines = maintenanceHistory.map((cycle) =>
      [
        cycle.monthLabel,
        cycle.type,
        cycle.towers.join(" "),
        cycle.flatsCovered,
        cycle.amountPerFlat,
        cycle.totalExpected,
        cycle.totalCollected,
        cycle.totalExpected - cycle.totalCollected,
        statusLabel[cycle.status],
        cycle.dueDate,
      ].join(","),
    );
    downloadCsv("maintenance-cycles.csv", [header, ...lines].join("\n"));
  }, []);

  const kpis = React.useMemo(() => {
    const totalCycles = maintenanceHistory.length;
    const totalCollected = maintenanceHistory.reduce((s, h) => s + h.totalCollected, 0);
    const totalExpected = maintenanceHistory.reduce((s, h) => s + h.totalExpected, 0);
    const outstanding = totalExpected - totalCollected;
    const avgPercent = totalExpected ? Math.round((totalCollected / totalExpected) * 100) : 0;
    return { totalCycles, totalCollected, outstanding, avgPercent, totalExpected };
  }, []);

  const columns = React.useMemo<ColumnDef<MaintenanceHistoryEntry>[]>(
    () => [
      {
        id: "monthLabel",
        accessorKey: "monthLabel",
        size: 140,
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Month"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">{row.original.monthLabel}</span>
            <span className="text-xs text-muted-foreground">{row.original.type}</span>
          </div>
        ),
      },
      {
        id: "towers",
        accessorFn: (row) => row.towers.join(","),
        meta: { label: "Towers" },
        size: 130,
        header: () => <DataTableColumnHeader label="Towers" />,
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.towers.map((t) => (
              <Badge key={t} variant="outline" className="px-1.5 py-0 text-[11px] font-medium">
                {t}
              </Badge>
            ))}
          </div>
        ),
      },
      {
        id: "flatsCovered",
        accessorKey: "flatsCovered",
        size: 110,
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Flats"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="text-sm text-foreground">{row.original.flatsCovered}</span>
        ),
      },
      {
        id: "amountPerFlat",
        accessorKey: "amountPerFlat",
        meta: { label: "Per Flat" },
        size: 120,
        header: () => <DataTableColumnHeader label="Per Flat" />,
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            {formatCurrency(row.original.amountPerFlat)}
          </span>
        ),
      },
      {
        id: "totalExpected",
        accessorKey: "totalExpected",
        meta: { label: "Expected" },
        size: 140,
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Expected"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm font-medium text-foreground">
            {formatCurrency(row.original.totalExpected)}
          </span>
        ),
      },
      {
        id: "collected",
        accessorKey: "totalCollected",
        meta: { label: "Collected" },
        size: 160,
        header: () => <DataTableColumnHeader label="Collected" />,
        cell: ({ row }) => {
          const pct = row.original.totalExpected
            ? Math.round((row.original.totalCollected / row.original.totalExpected) * 100)
            : 0;
          return (
            <div className="flex w-36 flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">
                  {formatCurrency(row.original.totalCollected)}
                </span>
                <span className="text-muted-foreground">{pct}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        },
      },
      {
        id: "dueDate",
        accessorKey: "dueDate",
        meta: { label: "Due Date" },
        size: 120,
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Due Date"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            {formatDate(row.original.dueDate)}
          </span>
        ),
      },
      {
        id: "generatedAt",
        accessorKey: "generatedAt",
        meta: { label: "Generated" },
        size: 150,
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Generated"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="whitespace-nowrap text-sm text-foreground">
              {formatDate(row.original.generatedAt)}
            </span>
            <span className="text-xs text-muted-foreground">{row.original.generatedBy}</span>
          </div>
        ),
      },
      {
        id: "status",
        accessorKey: "status",
        meta: { label: "Status" },
        size: 120,
        header: () => <DataTableColumnHeader label="Status" />,
        cell: ({ row }) => (
          <Badge variant="outline" className={statusBadgeClass[row.original.status]}>
            {statusLabel[row.original.status]}
          </Badge>
        ),
      },
      {
        id: "actions",
        enableHiding: false,
        size: 90,
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label="View breakdown"
              onClick={() => openBreakdown(row.original)}
            >
              <Eye className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label="Download report"
              onClick={() => downloadCycleReport(row.original)}
            >
              <Receipt className="size-3.5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button variant="ghost" size="icon-xs" aria-label="More" />}
              >
                <MoreHorizontal className="size-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={() => openBreakdown(row.original)}>
                  View breakdown
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => downloadCycleReport(row.original)}>
                  Download report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    [downloadCycleReport, openBreakdown],
  );

  const filters = React.useMemo<DataTableFilterConfig<MaintenanceHistoryEntry>[]>(
    () => [
      {
        id: "search",
        label: "Search",
        type: "search",
        placeholder: "Search month, tower, by…",
        predicate: (row, query) => {
          const q = query.toLowerCase();
          return (
            row.monthLabel.toLowerCase().includes(q) ||
            row.towers.join(",").toLowerCase().includes(q) ||
            row.type.toLowerCase().includes(q) ||
            row.generatedBy.toLowerCase().includes(q)
          );
        },
      },
      {
        id: "month",
        label: "Month",
        type: "select",
        options: Array.from(new Set(maintenanceHistory.map((h) => h.monthLabel))).map((m) => ({
          label: m,
          value: m,
        })),
        predicate: (row, value) => row.monthLabel === value,
      },
      {
        id: "tower",
        label: "Tower",
        type: "select",
        options: ["A", "B", "C", "D"].map((t) => ({ label: `Tower ${t}`, value: t })),
        predicate: (row, value) => row.towers.includes(value),
      },
      {
        id: "type",
        label: "Type",
        type: "select",
        options: [
          { label: "Monthly", value: "Monthly" },
          { label: "Quarterly", value: "Quarterly" },
          { label: "Special", value: "Special" },
        ],
        predicate: (row, value) => row.type === value,
      },
      {
        id: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "Collected", value: "collected" },
          { label: "Partial", value: "partial" },
          { label: "Overdue", value: "overdue" },
          { label: "Draft", value: "draft" },
        ],
        predicate: (row, value) => row.status === value,
      },
      {
        id: "groupBy",
        label: "Group by",
        type: "groupBy",
        options: [
          { label: "None", value: "none" },
          { label: "Month", value: "month" },
          { label: "Type", value: "type" },
          { label: "Status", value: "status" },
          { label: "Tower", value: "tower" },
        ],
        groupBy: (row, value) => {
          if (value === "month") return row.monthLabel;
          if (value === "type") return row.type;
          if (value === "status") return statusLabel[row.status];
          if (value === "tower") return row.towers.join(", ");
          return "Other";
        },
      },
    ],
    [],
  );

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">History</h1>
          <p className="text-sm text-muted-foreground">
            Past maintenance cycles, collections and audit trail for this society.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={exportAllCycles}>
            <Download className="size-3.5" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="gap-3 rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Cycles
            </CardTitle>
            <span className="flex size-8 items-center justify-center rounded-full bg-zinc-50 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
              <Layers className="size-4" />
            </span>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            <span className="text-xl font-semibold tracking-tight text-foreground">
              {kpis.totalCycles}
            </span>
            <span className="text-xs text-muted-foreground">Last 8 months</span>
          </CardContent>
        </Card>
        <Card className="gap-3 rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Collected
            </CardTitle>
            <span className="flex size-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300">
              <Wallet className="size-4" />
            </span>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            <span className="text-xl font-semibold tracking-tight text-foreground">
              {formatCurrency(kpis.totalCollected)}
            </span>
            <span className="text-xs text-muted-foreground">
              of {formatCurrency(kpis.totalExpected)} expected
            </span>
          </CardContent>
        </Card>
        <Card className="gap-3 rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Outstanding</CardTitle>
            <span className="flex size-8 items-center justify-center rounded-full bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300">
              <Clock3 className="size-4" />
            </span>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            <span className="text-xl font-semibold tracking-tight text-foreground">
              {formatCurrency(kpis.outstanding)}
            </span>
            <span className="text-xs text-muted-foreground">Pending collection</span>
          </CardContent>
        </Card>
        <Card className="gap-3 rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Collection
            </CardTitle>
            <span className="flex size-8 items-center justify-center rounded-full bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-300">
              <TrendingUp className="size-4" />
            </span>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            <span className="text-xl font-semibold tracking-tight text-foreground">
              {kpis.avgPercent}%
            </span>
            <span className="text-xs text-muted-foreground">Across all cycles</span>
          </CardContent>
        </Card>
      </div>

      <DataTable
        data={maintenanceHistory}
        columns={columns}
        getRowId={(r) => r.id}
        filters={filters}
        title="Cycles"
        enableColumnReorder
        enableColumnVisibility
        enableFilterCustomization
        showPageSize
        pageSize={8}
        itemLabel="cycle"
        emptyMessage="No maintenance cycles match these filters."
      />
      <CycleBreakdownDialog
        cycle={breakdownCycle}
        open={breakdownOpen}
        onOpenChange={setBreakdownOpen}
      />
    </div>
  );
}
