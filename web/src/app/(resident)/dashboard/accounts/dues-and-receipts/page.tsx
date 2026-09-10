"use client";

import * as React from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type DataTableFilterConfig } from "@/components/dataTable";
import { DataTableColumnHeader } from "@/components/dataTableColumnHeader";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentFlat } from "@/hooks/useCurrentFlat";
import { flats } from "@/lib/flatsMockData";
import { computeInvoiceTotals, computeOutstandingBalance, invoices } from "@/lib/invoicingMockData";
import { getAgeingBucket, receipts, type AgeingBucket, type Receipt } from "@/lib/duesMockData";

type DuesRow = {
  flatId: string;
  flatLabel: string;
  tower: string;
  outstanding: number;
  ageing: AgeingBucket;
  oldestDueDate: string;
  lastPaymentDate: string | null;
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

export default function DuesAndReceiptsPage() {
  const { has } = useAuth();
  const { flatId: ownFlatId } = useCurrentFlat();
  const canViewAll = has("DuesReceiptsViewAll");
  const [receiptOpen, setReceiptOpen] = React.useState<Receipt | null>(null);

  if (!canViewAll && !has("DuesReceiptsViewOwn")) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm text-muted-foreground">
          You do not have permission to view dues and receipts.
        </p>
        <Link href="/dashboard" className="text-sm font-medium text-foreground underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const scopedInvoices = canViewAll ? invoices : invoices.filter((inv) => inv.flatId === ownFlatId);
  const scopedReceipts = canViewAll ? receipts : receipts.filter((r) => r.flatId === ownFlatId);

  const duesRows = React.useMemo<DuesRow[]>(() => {
    const map = new Map<string, { invoices: typeof invoices; receipts: Receipt[] }>();
    scopedInvoices.forEach((inv) => {
      if (inv.status === "Paid" || inv.status === "Cancelled") return;
      const outstanding = computeOutstandingBalance(inv);
      if (outstanding <= 0) return;
      const entry = map.get(inv.flatId) ?? { invoices: [] as any, receipts: [] as any };
      entry.invoices.push(inv);
      map.set(inv.flatId, entry);
    });
    scopedReceipts.forEach((r) => {
      const entry = map.get(r.flatId);
      if (entry) entry.receipts.push(r);
    });
    const rows: DuesRow[] = [];
    map.forEach((val, flatId) => {
      const flat = flats.find((f) => f.id === flatId);
      const outstanding = val.invoices.reduce(
        (s, inv) => s + computeOutstandingBalance(inv as any),
        0,
      );
      if (outstanding <= 0) return;
      const oldestDue = val.invoices
        .map((inv) => inv.dueDate)
        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())[0];
      const ageing = getAgeingBucket(oldestDue);
      const lastPayment = val.receipts.length
        ? val.receipts
            .map((r) => r.paymentDate)
            .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0]
        : (val.invoices
            .map((inv) =>
              scopedInvoices.filter((i) => i.flatId === flatId && i.paidOn).map((i) => i.paidOn!),
            )
            .flat()[0] ?? null);
      // fallback to latest receipt date for flat
      const flatReceipts = scopedReceipts.filter((r) => r.flatId === flatId);
      const lastPay = flatReceipts.length
        ? flatReceipts.sort(
            (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime(),
          )[0].paymentDate
        : null;
      rows.push({
        flatId,
        flatLabel: flat ? `${flat.tower}-${flat.flatNumber}` : flatId,
        tower: flat?.tower ?? "—",
        outstanding,
        ageing,
        oldestDueDate: oldestDue,
        lastPaymentDate: lastPay,
      });
    });
    return rows.sort((a, b) => b.outstanding - a.outstanding);
  }, [receipts.length, invoices.length]);

  const duesSummary = React.useMemo(() => {
    const totalOutstanding = duesRows.reduce((s, r) => s + r.outstanding, 0);
    const total90 = duesRows
      .filter((r) => r.ageing === "90+ days")
      .reduce((s, r) => s + r.outstanding, 0);
    return { totalOutstanding, total90, flatsInArrears: duesRows.length };
  }, [duesRows]);

  const duesColumns = React.useMemo<ColumnDef<DuesRow>[]>(
    () => [
      {
        id: "flatLabel",
        accessorKey: "flatLabel",
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Flat"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="text-sm font-medium text-foreground">{row.original.flatLabel}</span>
        ),
      },
      {
        id: "outstanding",
        accessorKey: "outstanding",
        meta: { label: "Outstanding" },
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Outstanding Amount"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="text-sm font-medium text-foreground">
            {formatCurrency(row.original.outstanding)}
          </span>
        ),
      },
      {
        id: "ageing",
        accessorKey: "ageing",
        meta: { label: "Ageing" },
        header: () => <DataTableColumnHeader label="Ageing Bucket" />,
        cell: ({ row }) => {
          const v = row.original.ageing;
          return (
            <Badge
              variant={
                v === "90+ days" ? "destructive" : v === "61-90 days" ? "outline" : "secondary"
              }
            >
              {v}
            </Badge>
          );
        },
      },
      {
        id: "lastPaymentDate",
        accessorKey: "lastPaymentDate",
        meta: { label: "Last Payment" },
        header: () => <DataTableColumnHeader label="Last Payment Date" />,
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.lastPaymentDate ? formatDate(row.original.lastPaymentDate) : "—"}
          </span>
        ),
      },
    ],
    [],
  );

  const receiptColumns = React.useMemo<ColumnDef<Receipt>[]>(
    () => [
      {
        id: "receiptNumber",
        accessorKey: "receiptNumber",
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Receipt #"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="text-sm font-medium text-foreground">{row.original.receiptNumber}</span>
        ),
      },
      {
        id: "paymentDate",
        accessorKey: "paymentDate",
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Date"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatDate(row.original.paymentDate)}
          </span>
        ),
      },
      {
        id: "flatId",
        accessorFn: (row) => flatLabelFor(row.flatId),
        meta: { label: "Flat" },
        header: () => <DataTableColumnHeader label="Flat" />,
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">{flatLabelFor(row.original.flatId)}</span>
        ),
      },
      {
        id: "invoiceId",
        accessorKey: "invoiceId",
        meta: { label: "Invoice" },
        header: () => <DataTableColumnHeader label="Invoice #" />,
        cell: ({ row }) => {
          const inv = invoices.find((i) => i.id === row.original.invoiceId);
          return (
            <span className="text-sm text-muted-foreground">
              {inv?.invoiceNumber ?? row.original.invoiceId}
            </span>
          );
        },
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
          <span className="text-sm font-medium text-foreground">
            {formatCurrency(row.original.amount)}
          </span>
        ),
      },
      {
        id: "paymentMode",
        accessorKey: "paymentMode",
        meta: { label: "Mode" },
        header: () => <DataTableColumnHeader label="Mode" />,
        cell: ({ row }) => <Badge variant="outline">{row.original.paymentMode}</Badge>,
      },
    ],
    [],
  );

  const receiptFilters = React.useMemo<DataTableFilterConfig<Receipt>[]>(
    () => [
      {
        id: "search",
        label: "Search",
        type: "search",
        placeholder: "Search receipt #",
        predicate: (row, q) => row.receiptNumber.toLowerCase().includes(q.toLowerCase()),
      },
      {
        id: "paymentMode",
        label: "Mode",
        type: "select",
        options: ["Cash", "Cheque", "NEFT/RTGS", "UPI", "Card", "Online Gateway"].map((m) => ({
          label: m,
          value: m,
        })),
        predicate: (row, v) => row.paymentMode === v,
      },
      {
        id: "flat",
        label: "Flat",
        type: "select",
        options: flats.map((f) => ({ label: `${f.tower}-${f.flatNumber}`, value: f.id })),
        predicate: (row, v) => row.flatId === v,
      },
      {
        id: "tower",
        label: "Tower",
        type: "select",
        options: ["A", "B", "C"].map((t) => ({ label: `Tower ${t}`, value: t })),
        predicate: (row, v) => {
          const f = flats.find((fl) => fl.id === row.flatId);
          return f?.tower === v;
        },
      },
    ],
    [],
  );

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">Dues and Receipts</h1>
        <p className="text-sm text-muted-foreground">
          Outstanding balances and payment receipts register.
        </p>
      </div>

      <Tabs defaultValue="dues">
        <TabsList>
          <TabsTrigger value="dues">Outstanding Dues</TabsTrigger>
          <TabsTrigger value="receipts">Receipts Register</TabsTrigger>
        </TabsList>

        <TabsContent value="dues" className="mt-4 flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <p className="text-xs text-muted-foreground">Total Outstanding</p>
                <CardTitle className="text-xl tabular-nums">
                  {formatCurrency(duesSummary.totalOutstanding)}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground">Unpaid balances</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <p className="text-xs text-muted-foreground">90+ days</p>
                <CardTitle className="text-xl tabular-nums text-red-600 dark:text-red-400">
                  {formatCurrency(duesSummary.total90)}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground">In 90+ days bucket</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <p className="text-xs text-muted-foreground">Flats in arrears</p>
                <CardTitle className="text-xl tabular-nums">{duesSummary.flatsInArrears}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground">With outstanding dues</p>
              </CardContent>
            </Card>
          </div>

          <DataTable
            data={duesRows}
            columns={duesColumns}
            getRowId={(r) => r.flatId}
            title="Outstanding Dues"
            showPageSize
            pageSize={8}
            itemLabel="flat"
            emptyMessage="No outstanding dues."
          />
        </TabsContent>

        <TabsContent value="receipts" className="mt-4">
          <DataTable
            data={[...scopedReceipts].sort(
              (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime(),
            )}
            columns={receiptColumns}
            getRowId={(r) => r.id}
            title="Receipts"
            filters={receiptFilters}
            enableColumnVisibility
            enableFilterCustomization
            showPageSize
            pageSize={8}
            itemLabel="receipt"
            emptyMessage="No receipts found."
            onRowClick={(row) => setReceiptOpen(row)}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={!!receiptOpen} onOpenChange={(o) => !o && setReceiptOpen(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Receipt {receiptOpen?.receiptNumber}</DialogTitle>
            <DialogDescription>Payment receipt — printable</DialogDescription>
          </DialogHeader>
          {receiptOpen && (
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium text-foreground">
                  {formatDate(receiptOpen.paymentDate)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Flat</span>
                <span className="font-medium text-foreground">
                  {flatLabelFor(receiptOpen.flatId)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Invoice</span>
                <span className="font-medium text-foreground">
                  {invoices.find((i) => i.id === receiptOpen.invoiceId)?.invoiceNumber ??
                    receiptOpen.invoiceId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium text-foreground">
                  {formatCurrency(receiptOpen.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mode</span>
                <Badge variant="outline">{receiptOpen.paymentMode}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Recorded by</span>
                <span className="font-medium text-foreground">{receiptOpen.recordedBy}</span>
              </div>
              {receiptOpen.remarks && (
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground">Remarks</span>
                  <span className="text-foreground">{receiptOpen.remarks}</span>
                </div>
              )}
              <div className="flex justify-end pt-2">
                <Button size="sm" onClick={() => window.print()}>
                  Print
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
