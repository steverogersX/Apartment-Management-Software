"use client";

import * as React from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { Bike, Car, Home, IdCard, Plus, SquareParking, UserRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableFilterConfig } from "@/components/dataTable";
import { DataTableColumnHeader } from "@/components/dataTableColumnHeader";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreateVehicleForm } from "@/components/vehicles/createVehicleForm";
import {
  flats,
  flatVehicleHistory,
  type AddVehicleInput,
  type FlatVehicleEntry,
} from "@/lib/flatsMockData";
import { residents } from "@/lib/residentsMockData";
import { useToast } from "@/components/ui/toast";
import { PageIcon } from "@/components/pageIcon";
import { useAuth } from "@/hooks/useAuth";
import { recordAudit } from "@/lib/auditLog";

type HubVehicleRow = {
  id: string;
  registrationNumber: string;
  type: "car" | "two_wheeler";
  make: string;
  model: string;
  color: string;
  ownerName: string;
  flatLabel: string;
  tower: string;
  parkingSlot: string | null;
};

function buildRows(): HubVehicleRow[] {
  const flatMap = new Map(flats.map((f) => [f.id, f]));
  return flatVehicleHistory
    .filter((v) => v.isCurrent)
    .map((v) => {
      const flat = flatMap.get(v.flatId);
      return {
        id: `${v.flatId}-${v.registrationNumber}`,
        registrationNumber: v.registrationNumber,
        type: v.type,
        make: v.make,
        model: v.model,
        color: v.color,
        ownerName: v.ownerName,
        flatLabel: flat ? `${flat.tower}-${flat.flatNumber}` : v.flatId,
        tower: flat ? `Tower ${flat.tower}` : "—",
        parkingSlot: v.parkingSlot,
      };
    });
}

const columns: ColumnDef<HubVehicleRow>[] = [
  {
    id: "vehicle",
    accessorKey: "registrationNumber",
    header: ({ column }) => (
      <DataTableColumnHeader
        icon={Car}
        label="Vehicle"
        sorted={column.getIsSorted()}
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      />
    ),
    cell: ({ row }) => {
      const Icon = row.original.type === "car" ? Car : Bike;
      return (
        <div className="flex items-center gap-2.5">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <Icon className="size-3.5" />
          </span>
          <span className="flex flex-col">
            <span className="font-medium text-foreground">
              {row.original.make} {row.original.model}
            </span>
            <span className="text-xs text-muted-foreground">
              {row.original.color} · {row.original.type === "car" ? "Car" : "Two-wheeler"}
            </span>
          </span>
        </div>
      );
    },
  },
  {
    id: "registrationNumber",
    accessorKey: "registrationNumber",
    meta: { label: "Registration" },
    header: () => <DataTableColumnHeader icon={IdCard} label="Registration" />,
    cell: ({ row }) => (
      <span className="font-mono text-xs font-medium tabular-nums text-foreground">
        {row.original.registrationNumber}
      </span>
    ),
  },
  {
    id: "flat",
    accessorKey: "flatLabel",
    meta: { label: "Flat" },
    header: ({ column }) => (
      <DataTableColumnHeader
        icon={Home}
        label="Flat"
        sorted={column.getIsSorted()}
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      />
    ),
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.flatLabel}</span>,
  },
  {
    id: "owner",
    accessorKey: "ownerName",
    meta: { label: "Owner" },
    header: () => <DataTableColumnHeader icon={UserRound} label="Owner" />,
    cell: ({ row }) => (
      <span className="font-medium text-foreground">{row.original.ownerName}</span>
    ),
  },
  {
    id: "slot",
    accessorKey: "parkingSlot",
    meta: { label: "Slot" },
    header: () => <DataTableColumnHeader icon={SquareParking} label="Slot" />,
    cell: ({ row }) =>
      row.original.parkingSlot ? (
        <Link href={`/dashboard/people-hub/parking?slot=${row.original.parkingSlot}`}>
          <Badge variant="outline" className="font-mono hover:bg-muted">
            {row.original.parkingSlot}
          </Badge>
        </Link>
      ) : (
        <span className="text-sm text-muted-foreground">Unassigned</span>
      ),
  },
];

