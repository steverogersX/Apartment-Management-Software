"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Download } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableFilterConfig } from "@/components/dataTable";
import { DataTableColumnHeader } from "@/components/dataTableColumnHeader";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getChargesByCycle,
  type FlatCharge,
  type FlatChargeStatus,
  type MaintenanceHistoryEntry,
} from "@/lib/maintenanceMockData";

export function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export const flatChargeBadgeClass: Record<FlatChargeStatus, string> = {
  paid: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",
  partial:
    "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300",
  pending:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300",
  overdue:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300",
};

export const flatChargeLabel: Record<FlatChargeStatus, string> = {
  paid: "Paid",
  partial: "Partial",
  pending: "Pending",
  overdue: "Overdue",
};

function escapeCsvCell(value: string | number): string {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function chargesToCsv(charges: FlatCharge[]): string {
  const header = [
    "Month",
    "Flat",
    "Owner",
    "Tower",
    "Due",
    "Paid",
    "Balance",
    "Status",
    "Paid On",
    "Paid Via",
    "Due Date",
  ];
  const lines = charges.map((charge) =>
    [
      charge.monthLabel,
      charge.flat,
      charge.owner,
      charge.tower,
      charge.amountDue,
      charge.amountPaid,
      charge.balance,
      flatChargeLabel[charge.status],
      charge.paidOn ?? "",
      charge.paidVia ?? "",
      charge.dueDate,
    ]
      .map(escapeCsvCell)
      .join(","),
  );
  return [header.join(","), ...lines].join("\n");
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

const breakdownColumns: ColumnDef<FlatCharge>[] = [
  {
    id: "flat",
    accessorKey: "flat",
    size: 100,
    header: ({ column }) => (
      <DataTableColumnHeader
        label="Flat"
        sorted={column.getIsSorted()}
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      />
    ),
    cell: ({ row }) => <span className="font-medium text-foreground">{row.original.flat}</span>,
  },
  {
    id: "owner",
    accessorKey: "owner",
    size: 170,
    header: ({ column }) => (
      <DataTableColumnHeader
        label="Owner"
        sorted={column.getIsSorted()}
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      />
    ),
    cell: ({ row }) => (
      <span className="truncate text-sm text-foreground">{row.original.owner}</span>
    ),
  },
  {
    id: "tower",
    accessorKey: "tower",
    meta: { label: "Tower" },
    size: 90,
    header: () => <DataTableColumnHeader label="Tower" />,
    cell: ({ row }) => (
      <span className="inline-flex size-7 items-center justify-center rounded-full border bg-muted text-xs font-medium text-foreground">
        {row.original.tower}
      </span>
    ),
  },
  {
    id: "due",
    accessorKey: "amountDue",
    meta: { label: "Due" },
    size: 110,
    header: ({ column }) => (
      <DataTableColumnHeader
        label="Due"
        sorted={column.getIsSorted()}
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      />
    ),
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm font-medium text-foreground">
        {formatCurrency(row.original.amountDue)}
      </span>
    ),
  },
  {
    id: "paid",
    accessorKey: "amountPaid",
    meta: { label: "Paid" },
    size: 110,
    header: ({ column }) => (
      <DataTableColumnHeader
        label="Paid"
        sorted={column.getIsSorted()}
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      />
    ),
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm text-muted-foreground">
        {formatCurrency(row.original.amountPaid)}
      </span>
    ),
  },
  {
    id: "balance",
    accessorKey: "balance",
    meta: { label: "Balance" },
    size: 110,
    header: ({ column }) => (
      <DataTableColumnHeader
        label="Balance"
        sorted={column.getIsSorted()}
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      />
    ),
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm font-medium text-foreground">
        {formatCurrency(row.original.balance)}
      </span>
    ),
  },
  {
    id: "status",
    accessorKey: "status",
    meta: { label: "Status" },
    size: 110,
    header: () => <DataTableColumnHeader label="Status" />,
    cell: ({ row }) => (
      <Badge variant="outline" className={flatChargeBadgeClass[row.original.status]}>
        {flatChargeLabel[row.original.status]}
      </Badge>
    ),
  },
  {
    id: "paidOn",
    accessorKey: "paidOn",
    meta: { label: "Paid On" },
    size: 120,
    header: () => <DataTableColumnHeader label="Paid On" />,
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm text-muted-foreground">
        {row.original.paidOn ? formatDate(row.original.paidOn) : "—"}
      </span>
    ),
  },
  {
    id: "paidVia",
    accessorKey: "paidVia",
    meta: { label: "Paid Via" },
    size: 130,
    header: () => <DataTableColumnHeader label="Paid Via" />,
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm text-muted-foreground">
        {row.original.paidVia ?? "—"}
      </span>
    ),
  },
];

