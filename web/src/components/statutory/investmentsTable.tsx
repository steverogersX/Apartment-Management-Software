"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";

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
import { accountName, ledgerAccounts } from "@/lib/chartOfAccountsMockData";
import {
  investments,
  type AddInvestmentInput,
  type Investment,
  type InvestmentType,
} from "@/lib/investmentRegisterMockData";
import { InvestmentForm } from "./investmentForm";
import { useAuth } from "@/hooks/useAuth";
import { recordAudit } from "@/lib/auditLog";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function InvestmentsTable() {
  const { user, has } = useAuth();
  const canManage = has("StatutoryRegistersManage");
  const actor = user?.displayName ?? "Unknown";
  const [rows, setRows] = React.useState<Investment[]>(() => [...investments]);
  const [addOpen, setAddOpen] = React.useState(false);

  function handleAddSave(values: AddInvestmentInput) {
    const investment: Investment = {
      id: crypto.randomUUID(),
      type: values.type,
      institution: values.institution,
      investedAmount: values.investedAmount,
      investmentDate: values.investmentDate,
      maturityDate: values.maturityDate ?? null,
      interestRate: values.interestRate,
      linkedLedgerAccountId: values.linkedLedgerAccountId ?? null,
    };
    investments.push(investment);
    setRows((prev) => [...prev, investment]);
    recordAudit({
      module: "Accounts",
      entityType: "Investment",
      entityId: investment.id,
      entityLabel: `${investment.type} · ${investment.institution} · ${formatCurrency(investment.investedAmount)}`,
      action: "Create",
      performedBy: actor,
    });
    setAddOpen(false);
  }

  const columns = React.useMemo<ColumnDef<Investment>[]>(
    () => [
      {
        id: "type",
        accessorKey: "type",
        meta: { label: "Type" },
        header: () => <DataTableColumnHeader label="Type" />,
        cell: ({ row }) => <Badge variant="outline">{row.original.type}</Badge>,
      },
      {
        id: "institution",
        accessorKey: "institution",
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Institution"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm font-medium text-foreground">
            {row.original.institution}
          </span>
        ),
      },
      {
        id: "investedAmount",
        accessorKey: "investedAmount",
        meta: { label: "Amount" },
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Invested Amount"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm font-medium text-foreground">
            {formatCurrency(row.original.investedAmount)}
          </span>
        ),
      },
      {
        id: "interestRate",
        accessorKey: "interestRate",
        meta: { label: "Rate" },
        header: () => <DataTableColumnHeader label="Interest" />,
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            {row.original.interestRate}% p.a.
          </span>
        ),
      },
      {
        id: "maturityDate",
        accessorKey: "maturityDate",
        meta: { label: "Maturity" },
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Maturity Date"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            {formatDate(row.original.maturityDate)}
          </span>
        ),
      },
      {
        id: "linkedLedgerAccountId",
        accessorFn: (row) =>
          row.linkedLedgerAccountId ? accountName(row.linkedLedgerAccountId) : "—",
        meta: { label: "Ledger" },
        header: () => <DataTableColumnHeader label="Linked Account" />,
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            {row.original.linkedLedgerAccountId
              ? accountName(row.original.linkedLedgerAccountId)
              : "—"}
          </span>
        ),
      },
    ],
    [],
  );

  const filters = React.useMemo<DataTableFilterConfig<Investment>[]>(
    () => [
      {
        id: "search",
        label: "Search",
        type: "search",
        placeholder: "Search institution",
        predicate: (row, query) => row.institution.toLowerCase().includes(query.toLowerCase()),
      },
      {
        id: "type",
        label: "Type",
        type: "select",
        options: (["Fixed Deposit", "Bond", "Mutual Fund", "Other"] as InvestmentType[]).map(
          (t) => ({
            label: t,
            value: t,
          }),
        ),
        predicate: (row, value) => row.type === value,
      },
      {
        id: "ledger",
        label: "Ledger",
        type: "select",
        options: ledgerAccounts.map((a) => ({ label: a.name, value: a.id })),
        predicate: (row, value) => row.linkedLedgerAccountId === value,
      },
    ],
    [],
  );

  return (
    <>
      <DataTable
        data={rows}
        columns={columns}
        getRowId={(r) => r.id}
        title="Investments"
        filters={filters}
        enableColumnVisibility
        enableColumnReorder
        enableFilterCustomization
        showPageSize
        pageSize={8}
        itemLabel="investment"
        emptyMessage="No investments found."
        toolbarActions={
          canManage ? (
            <Button size="sm" className="gap-1.5" onClick={() => setAddOpen(true)}>
              <Plus className="size-3.5" />
              Add Investment
            </Button>
          ) : undefined
        }
      />

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add investment</DialogTitle>
            <DialogDescription>Record a new society investment.</DialogDescription>
          </DialogHeader>
          <InvestmentForm
            key={String(addOpen)}
            onSave={handleAddSave}
            onCancel={() => setAddOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
