"use client";

import Link from "next/link";

import { InvoicingTable } from "@/components/invoicingTable";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentFlat } from "@/hooks/useCurrentFlat";

export default function InvoicingPage() {
  const { has } = useAuth();
  const { flatId } = useCurrentFlat();
  const canViewAll = has("InvoicingViewAll");
  const canViewOwn = has("InvoicingViewOwn");

  if (!canViewAll && !canViewOwn) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm text-muted-foreground">
          You do not have permission to view invoices.
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
        <h1 className="text-lg font-semibold tracking-tight text-foreground">Invoicing</h1>
        <p className="text-sm text-muted-foreground">
          {canViewAll
            ? "Generate and track maintenance invoices for flats."
            : "Your flat's maintenance invoices."}
        </p>
      </div>
      <InvoicingTable flatId={canViewAll ? null : flatId} readOnly={!canViewAll} />
    </div>
  );
}
