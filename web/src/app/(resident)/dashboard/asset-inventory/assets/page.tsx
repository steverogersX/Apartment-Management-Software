"use client";

import Link from "next/link";

import { AssetsTable } from "@/components/assetsTable";
import { useAuth } from "@/hooks/useAuth";

export default function AssetsPage() {
  const { has } = useAuth();

  if (!has("AssetsView")) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm text-muted-foreground">You do not have permission to view assets.</p>
        <Link href="/dashboard" className="text-sm font-medium text-foreground underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">Assets</h1>
        <p className="text-sm text-muted-foreground">
          Track and manage society assets and equipment.
        </p>
      </div>
      <AssetsTable />
    </div>
  );
}
