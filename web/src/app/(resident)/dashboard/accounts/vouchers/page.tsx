"use client";

import { VouchersTable } from "@/components/vouchersTable";
import { useAuth } from "@/hooks/useAuth";
import { PermissionDenied } from "@/components/permissionDenied";
import { PageIcon } from "@/components/pageIcon";

export default function VouchersPage() {
  const { has } = useAuth();

  if (!has("VouchersView")) {
    return <PermissionDenied message="You do not have permission to view vouchers." />;
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <div>
        <h1 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground">
          <PageIcon />
          Vouchers
        </h1>
        <p className="text-sm text-muted-foreground">
          Double-entry vouchers — payments, receipts, journals and contras.
        </p>
      </div>
      <VouchersTable />
    </div>
  );
}