export function CycleBreakdownDialog({
  cycle,
  open,
  onOpenChange,
}: {
  cycle: MaintenanceHistoryEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const charges = React.useMemo(() => (cycle ? getChargesByCycle(cycle.id) : []), [cycle]);

  const summary = React.useMemo(() => {
    if (!cycle) return null;
    const paidFlats = charges.filter((charge) => charge.status === "paid").length;
    const outstanding = cycle.totalExpected - cycle.totalCollected;
    const percent = cycle.totalExpected
      ? Math.round((cycle.totalCollected / cycle.totalExpected) * 100)
      : 0;
    return { paidFlats, totalFlats: charges.length, outstanding, percent };
  }, [charges, cycle]);

  const filters = React.useMemo<DataTableFilterConfig<FlatCharge>[]>(
    () => [
      {
        id: "search",
        label: "Search",
        type: "search",
        placeholder: "Search flat, owner…",
        predicate: (row, query) => {
          const q = query.toLowerCase();
          return row.flat.toLowerCase().includes(q) || row.owner.toLowerCase().includes(q);
        },
      },
      {
        id: "tower",
        label: "Tower",
        type: "select",
        options: Array.from(new Set(charges.map((charge) => charge.tower)))
          .sort()
          .map((tower) => ({ label: `Tower ${tower}`, value: tower })),
        predicate: (row, value) => row.tower === value,
      },
      {
        id: "status",
        label: "Status",
        type: "select",
        options: (Object.keys(flatChargeLabel) as FlatChargeStatus[]).map((status) => ({
          label: flatChargeLabel[status],
          value: status,
        })),
        predicate: (row, value) => row.status === value,
      },
    ],
    [charges],
  );

  function handleDownload() {
    if (!cycle) return;
    downloadCsv(`maintenance-${cycle.monthKey}-breakdown.csv`, chargesToCsv(charges));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{cycle ? `${cycle.monthLabel} breakdown` : "Cycle breakdown"}</DialogTitle>
          <DialogDescription>
            {cycle
              ? `${cycle.type} cycle · Due ${formatDate(cycle.dueDate)} · Generated by ${cycle.generatedBy}`
              : "Per-flat charges for this cycle."}
          </DialogDescription>
        </DialogHeader>
        {cycle && summary && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              <div className="flex flex-col gap-0.5 rounded-lg border bg-card px-3 py-2.5">
                <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Expected
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {formatCurrency(cycle.totalExpected)}
                </span>
              </div>
              <div className="flex flex-col gap-0.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 dark:border-emerald-900 dark:bg-emerald-950/30">
                <span className="text-[11px] font-medium uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                  Collected
                </span>
                <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                  {formatCurrency(cycle.totalCollected)}
                </span>
              </div>
              <div className="flex flex-col gap-0.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 dark:border-amber-900 dark:bg-amber-950/30">
                <span className="text-[11px] font-medium uppercase tracking-wider text-amber-700 dark:text-amber-300">
                  Outstanding
                </span>
                <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                  {formatCurrency(summary.outstanding)}
                </span>
              </div>
              <div className="flex flex-col gap-0.5 rounded-lg border bg-card px-3 py-2.5">
                <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Collected %
                </span>
                <span className="text-sm font-semibold text-foreground">{summary.percent}%</span>
              </div>
              <div className="flex flex-col gap-0.5 rounded-lg border bg-card px-3 py-2.5">
                <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Flats paid
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {summary.paidFlats} of {summary.totalFlats}
                </span>
              </div>
            </div>
            <DataTable
              data={charges}
              columns={breakdownColumns}
              getRowId={(row) => row.chargeId}
              filters={filters}
              title={`Charges · ${cycle.monthLabel}`}
              showPageSize
              pageSize={12}
              itemLabel="charge"
              emptyMessage="No charges match these filters."
              toolbarActions={
                <Button variant="outline" size="sm" className="gap-1.5" onClick={handleDownload}>
                  <Download className="size-3.5" />
                  Download report
                </Button>
              }
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
