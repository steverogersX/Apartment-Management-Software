"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Download, Eye } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/dataTable";
import { DataTableColumnHeader } from "@/components/dataTableColumnHeader";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { flats } from "@/lib/flatsMockData";
import { residents } from "@/lib/residentsMockData";
import { receipts } from "@/lib/duesMockData";
import { computeInvoiceTotals, isOverdue, type Invoice } from "@/lib/invoicingMockData";

type CycleStatus = "Collected" | "Overdue" | "Partial" | "Pending";

type Cycle = {
  billingPeriod: string;
  invoices: Invoice[];
  flatsCovered: number;
  towers: string[];
  totalExpected: number;
  totalCollected: number;
  dueDate: string;
  status: CycleStatus;
};

const STATUS_BADGE_CLASS: Record<CycleStatus, string> = {
  Collected:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",
  Partial:
    "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300",
  Overdue:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300",
  Pending:
    "border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300",
};

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

function flatLabelFor(flatId: string) {
  const f = flats.find((fl) => fl.id === flatId);
  return f ? `${f.tower}-${f.flatNumber}` : flatId;
}

function ownerNameFor(flatId: string) {
  return residents.find((r) => r.flatId === flatId)?.name ?? "—";
}

function paidViaFor(invoiceId: string) {
  return receipts.find((r) => r.invoiceId === invoiceId)?.paymentMode ?? null;
}

function mostFrequent(values: string[]): string {
  const counts = new Map<string, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";
}

function buildCycles(source: Invoice[]): Cycle[] {
  const grouped = new Map<string, Invoice[]>();
  for (const inv of source) {
    const list = grouped.get(inv.billingPeriod) ?? [];
    list.push(inv);
    grouped.set(inv.billingPeriod, list);
  }
  return [...grouped.entries()].map(([billingPeriod, periodInvoices]) => {
    const active = periodInvoices.filter((inv) => inv.status !== "Cancelled");
    const totalExpected = active.reduce((s, inv) => s + computeInvoiceTotals(inv).total, 0);
    const totalCollected = active.reduce((s, inv) => s + inv.amountPaid, 0);
    const hasOverdue = active.some((inv) => isOverdue(inv));
    const status: CycleStatus =
      totalExpected > 0 && totalCollected >= totalExpected
        ? "Collected"
        : hasOverdue
          ? "Overdue"
          : totalCollected > 0
            ? "Partial"
            : "Pending";
    return {
      billingPeriod,
      invoices: periodInvoices,
      flatsCovered: periodInvoices.length,
      towers: [
        ...new Set(
          periodInvoices.map((inv) => flats.find((f) => f.id === inv.flatId)?.tower ?? "—"),
        ),
      ].sort(),
      totalExpected,
      totalCollected,
      dueDate: mostFrequent(periodInvoices.map((inv) => inv.dueDate)),
      status,
    };
  });
}

