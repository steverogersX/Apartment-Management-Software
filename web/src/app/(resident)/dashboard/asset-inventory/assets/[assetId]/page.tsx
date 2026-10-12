"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Pencil, Plus } from "lucide-react";

import { useBreadcrumbTitle } from "@/components/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  assets,
  assetServiceLogs,
  type AddServiceLogInput,
  type Asset,
  type AssetServiceLog,
  type EditAssetInput,
} from "@/lib/assetsMockData";
import { AddServiceLogForm } from "@/components/assets/addServiceLogForm";
import { EditAssetForm } from "@/components/assets/editAssetForm";
import { AssetServiceTimeline } from "@/components/assetServiceTimeline";
import { useAuth } from "@/hooks/useAuth";
import { recordAudit } from "@/lib/auditLog";
import { PermissionDenied } from "@/components/permissionDenied";
import { formatCurrency } from "@/lib/utils";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function expiryStatus(iso: string | null) {
  if (!iso) return { label: "—", variant: "outline" as const, dot: "bg-zinc-300" };
  const now = new Date();
  const exp = new Date(iso);
  const diff = exp.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days < 0) return { label: "Expired", variant: "destructive" as const, dot: "bg-red-500" };
  if (days <= 30)
    return { label: `Expiring in ${days}d`, variant: "outline" as const, dot: "bg-amber-500" };
  return { label: "Valid", variant: "secondary" as const, dot: "bg-emerald-500" };
}

const STATUS_DOT: Record<Asset["status"], string> = {
  Active: "bg-emerald-500",
  "Under Repair": "bg-amber-500",
  Retired: "bg-zinc-400",
};

