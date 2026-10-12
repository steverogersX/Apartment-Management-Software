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
  Motorbike,
  ParkingSquare,
  Plus,
  Search,
  SquareParking,
  Table2,
  UserRound,
  X,
} from "lucide-react";

import { avatarUrlForName, cn, formatDateTime, getInitials, gradientForName } from "@/lib/utils";
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
import { FlatSelect } from "@/components/flats/flatSelect";
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
import { residents } from "@/lib/residentsMockData";
import {
  parkingSlotEvents,
  parkingSlots,
  type AddParkingSlotInput,
  type ParkingSlotAssignment,
  type ParkingSlotEvent,
  type ParkingSlotRecord,
  type ParkingVehicleType,
} from "@/lib/parkingMockData";
import { useToast } from "@/components/ui/toast";
import { PageIcon } from "@/components/pageIcon";

type OccupancyStatus = "full" | "partial" | "vacant";
type StatusFilter = "all" | "occupied" | "vacant";
type TypeFilter = "all" | ParkingVehicleType;

const VEHICLE_ICON: Record<ParkingVehicleType, typeof Car> = {
  car: Car,
  two_wheeler: Motorbike,
  cycle: Bike,
};

const VEHICLE_LABEL: Record<ParkingVehicleType, string> = {
  car: "Car",
  two_wheeler: "Two-wheeler",
  cycle: "Cycle",
};

const VEHICLE_ACCENT: Record<ParkingVehicleType, string> = {
  car: "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900 dark:bg-sky-950/50 dark:text-sky-300",
  two_wheeler:
    "border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-900 dark:bg-violet-950/50 dark:text-violet-300",
  cycle:
    "border-teal-200 bg-teal-50 text-teal-800 dark:border-teal-900 dark:bg-teal-950/50 dark:text-teal-300",
};

function occupancyOf(slot: ParkingSlotRecord): OccupancyStatus {
  if (slot.assignments.length === 0) return "vacant";
  if (slot.assignments.length >= slot.capacity) return "full";
  return "partial";
}

type HubSlotRow = {
  id: string;
  slotNumber: string;
  zone: string;
  capacity: number;
  occupancy: OccupancyStatus;
  vehicleTypes: ParkingVehicleType[];
  vehicles: { type: ParkingVehicleType; reg: string | null }[];
  flatLabel: string;
};

function toRow(slot: ParkingSlotRecord): HubSlotRow {
  return {
    id: slot.id,
    slotNumber: slot.slotNumber,
    zone: slot.zone,
    capacity: slot.capacity,
    occupancy: occupancyOf(slot),
    vehicleTypes: slot.assignments.map((a) => a.vehicleType),
    vehicles: slot.assignments.map((a) => ({ type: a.vehicleType, reg: a.vehicleReg })),
    flatLabel:
      slot.assignments.length === 0
        ? "—"
        : [...new Set(slot.assignments.map((a) => a.flatLabel))].join(", "),
  };
}

const flatLabelById = new Map(flats.map((f) => [f.id, `${f.tower}-${f.flatNumber}`]));

function residentNameForFlat(flatId: string): string {
  const resident = residents.find((r) => r.flatId === flatId);
  if (resident) return resident.name;
  const flat = flats.find((f) => f.id === flatId);
  return flat?.owner?.name ?? "Resident";
}

