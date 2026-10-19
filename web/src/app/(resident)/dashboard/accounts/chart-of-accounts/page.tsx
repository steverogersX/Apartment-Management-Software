"use client";

import { ChartOfAccountsTree } from "@/components/chartOfAccountsTree";
import { useAuth } from "@/hooks/useAuth";
import { PermissionDenied } from "@/components/permissionDenied";
import { PageIcon } from "@/components/pageIcon";

export default function ChartOfAccountsPage() {
  const { has } = useAuth();

  if (!has("ChartOfAccountsView")) {
    return <PermissionDenied message="You do not have permission to view the chart of accounts." />;
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <div>
        <h1 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground">
          <PageIcon />
          Chart of Accounts
        </h1>
        <p className="text-sm text-muted-foreground">
          Group → sub-group → ledger hierarchy with live balances.
        </p>
      </div>
      <ChartOfAccountsTree />
    </div>
  );
}