export default function AssetDetailPage() {
  const params = useParams<{ assetId: string }>();
  const { user, has } = useAuth();
  const actor = user?.displayName ?? "Unknown";
  const canManage = has("AssetsManage");
  const initialAsset = React.useMemo(
    () => assets.find((a) => a.id === params.assetId) ?? null,
    [params.assetId],
  );
  const [asset, setAsset] = React.useState<Asset | null>(initialAsset);
  const [editOpen, setEditOpen] = React.useState(false);
  const [logOpen, setLogOpen] = React.useState(false);
  const [logs, setLogs] = React.useState<AssetServiceLog[]>(() =>
    assetServiceLogs.filter((l) => l.assetId === params.assetId),
  );

  React.useEffect(() => {
    setAsset(initialAsset);
  }, [initialAsset]);

  React.useEffect(() => {
    setLogs(assetServiceLogs.filter((l) => l.assetId === params.assetId));
  }, [params.assetId]);

  useBreadcrumbTitle(asset?.name ?? null);

  if (!has("AssetsView")) {
    return <PermissionDenied message="You do not have permission to view assets." />;
  }

  if (!asset) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <p className="text-sm text-muted-foreground">Asset not found.</p>
        <Link
          href="/dashboard/asset-inventory/assets"
          className="text-sm font-medium text-foreground underline"
        >
          Back to Assets
        </Link>
      </div>
    );
  }

  function handleEditSave(values: EditAssetInput) {
    if (!asset) return;
    const now = new Date().toISOString();
    const idx = assets.findIndex((a) => a.id === asset.id);
    if (idx !== -1) {
      Object.assign(assets[idx], values);
      assets[idx].warrantyExpiry = values.warrantyExpiry ?? null;
      assets[idx].amcExpiry = values.amcExpiry ?? null;
      assets[idx].lastUpdatedBy = actor;
      assets[idx].lastUpdatedAt = now;
    }
    setAsset((prev) =>
      prev
        ? {
            ...prev,
            ...values,
            warrantyExpiry: values.warrantyExpiry ?? null,
            amcExpiry: values.amcExpiry ?? null,
            lastUpdatedBy: actor,
            lastUpdatedAt: now,
          }
        : prev,
    );
    recordAudit({
      module: "Assets",
      entityType: "Asset",
      entityId: asset.id,
      entityLabel: asset.name,
      action: "Update",
      performedBy: actor,
    });
    setEditOpen(false);
  }

  function handleLogService(values: AddServiceLogInput) {
    if (!asset) return;
    const newLog: AssetServiceLog = {
      id: crypto.randomUUID(),
      assetId: asset.id,
      date: values.date,
      type: values.type,
      description: values.description,
      vendor: values.vendor || undefined,
      cost: values.cost,
      loggedBy: actor,
    };
    assetServiceLogs.push(newLog);
    setLogs((prev) => [newLog, ...prev]);
    recordAudit({
      module: "Assets",
      entityType: "Service Log",
      entityId: newLog.id,
      entityLabel: `${values.type} — ${asset.name}`,
      action: "Create",
      performedBy: actor,
      details: values.description,
    });
    if (values.type === "AMC Renewal" && values.newAmcExpiry) {
      const idx = assets.findIndex((a) => a.id === asset.id);
      if (idx !== -1) {
        assets[idx].amcExpiry = values.newAmcExpiry;
      }
      setAsset((prev) => (prev ? { ...prev, amcExpiry: values.newAmcExpiry as string } : prev));
    }
    setLogOpen(false);
  }

  const warranty = expiryStatus(asset.warrantyExpiry);
  const amc = expiryStatus(asset.amcExpiry);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <Link
        href="/dashboard/asset-inventory/assets"
        className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Back to Assets
      </Link>

      <Card>
        <CardContent className="flex gap-5 p-6">
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight text-foreground">{asset.name}</h1>
              <Badge variant="outline">{asset.assetTag}</Badge>
              <Badge variant="outline">{asset.category}</Badge>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2 py-0.5 text-xs font-medium">
                <span className={cn("size-1.5 shrink-0 rounded-full", STATUS_DOT[asset.status])} />
                {asset.status}
              </span>
              {canManage && (
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-auto gap-1.5"
                  onClick={() => setEditOpen(true)}
                >
                  <Pencil className="size-3.5" />
                  Edit
                </Button>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{asset.location}</p>
            {asset.lastUpdatedBy && (
              <p className="text-xs text-muted-foreground">
                Last updated by {asset.lastUpdatedBy}
                {asset.lastUpdatedAt ? ` on ${formatDate(asset.lastUpdatedAt)}` : ""}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Acquisition Details</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Purchase date</span>
              <span className="font-medium text-foreground">{formatDate(asset.purchaseDate)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Purchase cost</span>
              <span className="font-medium text-foreground">
                {formatCurrency(asset.purchaseCost)}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Vendor</span>
              <span className="font-medium text-foreground">{asset.vendor}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Location</span>
              <span className="font-medium text-foreground">{asset.location}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Asset tag</span>
              <span className="font-medium text-foreground">{asset.assetTag}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Warranty &amp; AMC</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-sm">
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col">
                <span className="text-muted-foreground">Warranty expiry</span>
                <span className="font-medium text-foreground">
                  {formatDate(asset.warrantyExpiry)}
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5">
                <span className={cn("size-1.5 shrink-0 rounded-full", warranty.dot)} />
                <Badge variant={warranty.variant}>{warranty.label}</Badge>
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col">
                <span className="text-muted-foreground">AMC expiry</span>
                <span className="font-medium text-foreground">{formatDate(asset.amcExpiry)}</span>
              </div>
              <span className="inline-flex items-center gap-1.5">
                <span className={cn("size-1.5 shrink-0 rounded-full", amc.dot)} />
                <Badge variant={amc.variant}>{amc.label}</Badge>
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
          <CardTitle>Service History</CardTitle>
          {canManage && (
            <Button size="sm" className="gap-1.5" onClick={() => setLogOpen(true)}>
              <Plus className="size-3.5" />
              Log Service
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <AssetServiceTimeline logs={logs} />
        </CardContent>
      </Card>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit asset</DialogTitle>
            <DialogDescription>Update the asset registry entry.</DialogDescription>
          </DialogHeader>
          {asset && (
            <EditAssetForm
              key={asset.id + JSON.stringify(asset)}
              asset={asset}
              onSave={handleEditSave}
              onCancel={() => setEditOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={logOpen} onOpenChange={setLogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Log service entry</DialogTitle>
            <DialogDescription>
              Add a new service, repair, inspection, or AMC renewal record.
            </DialogDescription>
          </DialogHeader>
          {asset && (
            <AddServiceLogForm
              key={String(logOpen)}
              assetId={asset.id}
              onSave={handleLogService}
              onCancel={() => setLogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
