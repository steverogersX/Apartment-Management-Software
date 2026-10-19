"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, BadgeCheck, Pencil, Phone, Plus, ShieldCheck, X } from "lucide-react";

import { useBreadcrumbTitle } from "@/components/breadcrumbs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataTable, type DataTableFilterConfig } from "@/components/dataTable";
import { DataTableColumnHeader } from "@/components/dataTableColumnHeader";
import { Label } from "@/components/ui/label";
import { FlatSelect } from "@/components/flats/flatSelect";
import { formatDate, formatDateTime, getInitials, gradientForName } from "@/lib/utils";
import { flats } from "@/lib/flatsMockData";
import {
  providerActivityLogs,
  providerEntryLogs,
  providerFlatLinks,
  serviceProviders,
  type ServiceProvider,
  type EditProviderInput,
  type ProviderActivityLog,
  type ProviderEntryLog,
  type ProviderFlatLink,
} from "@/lib/providersMockData";
import { EditProviderForm } from "@/components/providers/editProviderForm";
import { ProviderActivityTimeline } from "@/components/providerActivityTimeline";
import { useAuth } from "@/hooks/useAuth";
import type { ColumnDef } from "@tanstack/react-table";
import { useToast } from "@/components/ui/toast";
import { StatusIcon } from "@/components/statusIcon";
import { recordAudit } from "@/lib/auditLog";

function isWithinDays(iso: string, days: number) {
  const diff = Date.now() - new Date(iso).getTime();
  return diff >= 0 && diff <= days * 24 * 60 * 60 * 1000;
}

function isToday(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
}

