"use client";

import Link from "next/link";

import { ActivityLogTable } from "@/components/activityLogTable";
import { useAuth } from "@/hooks/useAuth";

export default function ActivityLogPage() {
  const { has } = useAuth();

  if (!has("ActivityLogView")) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm text-muted-foreground">
          You do not have permission to view the activity log.
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
        <h1 className="text-lg font-semibold tracking-tight text-foreground">Activity Log</h1>
        <p className="text-sm text-muted-foreground">
          Who did what, and when — across assets, inventory and accounts.
        </p>
      </div>
      <ActivityLogTable />
    </div>
  );
}
