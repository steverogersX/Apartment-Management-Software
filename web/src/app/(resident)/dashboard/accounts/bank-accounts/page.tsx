"use client";

import { BankAccountsTable } from "@/components/bankAccountsTable";
import { useAuth } from "@/hooks/useAuth";
import { PermissionDenied } from "@/components/permissionDenied";
import { PageIcon } from "@/components/pageIcon";

export default function BankAccountsPage() {
  const { has } = useAuth();

  if (!has("BankAccountsView")) {
    return <PermissionDenied message="You do not have permission to view bank accounts." />;
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <div>
        <h1 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground">
          <PageIcon />
          Bank Accounts
        </h1>
        <p className="text-sm text-muted-foreground">
          Bank and cash ledgers with balances and reconciliation.
        </p>
      </div>
      <BankAccountsTable />
    </div>
  );
}