function elapsedSince(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(ms / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  if (hours <= 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

export default function ProviderDetailPage() {
  const params = useParams<{ providerId: string }>();
  const initial = serviceProviders.find((p) => p.id === params.providerId);

  if (!initial) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <p className="text-sm text-muted-foreground">Provider not found.</p>
        <Link
          href="/dashboard/people-hub/service-providers"
          className="text-sm font-medium text-foreground underline"
        >
          Back to Service Providers
        </Link>
      </div>
    );
  }

  return <ProviderDetail key={initial.id} initial={initial} />;
}

function ProviderDetail({ initial }: { initial: ServiceProvider }) {
  const { user: auditUser } = useAuth();
  const { toast } = useToast();
  const [provider, setProvider] = React.useState(initial);
  const { user } = useAuth();
  const actorName = user?.displayName ?? user?.email ?? "Admin";

  useBreadcrumbTitle(provider.name);

  const [links, setLinks] = React.useState<ProviderFlatLink[]>(() =>
    providerFlatLinks.filter((l) => l.providerId === initial.id && l.status === "active"),
  );
  const [activity, setActivity] = React.useState<ProviderActivityLog[]>(() =>
    providerActivityLogs.filter((l) => l.providerId === initial.id),
  );

  const logs = React.useMemo(
    () => providerEntryLogs.filter((l) => l.providerId === initial.id),
    [initial.id],
  );

  const [assignOpen, setAssignOpen] = React.useState(false);
  const [selectedFlat, setSelectedFlat] = React.useState<string>("");
  const [editOpen, setEditOpen] = React.useState(false);

  const availableFlats = React.useMemo(() => {
    const linked = new Set(links.map((l) => l.flatNumber));
    return flats.filter((f) => !linked.has(`${f.tower}-${f.flatNumber}`));
  }, [links]);

  const [from, to] = gradientForName(provider.name);

  function handleRemove(linkId: string) {
    if (!provider) return;
    const link = links.find((l) => l.id === linkId);
    if (!link) return;
    setLinks((prev) => prev.filter((l) => l.id !== linkId));
    setActivity((prev) => [
      {
        id: crypto.randomUUID(),
        providerId: provider.id,
        action: "flat_removed",
        flatNumber: link.flatNumber,
        actor: actorName,
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ]);
    recordAudit({
      module: "Service Providers",
      entityType: "Service Provider",
      entityId: provider.id,
      entityLabel: provider.name,
      action: "Update",
      performedBy: auditUser?.displayName ?? "Unknown",
      details: "Flat unlinked",
    });
    toast({ title: "Flat unlinked", variant: "info" });
  }

  function handleAssign() {
    if (!provider || !selectedFlat) return;
    const newLink: ProviderFlatLink = {
      id: crypto.randomUUID(),
      providerId: provider.id,
      flatNumber: selectedFlat,
      approvedBy: actorName,
      linkedOn: new Date().toISOString(),
      status: "active",
    };
    setLinks((prev) => [...prev, newLink]);
    setActivity((prev) => [
      {
        id: crypto.randomUUID(),
        providerId: provider.id,
        action: "flat_assigned",
        flatNumber: selectedFlat,
        actor: actorName,
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ]);
    setSelectedFlat("");
    setAssignOpen(false);
    recordAudit({
      module: "Service Providers",
      entityType: "Service Provider",
      entityId: provider.id,
      entityLabel: provider.name,
      action: "Update",
      performedBy: auditUser?.displayName ?? "Unknown",
      details: "Flat assigned",
    });
    toast({ title: "Flat assigned" });
  }

  function handleEditSave(values: EditProviderInput) {
    if (!provider) return;
    const prevStatus = provider.status;
    setProvider((prev) => (prev ? { ...prev, ...values } : prev));
    if (values.status !== prevStatus) {
      setActivity((prev) => [
        {
          id: crypto.randomUUID(),
          providerId: provider.id,
          action: values.status === "blocked" ? "provider_blocked" : "provider_unblocked",
          flatNumber: null,
          actor: actorName,
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ]);
    }
    setEditOpen(false);
    recordAudit({
      module: "Service Providers",
      entityType: "Service Provider",
      entityId: provider.id,
      entityLabel: provider.name,
      action: "Update",
      performedBy: auditUser?.displayName ?? "Unknown",
    });
    toast({ title: "Provider updated" });
  }

  const flatOptions = React.useMemo(() => {
    const flatsFromLinks = Array.from(new Set(links.map((l) => l.flatNumber)));
    return flatsFromLinks;
  }, [links]);

  const entryColumns = React.useMemo<ColumnDef<ProviderEntryLog>[]>(
    () => [
      {
        id: "flatNumber",
        accessorKey: "flatNumber",
        meta: { label: "Flat" },
        header: () => <DataTableColumnHeader label="Flat" />,
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            {row.original.flatNumber ?? "Outside work"}
          </span>
        ),
      },
      {
        id: "checkIn",
        accessorKey: "checkIn",
        meta: { label: "Check In" },
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Check In"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-foreground">
            {formatDateTime(row.original.checkIn)}
          </span>
        ),
      },
      {
        id: "checkOut",
        accessorKey: "checkOut",
        meta: { label: "Check Out" },
        header: () => <DataTableColumnHeader label="Check Out" />,
        cell: ({ row }) => {
          const v = row.original.checkOut;
          if (!v)
            return (
              <span className="inline-flex items-center gap-1.5">
                <Badge variant="secondary">Inside</Badge>
                <span className="whitespace-nowrap text-xs text-muted-foreground">
                  {elapsedSince(row.original.checkIn)}
                </span>
              </span>
            );
          return (
            <span className="whitespace-nowrap text-sm text-muted-foreground">
              {formatDateTime(v)}
            </span>
          );
        },
      },
      {
        id: "verifiedBy",
        accessorKey: "verifiedBy",
        meta: { label: "Verified By" },
        header: () => <DataTableColumnHeader label="Verified By" />,
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            {row.original.verifiedBy}
          </span>
        ),
      },
    ],
    [],
  );

  const entryFilters = React.useMemo<DataTableFilterConfig<ProviderEntryLog>[]>(
    () => [
      {
        id: "search",
        label: "Search",
        type: "search",
        placeholder: "Search flat or guard",
        predicate: (row, query) => {
          const q = query.toLowerCase();
          return (
            (row.flatNumber ?? "Outside work").toLowerCase().includes(q) ||
            row.verifiedBy.toLowerCase().includes(q) ||
            provider.status.toLowerCase().includes(q)
          );
        },
      },
      {
        id: "flat",
        label: "Flat",
        type: "select",
        options: [
          ...flatOptions.map((f) => ({ label: f, value: f })),
          { label: "Outside work", value: "__outside" },
        ],
        predicate: (row, value) => {
          if (value === "__outside") return row.flatNumber === null;
          return row.flatNumber === value;
        },
      },
      {
        id: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "Inside", value: "inside" },
          { label: "Checked out", value: "checked_out" },
        ],
        predicate: (row, value) =>
          value === "inside" ? row.checkOut === null : row.checkOut !== null,
      },
      {
        id: "when",
        label: "When",
        type: "select",
        options: [
          { label: "Today", value: "today" },
          { label: "Last 7 days", value: "7d" },
          { label: "Last 30 days", value: "30d" },
          { label: "All time", value: "all" },
        ],
        predicate: (row, value) => {
          if (value === "all") return true;
          if (value === "today") return isToday(row.checkIn);
          if (value === "7d") return isWithinDays(row.checkIn, 7);
          if (value === "30d") return isWithinDays(row.checkIn, 30);
          return true;
        },
      },
      {
        id: "groupBy",
        label: "Group by",
        type: "groupBy",
        options: [
          { label: "None", value: "none" },
          { label: "Flat", value: "flat" },
        ],
        groupBy: (row) => row.flatNumber ?? "Outside work",
      },
    ],
    [flatOptions, provider.status],
  );

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <Link
        href="/dashboard/people-hub/service-providers"
        className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Back to Service Providers
      </Link>

      <Card>
        <CardContent className="flex gap-5 p-6">
          <Avatar className="size-20 shrink-0 text-lg">
            <AvatarImage src={provider.photoUrl} alt={provider.name} />
            <AvatarFallback
              className="text-lg font-semibold text-white"
              style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}
            >
              {getInitials(provider.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight text-foreground">
                {provider.name}
              </h1>
              <Badge variant="outline">{provider.category}</Badge>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2 py-0.5 text-xs font-medium">
                <StatusIcon status={provider.status} />
                {provider.status === "active" ? "Active" : "Blocked"}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="ml-auto gap-1.5"
                onClick={() => setEditOpen(true)}
              >
                <Pencil className="size-3.5" />
                Edit
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Phone className="size-3.5 shrink-0" />
                {provider.phone}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <BadgeCheck className="size-3.5 shrink-0" />
                {provider.idProofType}: {provider.idProofNumber}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 shrink-0" />
                Added {formatDate(provider.addedOn)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="h-fit">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
          <CardTitle>Flats Served</CardTitle>
          <Button size="sm" className="gap-1.5" onClick={() => setAssignOpen(true)}>
            <Plus className="size-3.5" />
            Assign Flat
          </Button>
        </CardHeader>
        <CardContent>
          {links.length === 0 ? (
            <p className="text-sm text-muted-foreground">Not linked to any flat — outside work.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {links.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center gap-3 rounded-md border border-border p-3"
                >
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium text-foreground">
                      {link.flatNumber}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      Approved by {link.approvedBy}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(link.linkedOn)}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="shrink-0 text-muted-foreground"
                    onClick={() => handleRemove(link.id)}
                  >
                    <X className="size-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ProviderActivityTimeline logs={activity} providerName={provider.name} />
        </CardContent>
      </Card>

      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign flat</DialogTitle>
            <DialogDescription>
              Link this provider to a flat for gate verification.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Flat</Label>
              <FlatSelect
                flats={availableFlats}
                valueKey="label"
                value={selectedFlat}
                onValueChange={setSelectedFlat}
              />
              {availableFlats.length === 0 && (
                <p className="text-xs text-muted-foreground">All flats are already linked.</p>
              )}
            </div>
            {provider.status === "blocked" && (
              <p className="text-xs text-destructive">
                Unblock this provider before assigning flats.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!selectedFlat || provider.status === "blocked"}
              onClick={handleAssign}
            >
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit provider</DialogTitle>
            <DialogDescription>Update the provider profile.</DialogDescription>
          </DialogHeader>
          {provider && (
            <EditProviderForm
              key={provider.id + JSON.stringify(provider)}
              provider={provider}
              onSave={handleEditSave}
              onCancel={() => setEditOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Entry Log</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            data={logs}
            columns={entryColumns}
            getRowId={(r) => r.id}
            filters={entryFilters}
            enableColumnVisibility
            enableFilterCustomization
            showPageSize
            pageSize={8}
            itemLabel="entry"
            emptyMessage="No entry logs for this provider."
          />
        </CardContent>
      </Card>
    </div>
  );
}
