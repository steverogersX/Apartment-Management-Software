"use client";

import { AssetsTable } from "@/components/assetsTable";
import { useAuth } from "@/hooks/useAuth";
import { PermissionDenied } from "@/components/permissionDenied";
import { PageIcon } from "@/components/pageIcon";

export default function AssetsPage() {
  const { has } = useAuth();

  if (!has("AssetsView")) {
    return <PermissionDenied message="You do not have permission to view assets." />;
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <div>
        <h1 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground">
          <PageIcon />
          Assets
        </h1>
        <p className="text-sm text-muted-foreground">
          Track and manage society assets and equipment.
        </p>
      </div>
      <AssetsTable />
    </div>
  );
}