function OccupancyBadge({ status }: { status: OccupancyStatus }) {
  if (status === "full") {
    return (
      <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
        Full
      </Badge>
    );
  }
  if (status === "partial") {
    return (
      <Badge className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400">
        Partial
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-muted-foreground">
      Vacant
    </Badge>
  );
}

function SlotTile({
  slot,
  selected,
  onSelect,
}: {
  slot: ParkingSlotRecord;
  selected: boolean;
  onSelect: () => void;
}) {
  const status = occupancyOf(slot);
  const types = [...new Set(slot.assignments.map((a) => a.vehicleType))];
  const vehicleTitle = slot.assignments
    .map((a) => `${VEHICLE_LABEL[a.vehicleType]}: ${a.vehicleReg ?? "no reg"}`)
    .join(" · ");
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      title={vehicleTitle || undefined}
      className={cn(
        "group relative flex min-h-[5.5rem] cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border px-2 py-3 text-center transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none",
        status === "full" &&
          "border-emerald-300 bg-emerald-50 hover:border-emerald-400 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/70",
        status === "partial" &&
          "border-amber-300 bg-amber-50 hover:border-amber-400 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/40 dark:hover:bg-amber-950/70",
        status === "vacant" &&
          "border-dashed border-border bg-muted/30 hover:border-foreground/30 hover:bg-muted",
        selected && "ring-2 ring-ring ring-offset-2 ring-offset-background",
      )}
    >
      <span className="absolute top-1.5 right-1.5 flex items-center gap-1">
        {types.length === 0 ? (
          <SquareParking className="size-3 text-muted-foreground/60 group-hover:text-muted-foreground" />
        ) : (
          types.map((t) => {
            const Icon = VEHICLE_ICON[t];
            return (
              <span
                key={t}
                className={cn(
                  "flex size-4 items-center justify-center rounded-sm border",
                  VEHICLE_ACCENT[t],
                )}
              >
                <Icon className="size-2.5" />
              </span>
            );
          })
        )}
      </span>
      <span className="font-mono text-sm font-semibold text-foreground">{slot.slotNumber}</span>
      <span
        className={cn(
          "max-w-full truncate text-[11px] font-medium",
          status === "full"
            ? "text-emerald-700 dark:text-emerald-400"
            : status === "partial"
              ? "text-amber-700 dark:text-amber-400"
              : "text-muted-foreground",
        )}
      >
        {slot.assignments.length === 0
          ? "Vacant"
          : `${slot.assignments.length}/${slot.capacity} · ${[...new Set(slot.assignments.map((a) => a.flatLabel))].join(", ")}`}
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
                {event.vehicleType && (
                  <span className="font-normal text-muted-foreground">
                    {" "}
                    · {VEHICLE_LABEL[event.vehicleType]}
                  </span>
                )}
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
  onAssign: (
    flatId: string,
    flatLabel: string,
    vehicleType: ParkingVehicleType,
    vehicleReg: string | null,
    residentName: string,
  ) => void;
}) {
  const [flatId, setFlatId] = React.useState<string>("");
  const [vehicleType, setVehicleType] = React.useState<ParkingVehicleType>("car");
  const [vehicleReg, setVehicleReg] = React.useState<string>("");

  const vehiclesForFlat = React.useMemo(() => {
    if (!flatId || vehicleType === "cycle") return [];
    const seen = new Set<string>();
    return flatVehicleHistory.filter((v) => {
      if (v.flatId !== flatId || v.type !== vehicleType || seen.has(v.registrationNumber))
        return false;
      seen.add(v.registrationNumber);
      return !assignedRegs.has(v.registrationNumber);
    });
  }, [flatId, vehicleType, assignedRegs]);

  const canAssign = vehicleType === "cycle" ? !!flatId : !!flatId && !!vehicleReg;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${slot.id}-flat`} className="text-xs text-muted-foreground">
          Flat
        </Label>
        <FlatSelect
          id={`${slot.id}-flat`}
          flats={flats}
          value={flatId}
          onValueChange={(value) => {
            setFlatId(value);
            setVehicleReg("");
          }}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground">Vehicle type</Label>
        <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
          {(["car", "two_wheeler", "cycle"] as ParkingVehicleType[]).map((t) => (
            <Button
              key={t}
              type="button"
              variant={vehicleType === t ? "secondary" : "ghost"}
              size="sm"
              className="flex-1 gap-1.5"
              onClick={() => {
                setVehicleType(t);
                setVehicleReg("");
              }}
            >
              {VEHICLE_LABEL[t]}
            </Button>
          ))}
        </div>
      </div>

      {vehicleType === "cycle" ? (
        <p className="text-xs text-muted-foreground">
          Cycles aren't registered vehicles — this just reserves the space for{" "}
          {flatId ? residentNameForFlat(flatId) : "the resident"}.
        </p>
      ) : (
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
          {flatId && vehiclesForFlat.length === 0 && (
            <p className="text-xs text-muted-foreground">
              Every {VEHICLE_LABEL[vehicleType].toLowerCase()} for this flat is already parked
              elsewhere, or none are registered.
            </p>
          )}
        </div>
      )}

      <Button
        size="sm"
        className="gap-1.5"
        disabled={!canAssign}
        onClick={() => {
          if (vehicleType === "cycle") {
            onAssign(
              flatId,
              flatLabelById.get(flatId) ?? flatId,
              "cycle",
              null,
              residentNameForFlat(flatId),
            );
          } else {
            const vehicle = vehiclesForFlat.find((v) => v.registrationNumber === vehicleReg);
            if (!vehicle) return;
            onAssign(
              vehicle.flatId,
              flatLabelById.get(vehicle.flatId) ?? vehicle.flatId,
              vehicleType,
              vehicle.registrationNumber,
              vehicle.ownerName,
            );
          }
          setFlatId("");
          setVehicleReg("");
        }}
      >
        <CirclePlus className="size-3.5" />
        Park here
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
          <span className="text-xs text-muted-foreground">
            {row.original.zone} · fits {row.original.capacity}
          </span>
        </span>
      </div>
    ),
  },
  {
    id: "vehicle",
    accessorFn: (row) => row.vehicles.map((v) => v.reg ?? v.type).join(", "),
    meta: { label: "Vehicles" },
    header: () => <DataTableColumnHeader icon={Car} label="Vehicles" />,
    cell: ({ row }) =>
      row.original.vehicles.length === 0 ? (
        <span className="text-sm text-muted-foreground">—</span>
      ) : (
        <div className="flex flex-wrap gap-1">
          {row.original.vehicles.map((v, i) => {
            const Icon = VEHICLE_ICON[v.type];
            return (
              <span
                key={i}
                className={cn(
                  "flex items-center gap-1 rounded-md border px-1.5 py-0.5",
                  VEHICLE_ACCENT[v.type],
                )}
              >
                <Icon className="size-3" />
                <span className="font-mono text-[11px] font-bold tabular-nums">
                  {v.reg ?? VEHICLE_LABEL[v.type]}
                </span>
              </span>
            );
          })}
        </div>
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
    accessorKey: "occupancy",
    meta: { label: "Status" },
    header: () => <DataTableColumnHeader icon={SquareParking} label="Status" />,
    cell: ({ row }) => <OccupancyBadge status={row.original.occupancy} />,
  },
];

function ParkingPageInner() {
  const { toast } = useToast();
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
          .filter((s) => s.id !== selectedSlotId)
          .flatMap((s) => s.assignments.map((a) => a.vehicleReg ?? "").filter(Boolean)),
      ),
    [slots, selectedSlotId],
  );

  const occupiedSlotCount = slots.filter((s) => s.assignments.length > 0).length;
  const totalVehicleCount = slots.reduce((sum, s) => sum + s.assignments.length, 0);

  const filteredSlots = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return slots.filter((slot) => {
      const occupied = slot.assignments.length > 0;
      if (statusFilter === "occupied" && !occupied) return false;
      if (statusFilter === "vacant" && occupied) return false;
      if (typeFilter !== "all" && !slot.assignments.some((a) => a.vehicleType === typeFilter))
        return false;
      if (!q) return true;
      return (
        slot.slotNumber.toLowerCase().includes(q) ||
        slot.zone.toLowerCase().includes(q) ||
        slot.assignments.some(
          (a) =>
            (a.vehicleReg ?? "").toLowerCase().includes(q) ||
            a.flatLabel.toLowerCase().includes(q) ||
            a.residentName.toLowerCase().includes(q),
        )
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
          { label: "Full", value: "full" },
          { label: "Partial", value: "partial" },
          { label: "Vacant", value: "vacant" },
        ],
        predicate: (row, value) => row.occupancy === value,
      },
    ],
    [],
  );

  function handleAssign(
    flatId: string,
    flatLabel: string,
    vehicleType: ParkingVehicleType,
    vehicleReg: string | null,
    residentName: string,
  ) {
    if (!selectedSlot) return;
    const timestamp = new Date().toISOString();
    const assignment: ParkingSlotAssignment = {
      id: `asn-${selectedSlot.id}-${Date.now()}`,
      flatId,
      flatLabel,
      vehicleType,
      vehicleReg,
      residentName,
    };
    setSlots((prev) =>
      prev.map((s) =>
        s.id === selectedSlot.id ? { ...s, assignments: [...s.assignments, assignment] } : s,
      ),
    );
    setEvents((prev) => [
      ...prev,
      {
        id: `evt-${selectedSlot.id}-${Date.now()}`,
        slotId: selectedSlot.id,
        action: "assigned",
        flatLabel,
        vehicleType,
        vehicleReg: vehicleReg ?? "—",
        residentName,
        actorName: "Society Manager",
        timestamp,
      },
    ]);
    toast({ title: "Vehicle assigned to slot" });
  }

  function handleDeassign(assignmentId: string) {
    if (!selectedSlot) return;
    const assignment = selectedSlot.assignments.find((a) => a.id === assignmentId);
    if (!assignment) return;
    const timestamp = new Date().toISOString();
    setSlots((prev) =>
      prev.map((s) =>
        s.id === selectedSlot.id
          ? { ...s, assignments: s.assignments.filter((a) => a.id !== assignmentId) }
          : s,
      ),
    );
    setEvents((prev) => [
      ...prev,
      {
        id: `evt-${selectedSlot.id}-${Date.now()}`,
        slotId: selectedSlot.id,
        action: "deassigned",
        flatLabel: assignment.flatLabel,
        vehicleType: assignment.vehicleType,
        vehicleReg: assignment.vehicleReg ?? "—",
        residentName: assignment.residentName,
        actorName: "Society Manager",
        timestamp,
      },
    ]);
    toast({ title: "Vehicle removed from slot", variant: "info" });
  }

  function handleCreateSlot(values: AddParkingSlotInput) {
    const slotNumber = values.slotNumber.trim();
    const newSlot: ParkingSlotRecord = {
      id: `slot-${slotNumber.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
      slotNumber,
      zone: values.zone.trim(),
      capacity: values.capacity,
      assignments: [],
    };
    setSlots((prev) => [...prev, newSlot]);
    setCreateOpen(false);
    toast({ title: "Parking slot created" });
  }

  const spaceLeft = selectedSlot ? selectedSlot.capacity - selectedSlot.assignments.length : 0;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground">
            <PageIcon />
            Parking
          </h1>
          <p className="text-sm text-muted-foreground">
            {totalVehicleCount} vehicles parked across {occupiedSlotCount} of {slots.length} slots —
            a slot can hold more than one vehicle. Pick a slot to see who&apos;s parked and its full
            history.
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
            {(["all", "car", "two_wheeler", "cycle"] as TypeFilter[]).map((type) => (
              <Button
                key={type}
                variant={typeFilter === type ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setTypeFilter(type)}
              >
                {type === "all" ? "All types" : VEHICLE_LABEL[type]}
              </Button>
            ))}
          </div>
        </div>
        {view === "map" && (
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm bg-emerald-500" />
              Full
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm bg-amber-500" />
              Partial
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
                    {zoneSlots.filter((s) => s.assignments.length > 0).length}/{zoneSlots.length}{" "}
                    occupied
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
                      {selectedSlot.zone} · fits {selectedSlot.capacity} vehicle
                      {selectedSlot.capacity > 1 ? "s" : ""}
                    </SheetDescription>
                  </div>
                  <span className="ml-auto shrink-0">
                    <OccupancyBadge status={occupancyOf(selectedSlot)} />
                  </span>
                </div>
              </SheetHeader>

              <div className="flex flex-col gap-5 px-4 pb-4">
                <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      Parked here · {selectedSlot.assignments.length}/{selectedSlot.capacity}
                    </p>
                  </div>

                  {selectedSlot.assignments.length > 0 && (
                    <div className="flex flex-col gap-3">
                      {selectedSlot.assignments.map((assignment) => {
                        const VehicleIcon = VEHICLE_ICON[assignment.vehicleType];
                        return (
                          <div
                            key={assignment.id}
                            className={cn(
                              "flex items-center gap-3 rounded-lg border p-2.5",
                              VEHICLE_ACCENT[assignment.vehicleType],
                            )}
                          >
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-background/70">
                              <VehicleIcon className="size-5" />
                            </span>
                            <div className="flex min-w-0 flex-1 flex-col">
                              <span className="truncate font-mono text-sm font-bold tabular-nums">
                                {assignment.vehicleReg ?? VEHICLE_LABEL[assignment.vehicleType]}
                              </span>
                              <span className="text-[11px] font-semibold tracking-wide uppercase opacity-80">
                                {VEHICLE_LABEL[assignment.vehicleType]}
                              </span>
                              <span className="mt-1.5 flex items-center gap-1 text-xs opacity-80">
                                <Avatar size="sm" className="size-4">
                                  <AvatarImage
                                    src={avatarUrlForName(assignment.residentName)}
                                    alt={assignment.residentName}
                                  />
                                  <AvatarFallback className="text-[8px]">
                                    {getInitials(assignment.residentName)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="truncate">{assignment.residentName}</span>
                                <Home className="size-3 shrink-0" />
                                {assignment.flatLabel}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              className="shrink-0 hover:bg-background/70"
                              aria-label="Remove from slot"
                              onClick={() => handleDeassign(assignment.id)}
                            >
                              <X className="size-3.5" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {spaceLeft > 0 ? (
                    <>
                      {selectedSlot.assignments.length > 0 && <Separator />}
                      <p className="text-xs text-muted-foreground">
                        {selectedSlot.assignments.length === 0
                          ? "Park a vehicle in this slot."
                          : `Room for ${spaceLeft} more vehicle${spaceLeft > 1 ? "s" : ""}.`}
                      </p>
                      <AssignForm
                        key={`${selectedSlot.id}-${selectedSlot.assignments.length}`}
                        slot={selectedSlot}
                        assignedRegs={assignedRegs}
                        onAssign={handleAssign}
                      />
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      This slot is full. Remove a vehicle to park another.
                    </p>
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
