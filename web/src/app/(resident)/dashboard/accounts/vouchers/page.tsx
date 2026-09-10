"use client";

import Link from "next/link";

import { VouchersTable } from "@/components/vouchersTable";
import { useAuth } from "@/hooks/useAuth";

export default function VouchersPage() {
  const { has } = useAuth();

  if (!has("VouchersView")) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm text-muted-foreground">
          You do not have permission to view vouchers.
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
        <h1 className="text-lg font-semibold tracking-tight text-foreground">Vouchers</h1>
        <p className="text-sm text-muted-foreground">
          Double-entry vouchers — payments, receipts, journals and contras.
        </p>
      </div>
      <VouchersTable />
    </div>
  );
}