export default function PeopleHubVehiclesPage() {
  const { user: auditUser } = useAuth();
  const { toast } = useToast();
  const [version, setVersion] = React.useState(0);
  const [createOpen, setCreateOpen] = React.useState(false);

  const rows = React.useMemo(() => buildRows(), [version]);

  const filters = React.useMemo<DataTableFilterConfig<HubVehicleRow>[]>(
    () => [
      {
        id: "search",
        label: "Search",
        type: "search",
        placeholder: "Search reg, owner, flat, model…",
        predicate: (row, query) => {
          const q = query.trim().toLowerCase();
          return (
            row.registrationNumber.toLowerCase().includes(q) ||
            row.ownerName.toLowerCase().includes(q) ||
            row.flatLabel.toLowerCase().includes(q) ||
            `${row.make} ${row.model}`.toLowerCase().includes(q)
          );
        },
      },
      {
        id: "groupBy",
        label: "Group by",
        type: "groupBy",
        options: [
          { label: "None", value: "none" },
          { label: "Flat", value: "flat" },
          { label: "Tower", value: "tower" },
        ],
        groupBy: (row, value) => (value === "flat" ? row.flatLabel : row.tower),
      },
      {
        id: "type",
        label: "Type",
        type: "select",
        options: [
          { label: "Car", value: "car" },
          { label: "Two-wheeler", value: "two_wheeler" },
        ],
        predicate: (row, value) => row.type === value,
      },
      {
        id: "tower",
        label: "Tower",
        type: "select",
        options: [...new Set(flats.map((f) => f.tower))]
          .sort()
          .map((t) => ({ label: `Tower ${t}`, value: `Tower ${t}` })),
        predicate: (row, value) => row.tower === value,
      },
      {
        id: "parking",
        label: "Parking",
        type: "select",
        options: [
          { label: "Has a slot", value: "assigned" },
          { label: "No slot", value: "none" },
        ],
        predicate: (row, value) => (row.parkingSlot ? "assigned" : "none") === value,
      },
    ],
    [],
  );

  function handleCreateVehicle(values: AddVehicleInput) {
    const resident = residents.find((r) => r.id === values.residentId);
    const newEntry: FlatVehicleEntry = {
      flatId: values.flatId,
      residentId: values.residentId,
      registrationNumber: values.registrationNumber.trim(),
      type: values.type,
      make: values.make,
      model: values.model,
      color: values.color,
      ownerName: resident ? resident.name : values.residentId,
      parkingSlot: null,
      isCurrent: true,
    };
    flatVehicleHistory.push(newEntry);
    setVersion((v) => v + 1);
    setCreateOpen(false);
    recordAudit({
      module: "Vehicles",
      entityType: "Vehicle",
      entityId: newEntry.registrationNumber,
      entityLabel: newEntry.registrationNumber,
      action: "Create",
      performedBy: auditUser?.displayName ?? "Unknown",
      details: `${newEntry.make} ${newEntry.model}`,
    });
    toast({ title: "Vehicle added" });
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <div>
        <h1 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground">
          <PageIcon />
          Vehicles
        </h1>
        <p className="text-sm text-muted-foreground">
          Every registered vehicle in the society — flat, owner, and slot.
        </p>
      </div>
      <DataTable
        data={rows}
        columns={columns}
        title="Society vehicles"
        filters={filters}
        showPageSize
        pageSize={8}
        itemLabel="vehicle"
        emptyMessage="No vehicles match your filters."
        initialSorting={[{ id: "vehicle", desc: false }]}
        toolbarActions={
          <Button size="sm" className="gap-1.5" onClick={() => setCreateOpen(true)}>
            <Plus className="size-3.5" />
            Add vehicle
          </Button>
        }
      />
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add vehicle</DialogTitle>
            <DialogDescription>Register a new vehicle for a flat.</DialogDescription>
          </DialogHeader>
          <CreateVehicleForm
            key={String(createOpen)}
            onSave={handleCreateVehicle}
            onCancel={() => setCreateOpen(false)}
            existingRegistrationNumbers={flatVehicleHistory.map((v) => v.registrationNumber)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
