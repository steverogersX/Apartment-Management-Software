"use client";

import { ActivityLogTable } from "@/components/activityLogTable";
import { useAuth } from "@/hooks/useAuth";
import { PermissionDenied } from "@/components/permissionDenied";
import { PageIcon } from "@/components/pageIcon";

export default function ActivityLogPage() {
  const { has } = useAuth();

  if (!has("ActivityLogView")) {
    return <PermissionDenied message="You do not have permission to view the activity log." />;
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <div>
        <h1 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground">
          <PageIcon />
          Activity Log
        </h1>
        <p className="text-sm text-muted-foreground">
          Who did what, and when — across every section of the society.
        </p>
      </div>
      <ActivityLogTable />
    </div>
  );
}
