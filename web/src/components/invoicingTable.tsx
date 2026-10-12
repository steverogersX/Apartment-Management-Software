"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

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
import { additionalCharges, billingRateSettings, gstSettings } from "@/lib/billingSettingsMockData";
import { flats } from "@/lib/flatsMockData";
import {
  computeInvoiceTotals,
  computeOutstandingBalance,
  getDisplayStatus,
  invoices,
  isOverdue,
  type GenerateInvoicesInput,
  type Invoice,
  type InvoiceLineItem,
} from "@/lib/invoicingMockData";
import { GenerateInvoicesForm } from "./invoicing/generateInvoicesForm";
import { useAuth } from "@/hooks/useAuth";
import { recordAudit } from "@/lib/auditLog";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

function flatLabel(flatId: string) {
  const f = flats.find((fl) => fl.id === flatId);
  if (!f) return flatId;
  return `${f.tower}-${f.flatNumber}`;
}

function statusBadgeVariant(status: string) {
  if (status === "Paid") return "secondary";
  if (status === "Partially Paid") return "secondary";
  if (status === "Overdue") return "destructive";
  if (status === "Issued") return "outline";
  if (status === "Cancelled") return "outline";
  return "outline";
}

export function InvoicingTable({
  flatId = null,
  readOnly = false,
}: { flatId?: string | null; readOnly?: boolean } = {}) {
  const { toast } = useToast();
  const router = useRouter();
  const { user, has } = useAuth();
  const actor = user?.displayName ?? "Unknown";
  const canManage = has("InvoicingManage") && !readOnly;
  const [rows, setRows] = React.useState<Invoice[]>(() => [...invoices]);
  const [generateOpen, setGenerateOpen] = React.useState(false);

  const visibleRows = flatId ? rows.filter((r) => r.flatId === flatId) : rows;

  function handleGenerate(values: GenerateInvoicesInput) {
    const now = new Date().toISOString();
    const gstRate = gstSettings.gstApplicable ? gstSettings.gstRate : 0;
    const newInvoices: Invoice[] = values.selectedFlatIds.map((flatId, idx) => {
      const flat = flats.find((f) => f.id === flatId);
      const tower = flat?.tower ?? "";
      const area = flat?.areaSqft ?? 0;
      const maintenanceAmount = (() => {
        const m = billingRateSettings.method;
        if (m === "Equal Split")
          return values.maintenanceAmount || billingRateSettings.equalSplitAmount;
        if (m === "Per Sqft") return Math.round(billingRateSettings.ratePerSqft * area);
        return Math.round(
          billingRateSettings.equalSplitAmount + billingRateSettings.ratePerSqft * area,
        );
      })();
      const lineItems: InvoiceLineItem[] = [
        {
          type: "Maintenance",
          description: `Monthly maintenance - ${values.billingPeriod}`,
          amount: maintenanceAmount,
          taxable: true,
        },
      ];
      const sinkingDefault =
        additionalCharges.find((c) => c.name === "Sinking Fund")?.defaultAmount ??
        values.sinkingFundAmount ??
        0;
      const parkingDefault =
        additionalCharges.find((c) => c.name === "Parking")?.defaultAmount ??
        values.parkingAmount ??
        0;
      const sinkingAmount = values.sinkingFundAmount ?? sinkingDefault;
      const parkingAmount = values.parkingAmount ?? parkingDefault;
      if (sinkingAmount && sinkingAmount > 0) {
        lineItems.push({
          type: "Sinking Fund",
          description: "Sinking fund contribution",
          amount: sinkingAmount,
          taxable: false,
        });
      }
      if (parkingAmount && parkingAmount > 0) {
        lineItems.push({
          type: "Parking",
          description: `Parking - ${tower}`,
          amount: parkingAmount,
          taxable: true,
        });
      }
      additionalCharges
        .filter((c) => c.name !== "Sinking Fund" && c.name !== "Parking")
        .forEach((c) => {
          if (c.defaultAmount > 0)
            lineItems.push({
              type: "Maintenance",
              description: c.name,
              amount: c.defaultAmount,
              taxable: true,
            });
        });
      return {
        id: crypto.randomUUID(),
        invoiceNumber: `INV-${values.billingPeriod.replace(/\s/g, "-").toUpperCase()}-${String(invoices.length + idx + 1).padStart(3, "0")}`,
        flatId,
        billingPeriod: values.billingPeriod,
        issueDate: now,
        dueDate: values.dueDate,
        lineItems,
        gstRate,
        status: "Issued" as const,
        amountPaid: 0,
        paidOn: null,
        remindersSent: 0,
        lastReminderAt: null,
        cancelledReason: null,
        issuedBy: actor,
        cancelledBy: null,
      };
    });
    newInvoices.forEach((inv) => {
      invoices.push(inv);
      recordAudit({
        module: "Invoicing",
        entityType: "Invoice",
        entityId: inv.id,
        entityLabel: inv.invoiceNumber,
        action: "Create",
        performedBy: actor,
        details: `${inv.billingPeriod} · ${flatLabel(inv.flatId)} · ${formatCurrency(computeInvoiceTotals(inv).total)}`,
      });
    });
    setRows((prev) => [...prev, ...newInvoices]);
    setGenerateOpen(false);
    toast({ title: "Invoices generated" });
  }

  const summary = React.useMemo(() => {
    const outstanding = visibleRows
      .filter((inv) => inv.status !== "Paid" && inv.status !== "Cancelled")
      .reduce(
        (s, inv) =>
          s +
          (inv.status === "Partially Paid"
            ? Math.max(0, computeInvoiceTotals(inv).total - inv.amountPaid)
            : computeInvoiceTotals(inv).total),
        0,
      );
    const overdue = visibleRows
      .filter((inv) => isOverdue(inv))
      .reduce(
        (s, inv) =>
          s +
          (inv.status === "Partially Paid"
            ? Math.max(0, computeInvoiceTotals(inv).total - inv.amountPaid)
            : computeInvoiceTotals(inv).total),
        0,
      );
    const collected = visibleRows
      .filter((inv) => inv.status === "Paid")
      .reduce((s, inv) => s + computeInvoiceTotals(inv).total, 0);
    return { outstanding, overdue, collected };
  }, [visibleRows]);

  const billingPeriods = React.useMemo(
    () => Array.from(new Set(visibleRows.map((r) => r.billingPeriod))).sort(),
    [visibleRows],
  );

  const columns = React.useMemo<ColumnDef<Invoice>[]>(
    () => [
      {
        id: "invoiceNumber",
        accessorKey: "invoiceNumber",
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Invoice #"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm font-medium text-foreground">
            {row.original.invoiceNumber}
          </span>
        ),
      },
      {
        id: "flat",
        accessorFn: (row) => flatLabel(row.flatId),
        meta: { label: "Flat" },
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Flat"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            {flatLabel(row.original.flatId)}
          </span>
        ),
      },
      {
        id: "billingPeriod",
        accessorKey: "billingPeriod",
        meta: { label: "Period" },
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Billing Period"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            {row.original.billingPeriod}
          </span>
        ),
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
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            {formatDate(row.original.dueDate)}
          </span>
        ),
      },
      {
        id: "total",
        accessorFn: (row) => computeInvoiceTotals(row).total,
        meta: { label: "Total" },
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Total"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm font-medium text-foreground">
            {formatCurrency(computeInvoiceTotals(row.original).total)}
          </span>
        ),
      },
      {
        id: "status",
        accessorFn: (row) => getDisplayStatus(row),
        meta: { label: "Status" },
        header: () => <DataTableColumnHeader label="Status" />,
        cell: ({ row }) => {
          const display = getDisplayStatus(row.original);
          return <Badge variant={statusBadgeVariant(display) as any}>{display}</Badge>;
        },
      },
      {
        id: "remindersSent",
        accessorKey: "remindersSent",
        meta: { label: "Reminders" },
        header: () => <DataTableColumnHeader label="Reminders" />,
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">{row.original.remindersSent}</span>
        ),
      },
    ],
    [],
  );

  const filters = React.useMemo<DataTableFilterConfig<Invoice>[]>(
    () => [
      {
        id: "search",
        label: "Search",
        type: "search",
        placeholder: "Search invoice or flat",
        predicate: (row, query) => {
          const q = query.toLowerCase();
          return (
            row.invoiceNumber.toLowerCase().includes(q) ||
            flatLabel(row.flatId).toLowerCase().includes(q)
          );
        },
      },
      {
        id: "billingPeriod",
        label: "Period",
        type: "select",
        options: billingPeriods.map((p) => ({ label: p, value: p })),
        predicate: (row, value) => row.billingPeriod === value,
      },
      {
        id: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "Draft", value: "Draft" },
          { label: "Issued", value: "Issued" },
          { label: "Partially Paid", value: "Partially Paid" },
          { label: "Paid", value: "Paid" },
          { label: "Overdue", value: "Overdue" },
          { label: "Cancelled", value: "Cancelled" },
        ],
        predicate: (row, value) => getDisplayStatus(row) === value,
      },
    ],
    [billingPeriods],
  );

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <p className="text-xs text-muted-foreground">Total Outstanding</p>
            <CardTitle className="text-xl tabular-nums">
              {formatCurrency(summary.outstanding)}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Unpaid, non-cancelled</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <p className="text-xs text-muted-foreground">Total Overdue</p>
            <CardTitle className="text-xl tabular-nums text-red-600 dark:text-red-400">
              {formatCurrency(summary.overdue)}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Past due</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <p className="text-xs text-muted-foreground">Total Collected</p>
            <CardTitle className="text-xl tabular-nums text-emerald-600 dark:text-emerald-400">
              {formatCurrency(summary.collected)}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Paid invoices</p>
          </CardContent>
        </Card>
      </div>

      <DataTable
        data={visibleRows}
        columns={columns}
        getRowId={(r) => r.id}
        title="Invoices"
        filters={filters}
        enableColumnVisibility
        enableColumnReorder
        enableFilterCustomization
        showPageSize
        pageSize={10}
        itemLabel="invoice"
        emptyMessage="No invoices found."
        onRowClick={(row) => router.push(`/dashboard/accounts/invoicing/${row.id}`)}
        toolbarActions={
          canManage ? (
            <Button size="sm" className="gap-1.5" onClick={() => setGenerateOpen(true)}>
              <Plus className="size-3.5" />
              Generate Invoices
            </Button>
          ) : undefined
        }
      />

      <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Generate invoices</DialogTitle>
            <DialogDescription>
              Bulk-create invoices for a billing period across flats.
            </DialogDescription>
          </DialogHeader>
          <GenerateInvoicesForm
            key={String(generateOpen)}
            onSave={handleGenerate}
            onCancel={() => setGenerateOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
