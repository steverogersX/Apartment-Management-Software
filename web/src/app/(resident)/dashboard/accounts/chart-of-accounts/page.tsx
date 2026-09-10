"use client";

import Link from "next/link";

import { ChartOfAccountsTree } from "@/components/chartOfAccountsTree";
import { useAuth } from "@/hooks/useAuth";

export default function ChartOfAccountsPage() {
  const { has } = useAuth();

  if (!has("ChartOfAccountsView")) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm text-muted-foreground">
          You do not have permission to view the chart of accounts.
        </p>
        <Link href="/dashboard" className="text-sm font-medium text-foreground underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">Chart of Accounts</h1>
        <p className="text-sm text-muted-foreground">
          Group → sub-group → ledger hierarchy with live balances.
        </p>
      </div>
      <ChartOfAccountsTree />
    </div>
  );
}
