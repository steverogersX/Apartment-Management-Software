"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Bike,
  Car,
  CircleMinus,
  CirclePlus,
  Home,
  LayoutGrid,
  ParkingSquare,
  Plus,
  Search,
  SquareParking,
  Table2,
  UserRound,
} from "lucide-react";

import { avatarUrlForName, cn, getInitials, gradientForName } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type DataTableFilterConfig } from "@/components/dataTable";
import { DataTableColumnHeader } from "@/components/dataTableColumnHeader";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { CreateParkingSlotForm } from "@/components/parking/createParkingSlotForm";
import { flats, flatVehicleHistory } from "@/lib/flatsMockData";
import {
  parkingSlotEvents,
  parkingSlots,
  type AddParkingSlotInput,
  type ParkingSlotEvent,
  type ParkingSlotRecord,
  type ParkingVehicleType,
} from "@/lib/parkingMockData";

type StatusFilter = "all" | "occupied" | "vacant";
type TypeFilter = "all" | ParkingVehicleType;

type HubSlotRow = {
  id: string;
  slotNumber: string;
  zone: string;
  vehicleType: ParkingVehicleType;
  status: "allotted" | "unassigned";
  vehicleReg: string | null;
  flatLabel: string;
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function toRow(slot: ParkingSlotRecord): HubSlotRow {
  return {
    id: slot.id,
    slotNumber: slot.slotNumber,
    zone: slot.zone,
    vehicleType: slot.vehicleType,
    status: slot.assignment ? "allotted" : "unassigned",
    vehicleReg: slot.assignment?.vehicleReg ?? null,
    flatLabel: slot.assignment?.flatLabel ?? "—",
  };
}

const flatLabelById = new Map(flats.map((f) => [f.id, `${f.tower}-${f.flatNumber}`]));

function SlotTile({
  slot,
  selected,
  onSelect,
}: {
  slot: ParkingSlotRecord;
  selected: boolean;
  onSelect: () => void;
}) {
  const occupied = slot.assignment !== null;
  const VehicleIcon = slot.vehicleType === "car" ? Car : Bike;
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "group relative flex min-h-[5.5rem] flex-col items-center justify-center gap-1 rounded-lg border px-2 py-3 text-center transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none",
        occupied
          ? "border-emerald-300 bg-emerald-50 hover:border-emerald-400 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/70"
          : "border-dashed border-border bg-muted/30 hover:border-foreground/30 hover:bg-muted",
        selected && "ring-2 ring-ring ring-offset-2 ring-offset-background",
      )}
    >
      <span
        className={cn(
          "absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full",
          occupied
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-muted-foreground/60 group-hover:text-muted-foreground",
        )}
      >
        <VehicleIcon className="size-3" />
      </span>
      <span className="font-mono text-sm font-semibold text-foreground">{slot.slotNumber}</span>
      <span
        className={cn(
          "max-w-full truncate text-[11px] font-medium",
          occupied ? "text-emerald-700 dark:text-emerald-400" : "text-muted-foreground",
        )}
      >
        {slot.assignment ? slot.assignment.flatLabel : "Vacant"}
      </span>
    </button>
  );
}

