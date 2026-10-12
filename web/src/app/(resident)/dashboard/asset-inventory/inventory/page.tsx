"use client";

import { InventoryTable } from "@/components/inventoryTable";
import { useAuth } from "@/hooks/useAuth";
import { PermissionDenied } from "@/components/permissionDenied";
import { PageIcon } from "@/components/pageIcon";

export default function InventoryPage() {
  const { has } = useAuth();

  if (!has("InventoryView")) {
    return <PermissionDenied message="You do not have permission to view inventory." />;
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <div>
        <h1 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground">
          <PageIcon />
          Inventory
        </h1>
        <p className="text-sm text-muted-foreground">
          Track consumables, stock levels and allotments.
        </p>
      </div>
      <InventoryTable />
    </div>
  );
}
