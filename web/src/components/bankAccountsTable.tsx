"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableFilterConfig } from "@/components/dataTable";
import { DataTableColumnHeader } from "@/components/dataTableColumnHeader";
import {
  bankAccountDetails,
  bankStatementEntries,
  computeLedgerBalance,
  type BankAccountDetails,
} from "@/lib/bankAccountsMockData";
import { accountName } from "@/lib/chartOfAccountsMockData";

function maskedAccountNumber(accountNumber: string) {
  const digits = accountNumber.replace(/\D/g, "");
  if (digits.length <= 4) return accountNumber;
  return `••••${digits.slice(-4)}`;
}

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export type BankAccountRow = BankAccountDetails & {
  ledgerName: string;
  balance: number;
  unreconciledCount: number;
};

export function BankAccountsTable() {
  const router = useRouter();

  const rows = React.useMemo<BankAccountRow[]>(
    () =>
      bankAccountDetails.map((b) => ({
        ...b,
        ledgerName: accountName(b.ledgerAccountId),
        balance: computeLedgerBalance(b.ledgerAccountId),
        unreconciledCount: bankStatementEntries.filter(
          (e) => e.ledgerAccountId === b.ledgerAccountId && !e.reconciled,
        ).length,
      })),
    [],
  );

  const columns = React.useMemo<ColumnDef<BankAccountRow>[]>(
    () => [
      {
        id: "ledgerName",
        accessorKey: "ledgerName",
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Account"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium text-foreground">
              {row.original.bankName}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {row.original.ledgerName}
            </span>
          </div>
        ),
      },
      {
        id: "accountNumber",
        accessorKey: "accountNumber",
        meta: { label: "Account Number" },
        header: () => <DataTableColumnHeader label="Account Number" />,
        cell: ({ row }) => (
          <span className="whitespace-nowrap font-mono text-sm text-muted-foreground">
            {maskedAccountNumber(row.original.accountNumber)}
          </span>
        ),
      },
      {
        id: "ifsc",
        accessorKey: "ifsc",
        meta: { label: "IFSC" },
        header: () => <DataTableColumnHeader label="IFSC" />,
        cell: ({ row }) => (
          <span className="whitespace-nowrap font-mono text-sm text-muted-foreground">
            {row.original.ifsc}
          </span>
        ),
      },
      {
        id: "balance",
        accessorKey: "balance",
        meta: { label: "Balance" },
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Current Balance"
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
        id: "unreconciledCount",
        accessorKey: "unreconciledCount",
        meta: { label: "Unreconciled" },
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Unreconciled"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) =>
          row.original.unreconciledCount > 0 ? (
            <Badge variant="destructive">{row.original.unreconciledCount} pending</Badge>
          ) : (
            <Badge variant="secondary">All clear</Badge>
          ),
      },
    ],
    [],
  );

  const filters = React.useMemo<DataTableFilterConfig<BankAccountRow>[]>(
    () => [
      {
        id: "search",
        label: "Search",
        type: "search",
        placeholder: "Search bank or account",
        predicate: (row, query) => {
          const q = query.toLowerCase();
          return (
            row.bankName.toLowerCase().includes(q) ||
            row.ledgerName.toLowerCase().includes(q) ||
            row.accountNumber.toLowerCase().includes(q)
          );
        },
      },
    ],
    [],
  );

  return (
    <DataTable
      data={rows}
      columns={columns}
      getRowId={(r) => r.ledgerAccountId}
      title="Bank Accounts"
      filters={filters}
      enableColumnVisibility
      enableColumnReorder
      enableFilterCustomization
      showPageSize
      pageSize={8}
      itemLabel="account"
      emptyMessage="No bank accounts found."
      onRowClick={(row) => router.push(`/dashboard/accounts/bank-accounts/${row.ledgerAccountId}`)}
    />
  );
}