function SlotTimeline({ events }: { events: ParkingSlotEvent[] }) {
  if (events.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
        No history yet for this slot.
      </p>
    );
  }
  return (
    <div className="flex flex-col">
      {events.map((event, index) => {
        const assigned = event.action === "assigned";
        const Icon = assigned ? CirclePlus : CircleMinus;
        const isLast = index === events.length - 1;
        return (
          <div key={event.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full",
                  assigned
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                    : "bg-muted text-muted-foreground",
                )}
              >
                <Icon className="size-3.5" />
              </span>
              {!isLast && <span className="w-px flex-1 bg-border" />}
            </div>
            <div className={cn("flex flex-col gap-0.5", isLast ? "pb-0.5" : "pb-5")}>
              <p className="pt-0.5 text-sm font-medium text-foreground">
                {assigned ? "Assigned" : "Freed up"}{" "}
                <span className="font-normal text-muted-foreground">
                  {assigned ? "to" : "from"} {event.flatLabel}
                </span>
              </p>
              <p className="text-xs text-muted-foreground">
                <span className="font-mono tabular-nums">{event.vehicleReg}</span> ·{" "}
                {event.residentName}
              </p>
              <p className="text-[11px] text-muted-foreground/80">
                {formatDateTime(event.timestamp)} · by {event.actorName}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AssignForm({
  slot,
  assignedRegs,
  onAssign,
}: {
  slot: ParkingSlotRecord;
  assignedRegs: Set<string>;
  onAssign: (flatId: string, flatLabel: string, vehicleReg: string, residentName: string) => void;
}) {
  const [flatId, setFlatId] = React.useState<string>("");
  const [vehicleReg, setVehicleReg] = React.useState<string>("");

  const vehiclesForFlat = React.useMemo(() => {
    if (!flatId) return [];
    const seen = new Set<string>();
    return flatVehicleHistory.filter((v) => {
      if (v.flatId !== flatId || seen.has(v.registrationNumber)) return false;
      seen.add(v.registrationNumber);
      return !assignedRegs.has(v.registrationNumber);
    });
  }, [flatId, assignedRegs]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${slot.id}-flat`} className="text-xs text-muted-foreground">
          Flat
        </Label>
        <Select
          value={flatId}
          onValueChange={(value) => {
            setFlatId(value ?? "");
            setVehicleReg("");
          }}
        >
          <SelectTrigger id={`${slot.id}-flat`} className="w-full">
            <SelectValue placeholder="Select a flat">
              {(value: string) => flatLabelById.get(value) ?? "Select a flat"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {flats.map((flat) => (
              <SelectItem key={flat.id} value={flat.id}>
                {flat.tower}-{flat.flatNumber}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${slot.id}-vehicle`} className="text-xs text-muted-foreground">
          Vehicle
        </Label>
        <Select
          value={vehicleReg}
          onValueChange={(value) => setVehicleReg(value ?? "")}
          disabled={!flatId || vehiclesForFlat.length === 0}
        >
          <SelectTrigger id={`${slot.id}-vehicle`} className="w-full">
            <SelectValue placeholder={flatId ? "Select a vehicle" : "Select a flat first"}>
              {(value: string) => {
                const v = vehiclesForFlat.find((veh) => veh.registrationNumber === value);
                return v ? `${v.registrationNumber} · ${v.make} ${v.model}` : "Select a vehicle";
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {vehiclesForFlat.map((v) => (
              <SelectItem key={v.registrationNumber} value={v.registrationNumber}>
                {v.registrationNumber} · {v.make} {v.model}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {flatId && vehiclesForFlat.length === 0 && (
        <p className="text-xs text-muted-foreground">
          Every vehicle for this flat is already parked elsewhere, or none are registered.
        </p>
      )}
      <Button
        size="sm"
        className="gap-1.5"
        disabled={!flatId || !vehicleReg}
        onClick={() => {
          const vehicle = vehiclesForFlat.find((v) => v.registrationNumber === vehicleReg);
          if (!vehicle) return;
          onAssign(
            vehicle.flatId,
            flatLabelById.get(vehicle.flatId) ?? vehicle.flatId,
            vehicle.registrationNumber,
            vehicle.ownerName,
          );
          setFlatId("");
          setVehicleReg("");
        }}
      >
        <CirclePlus className="size-3.5" />
        Assign slot
      </Button>
    </div>
  );
}

const tableColumns: ColumnDef<HubSlotRow>[] = [
  {
    id: "slot",
    accessorKey: "slotNumber",
    header: ({ column }) => (
      <DataTableColumnHeader
        icon={SquareParking}
        label="Slot"
        sorted={column.getIsSorted()}
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2.5">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <SquareParking className="size-3.5" />
        </span>
        <span className="flex flex-col">
          <span className="font-mono text-sm font-semibold text-foreground">
            {row.original.slotNumber}
          </span>
          <span className="text-xs text-muted-foreground">{row.original.zone}</span>
        </span>
      </div>
    ),
  },
  {
    id: "vehicle",
    accessorKey: "vehicleReg",
    meta: { label: "Vehicle" },
    header: () => <DataTableColumnHeader icon={Car} label="Vehicle" />,
    cell: ({ row }) =>
      row.original.vehicleReg ? (
        <span className="font-mono text-xs font-medium tabular-nums text-foreground">
          {row.original.vehicleReg}
        </span>
      ) : (
        <span className="text-sm text-muted-foreground">—</span>
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
    id: "status",
    accessorKey: "status",
    meta: { label: "Status" },
    header: () => <DataTableColumnHeader icon={SquareParking} label="Status" />,
    cell: ({ row }) =>
      row.original.status === "allotted" ? (
        <Badge
          variant="outline"
          className="border-emerald-200 text-emerald-700 dark:border-emerald-800 dark:text-emerald-400"
        >
          Allotted
        </Badge>
      ) : (
        <Badge variant="outline" className="text-muted-foreground">
          Unassigned
        </Badge>
      ),
  },
];

function ParkingPageInner() {
  const searchParams = useSearchParams();
  const deepLinkedSlot = searchParams.get("slot");

  const [slots, setSlots] = React.useState<ParkingSlotRecord[]>(parkingSlots);
  const [events, setEvents] = React.useState<ParkingSlotEvent[]>(parkingSlotEvents);
  const [view, setView] = React.useState<"map" | "table">("map");
  const [createOpen, setCreateOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = React.useState<TypeFilter>("all");
  const [selectedSlotId, setSelectedSlotId] = React.useState<string | null>(() => {
    const param = deepLinkedSlot?.trim().toLowerCase();
    if (!param) return null;
    return parkingSlots.find((s) => s.slotNumber.toLowerCase() === param)?.id ?? null;
  });

  const selectedSlot = slots.find((s) => s.id === selectedSlotId) ?? null;
  const slotEvents = React.useMemo(
    () =>
      events
        .filter((e) => e.slotId === selectedSlotId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    [events, selectedSlotId],
  );

  const assignedRegs = React.useMemo(
    () =>
      new Set(
        slots
          .filter((s) => s.id !== selectedSlotId && s.assignment)
          .map((s) => (s.assignment ? s.assignment.vehicleReg : "")),
      ),
    [slots, selectedSlotId],
  );

  const occupiedCount = slots.filter((s) => s.assignment).length;

  const filteredSlots = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return slots.filter((slot) => {
      if (statusFilter === "occupied" && !slot.assignment) return false;
      if (statusFilter === "vacant" && slot.assignment) return false;
      if (typeFilter !== "all" && slot.vehicleType !== typeFilter) return false;
      if (!q) return true;
      return (
        slot.slotNumber.toLowerCase().includes(q) ||
        slot.zone.toLowerCase().includes(q) ||
        (slot.assignment?.vehicleReg ?? "").toLowerCase().includes(q) ||
        (slot.assignment?.flatLabel ?? "").toLowerCase().includes(q) ||
        (slot.assignment?.residentName ?? "").toLowerCase().includes(q)
      );
    });
  }, [slots, query, statusFilter, typeFilter]);

  const groupedZones = React.useMemo(() => {
    const groups = new Map<string, ParkingSlotRecord[]>();
    for (const slot of filteredSlots) {
      const list = groups.get(slot.zone) ?? [];
      list.push(slot);
      groups.set(slot.zone, list);
    }
    return [...groups.entries()].map(([zone, zoneSlots]) => ({
      zone,
      zoneSlots: [...zoneSlots].sort((a, b) => a.slotNumber.localeCompare(b.slotNumber)),
    }));
  }, [filteredSlots]);

  const tableRows = React.useMemo(() => filteredSlots.map(toRow), [filteredSlots]);

  const tableFilters = React.useMemo<DataTableFilterConfig<HubSlotRow>[]>(
    () => [
      {
        id: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "Allotted", value: "allotted" },
          { label: "Unassigned", value: "unassigned" },
        ],
        predicate: (row, value) => row.status === value,
      },
    ],
    [],
  );

  function handleAssign(
    flatId: string,
    flatLabel: string,
    vehicleReg: string,
    residentName: string,
  ) {
    if (!selectedSlot) return;
    const timestamp = new Date().toISOString();
    setSlots((prev) =>
      prev.map((s) =>
        s.id === selectedSlot.id
          ? { ...s, assignment: { flatId, flatLabel, vehicleReg, residentName } }
          : s,
      ),
    );
    setEvents((prev) => [
      ...prev,
      {
        id: `evt-${selectedSlot.id}-${Date.now()}`,
        slotId: selectedSlot.id,
        action: "assigned",
        flatLabel,
        vehicleReg,
        residentName,
        actorName: "Society Manager",
        timestamp,
      },
    ]);
  }

  function handleDeassign() {
    if (!selectedSlot?.assignment) return;
    const { flatLabel, vehicleReg, residentName } = selectedSlot.assignment;
    const timestamp = new Date().toISOString();
    setSlots((prev) =>
      prev.map((s) => (s.id === selectedSlot.id ? { ...s, assignment: null } : s)),
    );
    setEvents((prev) => [
      ...prev,
      {
        id: `evt-${selectedSlot.id}-${Date.now()}`,
        slotId: selectedSlot.id,
        action: "deassigned",
        flatLabel,
        vehicleReg,
        residentName,
        actorName: "Society Manager",
        timestamp,
      },
    ]);
  }

  function handleCreateSlot(values: AddParkingSlotInput) {
    const slotNumber = values.slotNumber.trim();
    const newSlot: ParkingSlotRecord = {
      id: `slot-${slotNumber.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
      slotNumber,
      zone: values.zone.trim(),
      vehicleType: values.vehicleType,
      assignment: null,
    };
    setSlots((prev) => [...prev, newSlot]);
    setCreateOpen(false);
  }

  const [assignmentFrom, assignmentTo] = selectedSlot?.assignment
    ? gradientForName(selectedSlot.assignment.residentName)
    : ["", ""];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Parking</h1>
          <p className="text-sm text-muted-foreground">
            {occupiedCount} of {slots.length} slots allotted — pick a slot to see who&apos;s parked
            and its full assignment history.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" className="gap-1.5" onClick={() => setCreateOpen(true)}>
            <Plus className="size-3.5" />
            New slot
          </Button>
          <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
            <Button
              variant={view === "map" ? "secondary" : "ghost"}
              size="sm"
              className="gap-1.5"
              onClick={() => setView("map")}
            >
              <LayoutGrid className="size-3.5" />
              Map
            </Button>
            <Button
              variant={view === "table" ? "secondary" : "ghost"}
              size="sm"
              className="gap-1.5"
              onClick={() => setView("table")}
            >
              <Table2 className="size-3.5" />
              Table
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search slot, vehicle, flat…"
              className="w-64 pl-8"
            />
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
            {(["all", "occupied", "vacant"] as StatusFilter[]).map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "secondary" : "ghost"}
                size="sm"
                className="capitalize"
                onClick={() => setStatusFilter(status)}
              >
                {status}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
            {(["all", "car", "two_wheeler"] as TypeFilter[]).map((type) => (
              <Button
                key={type}
                variant={typeFilter === type ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setTypeFilter(type)}
              >
                {type === "all" ? "All types" : type === "car" ? "Cars" : "Two-wheelers"}
              </Button>
            ))}
          </div>
        </div>
        {view === "map" && (
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm bg-emerald-500" />
              Occupied
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm border border-dashed border-border bg-muted" />
              Vacant
            </span>
          </div>
        )}
      </div>

      {view === "map" ? (
        groupedZones.length === 0 ? (
          <Card>
            <CardContent className="flex h-24 items-center justify-center text-sm text-muted-foreground">
              No slots match your filters.
            </CardContent>
          </Card>
        ) : (
          groupedZones.map(({ zone, zoneSlots }) => (
            <Card key={zone}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <ParkingSquare className="size-4 text-muted-foreground" />
                  {zone}
                  <Badge variant="outline" className="ml-auto font-normal text-muted-foreground">
                    {zoneSlots.filter((s) => s.assignment).length}/{zoneSlots.length} allotted
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-6">
                  {zoneSlots.map((slot) => (
                    <SlotTile
                      key={slot.id}
                      slot={slot}
                      selected={slot.id === selectedSlotId}
                      onSelect={() => setSelectedSlotId(slot.id)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )
      ) : (
        <DataTable
          data={tableRows}
          columns={tableColumns}
          title="Society parking"
          filters={tableFilters}
          showPageSize
          pageSize={8}
          itemLabel="slot"
          emptyMessage="No slots match your filters."
          initialSorting={[{ id: "slot", desc: false }]}
          onRowClick={(row) => setSelectedSlotId(row.id)}
        />
      )}

      <Sheet open={selectedSlot !== null} onOpenChange={(open) => !open && setSelectedSlotId(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          {selectedSlot && (
            <>
              <SheetHeader className="gap-2 pb-0">
                <div className="flex items-center gap-2">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <SquareParking className="size-4" />
                  </span>
                  <div className="flex flex-col">
                    <SheetTitle className="font-mono">{selectedSlot.slotNumber}</SheetTitle>
                    <SheetDescription>
                      {selectedSlot.zone} ·{" "}
                      {selectedSlot.vehicleType === "car" ? "Car slot" : "Two-wheeler slot"}
                    </SheetDescription>
                  </div>
                  {selectedSlot.assignment ? (
                    <Badge className="ml-auto shrink-0 border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
                      Occupied
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="ml-auto shrink-0 text-muted-foreground">
                      Vacant
                    </Badge>
                  )}
                </div>
              </SheetHeader>

              <div className="flex flex-col gap-5 px-4 pb-4">
                <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3.5">
                  <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Current assignment
                  </p>
                  {selectedSlot.assignment ? (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9 shrink-0">
                          <AvatarImage
                            src={avatarUrlForName(selectedSlot.assignment.residentName)}
                            alt={selectedSlot.assignment.residentName}
                          />
                          <AvatarFallback
                            className="text-xs font-semibold text-white"
                            style={{
                              backgroundImage: `linear-gradient(135deg, ${assignmentFrom}, ${assignmentTo})`,
                            }}
                          >
                            {getInitials(selectedSlot.assignment.residentName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex min-w-0 flex-col">
                          <span className="truncate text-sm font-medium text-foreground">
                            {selectedSlot.assignment.residentName}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Home className="size-3 shrink-0" />
                            {selectedSlot.assignment.flatLabel}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 rounded-md bg-muted/60 px-2.5 py-1.5 text-sm">
                        {selectedSlot.vehicleType === "car" ? (
                          <Car className="size-3.5 shrink-0 text-muted-foreground" />
                        ) : (
                          <Bike className="size-3.5 shrink-0 text-muted-foreground" />
                        )}
                        <span className="font-mono text-xs font-medium tabular-nums text-foreground">
                          {selectedSlot.assignment.vehicleReg}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-1.5"
                        onClick={handleDeassign}
                      >
                        <CircleMinus className="size-3.5" />
                        Deassign slot
                      </Button>
                    </div>
                  ) : (
                    <AssignForm
                      key={selectedSlot.id}
                      slot={selectedSlot}
                      assignedRegs={assignedRegs}
                      onAssign={handleAssign}
                    />
                  )}
                </div>

                <Separator />

                <div className="flex flex-col gap-4">
                  <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    <UserRound className="size-3 shrink-0" />
                    History · {slotEvents.length}
                  </p>
                  <SlotTimeline events={slotEvents} />
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New parking slot</DialogTitle>
            <DialogDescription>Add a physical slot to the society parking map.</DialogDescription>
          </DialogHeader>
          <CreateParkingSlotForm
            key={String(createOpen)}
            onSave={handleCreateSlot}
            onCancel={() => setCreateOpen(false)}
            existingSlotNumbers={slots.map((s) => s.slotNumber)}
            existingZones={[...new Set(slots.map((s) => s.zone))]}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function PeopleHubParkingPage() {
  return (
    <React.Suspense fallback={null}>
      <ParkingPageInner />
    </React.Suspense>
  );
}
