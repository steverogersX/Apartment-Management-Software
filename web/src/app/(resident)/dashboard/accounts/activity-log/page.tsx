"use client";

import { ActivityLogTable } from "@/components/activityLogTable";
import { useAuth } from "@/hooks/useAuth";
import { PermissionDenied } from "@/components/permissionDenied";

export default function ActivityLogPage() {
  const { has } = useAuth();

  if (!has("ActivityLogView")) {
    return <PermissionDenied message="You do not have permission to view the activity log." />;
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