function escapeCsvCell(value: string | number): string {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function downloadCsv(filename: string, csv: string) {
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

function cycleInvoicesToCsv(cycle: Cycle): string {
  const header = [
    "Flat",
    "Owner",
    "Invoice #",
    "Total",
    "Paid",
    "Balance",
    "Status",
    "Paid Via",
    "Paid On",
    "Due Date",
  ];
  const lines = cycle.invoices.map((inv) =>
    [
      flatLabelFor(inv.flatId),
      ownerNameFor(inv.flatId),
      inv.invoiceNumber,
      computeInvoiceTotals(inv).total,
      inv.amountPaid,
      Math.max(0, computeInvoiceTotals(inv).total - inv.amountPaid),
      inv.status,
      paidViaFor(inv.id) ?? "",
      inv.paidOn ?? "",
      inv.dueDate,
    ]
      .map(escapeCsvCell)
      .join(","),
  );
  return [header.join(","), ...lines].join("\n");
}

export function CollectionCyclesTable({ invoices: source }: { invoices: Invoice[] }) {
  const cycles = React.useMemo(() => buildCycles(source), [source]);
  const [selected, setSelected] = React.useState<Cycle | null>(null);

  const columns = React.useMemo<ColumnDef<Cycle>[]>(
    () => [
      {
        id: "billingPeriod",
        accessorKey: "billingPeriod",
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Billing period"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="text-sm font-medium text-foreground">{row.original.billingPeriod}</span>
        ),
      },
      {
        id: "towers",
        accessorFn: (row) => row.towers.join(","),
        meta: { label: "Towers" },
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
        meta: { label: "Flats" },
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
        id: "collected",
        accessorKey: "totalCollected",
        meta: { label: "Collected" },
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
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Due Date"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">{formatDate(row.original.dueDate)}</span>
        ),
      },
      {
        id: "status",
        accessorKey: "status",
        meta: { label: "Status" },
        header: () => <DataTableColumnHeader label="Status" />,
        cell: ({ row }) => (
          <Badge variant="outline" className={STATUS_BADGE_CLASS[row.original.status]}>
            {row.original.status}
          </Badge>
        ),
      },
      {
        id: "actions",
        enableHiding: false,
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="View breakdown"
            onClick={(e) => {
              e.stopPropagation();
              setSelected(row.original);
            }}
          >
            <Eye className="size-3.5" />
          </Button>
        ),
      },
    ],
    [],
  );

  const summary = React.useMemo(() => {
    const totalCycles = cycles.length;
    const totalCollected = cycles.reduce((s, c) => s + c.totalCollected, 0);
    const totalExpected = cycles.reduce((s, c) => s + c.totalExpected, 0);
    const avgPercent = totalExpected ? Math.round((totalCollected / totalExpected) * 100) : 0;
    return { totalCycles, totalCollected, totalExpected, avgPercent };
  }, [cycles]);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <p className="text-xs text-muted-foreground">Billing cycles</p>
            <CardTitle className="text-xl tabular-nums">{summary.totalCycles}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <p className="text-xs text-muted-foreground">Collected</p>
            <CardTitle className="text-xl tabular-nums">
              {formatCurrency(summary.totalCollected)}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">
              of {formatCurrency(summary.totalExpected)} expected
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <p className="text-xs text-muted-foreground">Avg collection</p>
            <CardTitle className="text-xl tabular-nums">{summary.avgPercent}%</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <DataTable
        data={cycles}
        columns={columns}
        getRowId={(c) => c.billingPeriod}
        title="Collection cycles"
        showPageSize
        pageSize={8}
        itemLabel="cycle"
        emptyMessage="No billing cycles yet — generate invoices to start one."
        onRowClick={(row) => setSelected(row)}
      />

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selected?.billingPeriod} breakdown</DialogTitle>
            <DialogDescription>Every invoice generated in this billing cycle.</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="flex flex-col gap-4">
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() =>
                    downloadCsv(
                      `invoicing-${selected.billingPeriod.replace(/\s+/g, "-")}.csv`,
                      cycleInvoicesToCsv(selected),
                    )
                  }
                >
                  <Download className="size-3.5" />
                  Download report
                </Button>
              </div>
              <div className="overflow-x-auto rounded-md border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Flat</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Paid</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Paid via</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selected.invoices.map((inv) => {
                      const total = computeInvoiceTotals(inv).total;
                      const balance = Math.max(0, total - inv.amountPaid);
                      return (
                        <TableRow key={inv.id}>
                          <TableCell className="font-medium text-foreground">
                            {flatLabelFor(inv.flatId)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {ownerNameFor(inv.flatId)}
                          </TableCell>
                          <TableCell className="text-sm text-foreground">
                            {formatCurrency(total)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatCurrency(inv.amountPaid)}
                          </TableCell>
                          <TableCell className="text-sm font-medium text-foreground">
                            {formatCurrency(balance)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{inv.status}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {paidViaFor(inv.id) ?? "—"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
