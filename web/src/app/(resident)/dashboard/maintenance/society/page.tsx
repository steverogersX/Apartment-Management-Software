"use client";

import * as React from "react";
import { IndianRupee, ListChecks, Plus, Wrench } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { MaintenanceTable, type MaintenanceRow } from "@/components/maintenanceTable";
import { AddMaintenanceLogForm } from "@/components/maintenance/addMaintenanceLogForm";
import {
  maintenanceLog as maintenanceLogSource,
  type AddMaintenanceLogInput,
  type MaintenanceLogEntry,
} from "@/lib/maintenanceMockData";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrency } from "@/lib/utils";
import { PermissionDenied } from "@/components/permissionDenied";

export default function SocietyMaintenancePage() {
  const { user, has } = useAuth();
  const [log, setLog] = React.useState<MaintenanceLogEntry[]>(() => [...maintenanceLogSource]);
  const [addOpen, setAddOpen] = React.useState(false);

  const canManage = has("MaintenanceManage");

  const societyEntries = React.useMemo(() => log.filter((e) => e.scope === "society"), [log]);
  const flatEntries = React.useMemo(() => log.filter((e) => e.scope === "flat"), [log]);
  const totalSocietyCost = React.useMemo(
    () => societyEntries.reduce((sum, e) => sum + (e.cost ?? 0), 0),
    [societyEntries],
  );

  function handleAdd(values: AddMaintenanceLogInput) {
    const now = new Date().toISOString();
    const entry: MaintenanceLogEntry = {
      id: `mnt-${Date.now()}`,
      scope: values.scope,
      tower: values.scope === "flat" ? (values.tower ?? null) : null,
      flatNumber: values.scope === "flat" ? (values.flatNumber ?? null) : null,
      location: values.scope === "society" ? (values.location ?? null) : null,
      category: values.category,
      description: values.description,
      staffId: values.staffId ?? null,
      performedOn: values.performedOn,
      cost: values.cost ?? null,
      loggedBy: user?.displayName ?? "Society Admin",
      loggedAt: now,
    };
    maintenanceLogSource.unshift(entry);
    setLog((prev) => [entry, ...prev]);
    setAddOpen(false);
  }

  if (!has("MaintenanceViewAll")) {
    return <PermissionDenied message="You do not have permission to view the maintenance log." />;
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
            Society Maintenance
          </h1>
          <p className="text-sm text-muted-foreground">
            Common-area maintenance work, plus the full activity log across every flat.
          </p>
        </div>
        {canManage && (
          <Button size="sm" className="shrink-0 gap-1.5" onClick={() => setAddOpen(true)}>
            <Plus className="size-3.5" />
            Log entry
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <p className="text-xs text-muted-foreground">Society work items</p>
            <Wrench className="size-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-2xl font-semibold tabular-nums text-foreground">
              {societyEntries.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <p className="text-xs text-muted-foreground">Society maintenance cost</p>
            <IndianRupee className="size-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-2xl font-semibold tabular-nums text-foreground">
              {formatCurrency(totalSocietyCost)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <p className="text-xs text-muted-foreground">Flat-level entries</p>
            <ListChecks className="size-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-2xl font-semibold tabular-nums text-foreground">
              {flatEntries.length}
            </p>
          </CardContent>
        </Card>
      </div>

      <MaintenanceTable data={log as MaintenanceRow[]} title="Full activity log" enableGrouping />

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Log a maintenance entry</DialogTitle>
            <DialogDescription>For a specific flat, or a society common area.</DialogDescription>
          </DialogHeader>
          <AddMaintenanceLogForm
            key={String(addOpen)}
            onSave={handleAdd}
            onCancel={() => setAddOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
