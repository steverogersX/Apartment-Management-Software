"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import {
  ArrowRight,
  Bike,
  Car,
  CircleMinus,
  CirclePlus,
  History,
  Home,
  KeyRound,
  LayoutGrid,
  LogOut,
  Motorbike,
  ParkingSquare,
  Plus,
  Search,
  SquareParking,
  Table2,
  TriangleAlert,
  X,
} from "lucide-react";

import { avatarUrlForName, cn, formatDate, formatDateTime, getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/dataTable";
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
import { flats, flatVehicleHistory, type FlatVehicleEntry } from "@/lib/flatsMockData";
import { residents } from "@/lib/residentsMockData";
import {
  PARKING_BAYS,
  PARKING_VEHICLE_TYPES,
  parkingSlotEvents,
  parkingSlots,
  roomFor,
  type AddParkingSlotInput,
  type ParkedVehicle,
  type ParkingSlotAction,
  type ParkingSlotEvent,
  type ParkingSlotRecord,
  type ParkingVehicleType,
} from "@/lib/parkingMockData";
import { useToast } from "@/components/ui/toast";
import { PageIcon } from "@/components/pageIcon";
import { useAuth } from "@/hooks/useAuth";
import { recordAudit } from "@/lib/auditLog";

type StatusFilter = "all" | "allotted" | "available";
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

const EVENT_META: Record<ParkingSlotAction, { icon: typeof Car; label: string; tone: string }> = {
  allotted: {
    icon: KeyRound,
    label: "Allotted to",
    tone: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-400",
  },
  released: {
    icon: LogOut,
    label: "Released by",
    tone: "bg-muted text-muted-foreground",
  },
  vehicle_added: {
    icon: CirclePlus,
    label: "Parked",
    tone: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  },
  vehicle_removed: {
    icon: CircleMinus,
    label: "Removed",
    tone: "bg-muted text-muted-foreground",
  },
};

const flatById = new Map(flats.map((f) => [f.id, f]));

function flatLabelFor(flatId: string) {
  const flat = flatById.get(flatId);
  return flat ? `${flat.tower}-${flat.flatNumber}` : flatId;
}

function residentNameForFlat(flatId: string): string {
  const resident = residents.find((r) => r.flatId === flatId);
  if (resident) return resident.name;
  return flatById.get(flatId)?.owner?.name ?? "Resident";
}

function vehicleName(v: Pick<ParkedVehicle, "type" | "reg">) {
  return v.reg ?? VEHICLE_LABEL[v.type];
}

function VehicleChip({ vehicle }: { vehicle: Pick<ParkedVehicle, "type" | "reg"> }) {
  const Icon = VEHICLE_ICON[vehicle.type];
  return (
    <span
      className={cn(
        "flex w-fit items-center gap-1 rounded-md border px-1.5 py-0.5",
        VEHICLE_ACCENT[vehicle.type],
      )}
    >
      <Icon className="size-3" />
      <span className="font-mono text-[11px] font-bold tabular-nums">{vehicleName(vehicle)}</span>
    </span>
  );
}

function StatusBadge({ slot }: { slot: ParkingSlotRecord }) {
  return slot.allotment ? (
    <Badge className="border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-400">
      Allotted
    </Badge>
  ) : (
    <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
      Available
    </Badge>
  );
}

function SpaceMeter({ slot }: { slot: ParkingSlotRecord }) {
  const fits = PARKING_BAYS[slot.bay].fits;
  return (
    <div className="flex flex-wrap gap-1.5">
      {PARKING_VEHICLE_TYPES.filter((t) => fits[t] > 0).map((t) => {
        const Icon = VEHICLE_ICON[t];
        const used = fits[t] - roomFor(slot, t);
        return (
          <span
            key={t}
            className={cn(
              "flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs",
              used > 0 ? VEHICLE_ACCENT[t] : "border-dashed border-border text-muted-foreground",
            )}
          >
            <Icon className="size-3.5" />
            {VEHICLE_LABEL[t]}
            <span className="font-semibold tabular-nums">
              {used}/{fits[t]}
            </span>
          </span>
        );
      })}
    </div>
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
  const allotted = slot.allotment !== null;
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "flex min-h-[6.5rem] cursor-pointer flex-col gap-1.5 rounded-lg border p-2.5 text-left transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none",
        allotted
          ? "border-border bg-card hover:border-foreground/30 hover:bg-muted/40"
          : "border-dashed border-emerald-300 bg-emerald-50/50 hover:border-emerald-400 hover:bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40",
        selected && "ring-2 ring-ring ring-offset-2 ring-offset-background",
      )}
    >
      <span className="flex items-center justify-between gap-1">
        <span className="font-mono text-sm font-semibold text-foreground">{slot.slotNumber}</span>
        <span className="truncate text-[10px] text-muted-foreground">
          {PARKING_BAYS[slot.bay].label}
        </span>
      </span>
      {slot.allotment ? (
        <>
          <span className="flex items-center gap-1 text-xs font-medium text-foreground">
            <Home className="size-3 shrink-0 text-muted-foreground" />
            {slot.allotment.flatLabel}
          </span>
          <span className="mt-auto flex flex-wrap gap-1">
            {slot.vehicles.length === 0 ? (
              <span className="text-[11px] text-muted-foreground">No vehicles yet</span>
            ) : (
              slot.vehicles.map((v) => {
                const Icon = VEHICLE_ICON[v.type];
                return (
                  <span
                    key={v.id}
                    title={`${VEHICLE_LABEL[v.type]} · ${vehicleName(v)}`}
                    className={cn(
                      "flex size-5 items-center justify-center rounded border",
                      VEHICLE_ACCENT[v.type],
                    )}
                  >
                    <Icon className="size-3" />
                  </span>
                );
              })
            )}
          </span>
        </>
      ) : (
        <span className="mt-auto text-xs font-medium text-emerald-700 dark:text-emerald-400">
          Available
        </span>
      )}
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
        const meta = EVENT_META[event.action];
        const Icon = meta.icon;
        const isLast = index === events.length - 1;
        return (
          <div key={event.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full",
                  meta.tone,
                )}
              >
                <Icon className="size-3.5" />
              </span>
              {!isLast && <span className="w-px flex-1 bg-border" />}
            </div>
            <div className={cn("flex flex-col gap-0.5", isLast ? "pb-0.5" : "pb-5")}>
              <p className="pt-0.5 text-sm font-medium text-foreground">
                {meta.label}{" "}
                <span className="font-normal text-muted-foreground">
                  {event.vehicle
                    ? `${vehicleName(event.vehicle)} · ${VEHICLE_LABEL[event.vehicle.type]}`
                    : event.flatLabel}
                </span>
              </p>
              <p className="text-xs text-muted-foreground">
                {event.vehicle
                  ? `${event.vehicle.ownerName} · ${event.flatLabel}`
                  : event.personName}
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

function AllotForm({
  slots,
  onAllot,
  onSelectSlot,
}: {
  slots: ParkingSlotRecord[];
  onAllot: (flatId: string) => void;
  onSelectSlot: (slotId: string) => void;
}) {
  const [flatId, setFlatId] = React.useState("");
  const existing = flatId ? slots.filter((s) => s.allotment?.flatId === flatId) : [];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="allot-flat" className="text-xs text-muted-foreground">
          Flat
        </Label>
        <FlatSelect id="allot-flat" flats={flats} value={flatId} onValueChange={setFlatId} />
      </div>
      {existing.length > 0 && (
        <p className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
          {flatLabelFor(flatId)} already has
          {existing.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelectSlot(s.id)}
              className="font-mono font-semibold text-foreground underline-offset-2 hover:underline"
            >
              {s.slotNumber}
            </button>
          ))}
        </p>
      )}
      <Button size="sm" className="gap-1.5" disabled={!flatId} onClick={() => onAllot(flatId)}>
        <KeyRound className="size-3.5" />
        Allot to flat
      </Button>
    </div>
  );
}

function AddVehicleForm({
  slot,
  unparked,
  onAdd,
}: {
  slot: ParkingSlotRecord;
  unparked: FlatVehicleEntry[];
  onAdd: (vehicle: Omit<ParkedVehicle, "id">) => void;
}) {
  const fits = PARKING_BAYS[slot.bay].fits;
  const types = PARKING_VEHICLE_TYPES.filter((t) => fits[t] > 0);
  const [type, setType] = React.useState<ParkingVehicleType>(
    () => types.find((t) => roomFor(slot, t) > 0) ?? types[0] ?? "car",
  );
  const [reg, setReg] = React.useState("");

  const options = unparked.filter((v) => v.type === type);
  const room = roomFor(slot, type);
  const residentName = slot.allotment?.residentName ?? "the resident";

  function submit() {
    if (type === "cycle") {
      onAdd({ type, reg: null, ownerName: residentName });
      return;
    }
    const vehicle = options.find((v) => v.registrationNumber === reg);
    if (vehicle) onAdd({ type, reg: vehicle.registrationNumber, ownerName: vehicle.ownerName });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
        {types.map((t) => {
          const Icon = VEHICLE_ICON[t];
          const full = roomFor(slot, t) === 0;
          return (
            <Button
              key={t}
              type="button"
              variant={type === t ? "secondary" : "ghost"}
              size="sm"
              className="flex-1 gap-1.5"
              disabled={full}
              title={full ? `No room left for a ${VEHICLE_LABEL[t].toLowerCase()}` : undefined}
              onClick={() => {
                setType(t);
                setReg("");
              }}
            >
              <Icon className="size-3.5" />
              {VEHICLE_LABEL[t]}
            </Button>
          );
        })}
      </div>

      {type === "cycle" ? (
        <p className="text-xs text-muted-foreground">
          Cycles aren&apos;t registered — this records a cycle for {residentName}.
        </p>
      ) : options.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          {slot.allotment?.flatLabel} has no other registered {VEHICLE_LABEL[type].toLowerCase()}{" "}
          waiting for a spot. Register it under People Hub → Vehicles first.
        </p>
      ) : (
        <Select value={reg} onValueChange={(value) => setReg(value ?? "")}>
          <SelectTrigger className="w-full" aria-label="Vehicle">
            <SelectValue placeholder="Select a registered vehicle">
              {(value: string) => {
                const v = options.find((o) => o.registrationNumber === value);
                return v ? `${v.registrationNumber} · ${v.make} ${v.model}` : "Select a vehicle";
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {options.map((v) => (
              <SelectItem key={v.registrationNumber} value={v.registrationNumber}>
                {v.registrationNumber} · {v.make} {v.model} · {v.ownerName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Button
        size="sm"
        className="gap-1.5"
        disabled={room === 0 || (type !== "cycle" && !reg)}
        onClick={submit}
      >
        <CirclePlus className="size-3.5" />
        Park {VEHICLE_LABEL[type].toLowerCase()}
      </Button>
    </div>
  );
}

function SlotSheetBody({
  slot,
  slots,
  events,
  unparked,
  onAllot,
  onRelease,
  onAddVehicle,
  onRemoveVehicle,
  onSelectSlot,
}: {
  slot: ParkingSlotRecord;
  slots: ParkingSlotRecord[];
  events: ParkingSlotEvent[];
  unparked: FlatVehicleEntry[];
  onAllot: (flatId: string) => void;
  onRelease: () => void;
  onAddVehicle: (vehicle: Omit<ParkedVehicle, "id">) => void;
  onRemoveVehicle: (vehicleId: string) => void;
  onSelectSlot: (slotId: string) => void;
}) {
  const [confirmRelease, setConfirmRelease] = React.useState(false);
  const allotment = slot.allotment;
  const otherSlots = allotment
    ? slots.filter((s) => s.id !== slot.id && s.allotment?.flatId === allotment.flatId)
    : [];
  const hasRoom = PARKING_VEHICLE_TYPES.some((t) => roomFor(slot, t) > 0);

  return (
    <div className="flex flex-col gap-5 px-4 pb-4">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Space in this bay
        </p>
        <SpaceMeter slot={slot} />
      </div>

      {allotment ? (
        <>
          <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3.5">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage
                  src={avatarUrlForName(allotment.residentName)}
                  alt={allotment.residentName}
                />
                <AvatarFallback className="text-xs">
                  {getInitials(allotment.residentName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium text-foreground">
                  {allotment.residentName}
                </span>
                <span className="text-xs text-muted-foreground">
                  Allotted since {formatDate(allotment.allottedOn)}
                </span>
              </div>
              <Link
                href={`/dashboard/people-hub/flats/${allotment.flatId}`}
                className="flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                <Home className="size-3" />
                {allotment.flatLabel}
                <ArrowRight className="size-3" />
              </Link>
            </div>
            {otherSlots.length > 0 && (
              <p className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                {allotment.flatLabel} also has
                {otherSlots.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => onSelectSlot(s.id)}
                    className="font-mono font-semibold text-foreground underline-offset-2 hover:underline"
                  >
                    {s.slotNumber}
                  </button>
                ))}
              </p>
            )}
            {confirmRelease ? (
              <div className="flex flex-col gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-2.5">
                <p className="text-xs text-foreground">
                  Release {slot.slotNumber} from {allotment.flatLabel}
                  {slot.vehicles.length > 0
                    ? ` and remove its ${slot.vehicles.length} vehicle${slot.vehicles.length > 1 ? "s" : ""}`
                    : ""}
                  ?
                </p>
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setConfirmRelease(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" variant="destructive" onClick={onRelease}>
                    Release slot
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={() => setConfirmRelease(true)}
              >
                <LogOut className="size-3.5" />
                Release slot
              </Button>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Vehicles parked · {slot.vehicles.length}
            </p>
            {slot.vehicles.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border p-3 text-center text-sm text-muted-foreground">
                Nothing parked yet.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {slot.vehicles.map((vehicle) => {
                  const Icon = VEHICLE_ICON[vehicle.type];
                  return (
                    <div
                      key={vehicle.id}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border p-2.5",
                        VEHICLE_ACCENT[vehicle.type],
                      )}
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-background/70">
                        <Icon className="size-4" />
                      </span>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate font-mono text-sm font-bold tabular-nums">
                          {vehicleName(vehicle)}
                        </span>
                        <span className="truncate text-xs opacity-80">
                          {VEHICLE_LABEL[vehicle.type]} · {vehicle.ownerName}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="shrink-0 hover:bg-background/70"
                        aria-label={`Remove ${vehicleName(vehicle)}`}
                        onClick={() => onRemoveVehicle(vehicle.id)}
                      >
                        <X className="size-3.5" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}

            {hasRoom ? (
              <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3.5">
                <p className="text-xs font-medium text-foreground">Park another vehicle</p>
                <AddVehicleForm
                  key={`${slot.id}-${slot.vehicles.length}`}
                  slot={slot}
                  unparked={unparked}
                  onAdd={onAddVehicle}
                />
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                This bay is full. Remove a vehicle to park another.
              </p>
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3.5">
          <div>
            <p className="text-sm font-medium text-foreground">Allot this slot</p>
            <p className="text-xs text-muted-foreground">
              Once a flat holds the slot, park its vehicles here.
            </p>
          </div>
          <AllotForm key={slot.id} slots={slots} onAllot={onAllot} onSelectSlot={onSelectSlot} />
        </div>
      )}

      <Separator />

      <div className="flex flex-col gap-4">
        <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          <History className="size-3 shrink-0" />
          History · {events.length}
        </p>
        <SlotTimeline events={events} />
      </div>
    </div>
  );
}

const tableColumns: ColumnDef<ParkingSlotRecord>[] = [
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
          <span className="text-xs whitespace-nowrap text-muted-foreground">
            {row.original.zone} · {PARKING_BAYS[row.original.bay].label}
          </span>
        </span>
      </div>
    ),
  },
  {
    id: "flat",
    accessorFn: (row) => row.allotment?.flatLabel ?? "",
    meta: { label: "Allotted to" },
    header: ({ column }) => (
      <DataTableColumnHeader
        icon={Home}
        label="Allotted to"
        sorted={column.getIsSorted()}
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      />
    ),
    cell: ({ row }) =>
      row.original.allotment ? (
        <span className="flex flex-col">
          <span className="font-medium text-foreground">{row.original.allotment.flatLabel}</span>
          <span className="text-xs whitespace-nowrap text-muted-foreground">
            {row.original.allotment.residentName}
          </span>
        </span>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    id: "vehicles",
    accessorFn: (row) => row.vehicles.map(vehicleName).join(", "),
    meta: { label: "Vehicles" },
    header: () => <DataTableColumnHeader icon={Car} label="Vehicles" />,
    cell: ({ row }) =>
      row.original.vehicles.length === 0 ? (
        <span className="text-sm text-muted-foreground">—</span>
      ) : (
        <div className="flex flex-wrap gap-1">
          {row.original.vehicles.map((v) => (
            <VehicleChip key={v.id} vehicle={v} />
          ))}
        </div>
      ),
  },
  {
    id: "status",
    accessorFn: (row) => (row.allotment ? "allotted" : "available"),
    meta: { label: "Status" },
    header: () => <DataTableColumnHeader icon={SquareParking} label="Status" />,
    cell: ({ row }) => <StatusBadge slot={row.original} />,
  },
];

function ParkingPageInner() {
  const { user: auditUser } = useAuth();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const deepLinkedSlot = searchParams.get("slot");
  const actorName = auditUser?.displayName ?? "Society Manager";

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

  const unparkedVehicles = React.useMemo(() => {
    const parked = new Set(slots.flatMap((s) => s.vehicles.map((v) => v.reg).filter(Boolean)));
    return flatVehicleHistory.filter((v) => v.isCurrent && !parked.has(v.registrationNumber));
  }, [slots]);

  const unparkedForSelected = React.useMemo(
    () =>
      selectedSlot?.allotment
        ? unparkedVehicles.filter((v) => v.flatId === selectedSlot.allotment?.flatId)
        : [],
    [unparkedVehicles, selectedSlot],
  );

  const allottedCount = slots.filter((s) => s.allotment).length;
  const parkedByType = PARKING_VEHICLE_TYPES.map((t) => ({
    type: t,
    count: slots.reduce((sum, s) => sum + s.vehicles.filter((v) => v.type === t).length, 0),
  }));
  const parkedTotal = parkedByType.reduce((sum, p) => sum + p.count, 0);

  const filteredSlots = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return slots.filter((slot) => {
      if (statusFilter === "allotted" && !slot.allotment) return false;
      if (statusFilter === "available" && slot.allotment) return false;
      if (typeFilter !== "all" && !slot.vehicles.some((v) => v.type === typeFilter)) return false;
      if (!q) return true;
      return (
        slot.slotNumber.toLowerCase().includes(q) ||
        slot.zone.toLowerCase().includes(q) ||
        (slot.allotment?.flatLabel.toLowerCase().includes(q) ?? false) ||
        (slot.allotment?.residentName.toLowerCase().includes(q) ?? false) ||
        slot.vehicles.some(
          (v) => (v.reg ?? "").toLowerCase().includes(q) || v.ownerName.toLowerCase().includes(q),
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

  function updateSlot(slotId: string, change: (slot: ParkingSlotRecord) => ParkingSlotRecord) {
    setSlots((prev) => prev.map((s) => (s.id === slotId ? change(s) : s)));
  }

  function logEvent(slot: ParkingSlotRecord, event: Omit<ParkingSlotEvent, "id" | "slotId">) {
    setEvents((prev) => [
      ...prev,
      { id: `evt-${slot.id}-${Date.now()}`, slotId: slot.id, ...event },
    ]);
  }

  function audit(slot: ParkingSlotRecord, details: string) {
    recordAudit({
      module: "Parking",
      entityType: "Parking Slot",
      entityId: slot.id,
      entityLabel: slot.slotNumber,
      action: "Update",
      performedBy: actorName,
      details,
    });
  }

  function handleAllot(flatId: string) {
    if (!selectedSlot) return;
    const timestamp = new Date().toISOString();
    const allotment = {
      flatId,
      flatLabel: flatLabelFor(flatId),
      residentName: residentNameForFlat(flatId),
      allottedOn: timestamp,
    };
    updateSlot(selectedSlot.id, (s) => ({ ...s, allotment, vehicles: [] }));
    logEvent(selectedSlot, {
      action: "allotted",
      flatLabel: allotment.flatLabel,
      personName: allotment.residentName,
      actorName,
      timestamp,
    });
    audit(selectedSlot, `Allotted to ${allotment.flatLabel}`);
    toast({ title: `${selectedSlot.slotNumber} allotted to ${allotment.flatLabel}` });
  }

  function handleRelease() {
    const allotment = selectedSlot?.allotment;
    if (!selectedSlot || !allotment) return;
    updateSlot(selectedSlot.id, (s) => ({ ...s, allotment: null, vehicles: [] }));
    logEvent(selectedSlot, {
      action: "released",
      flatLabel: allotment.flatLabel,
      personName: allotment.residentName,
      actorName,
      timestamp: new Date().toISOString(),
    });
    audit(selectedSlot, `Released from ${allotment.flatLabel}`);
    toast({ title: `${selectedSlot.slotNumber} is available again`, variant: "info" });
  }

  function handleAddVehicle(vehicle: Omit<ParkedVehicle, "id">) {
    const allotment = selectedSlot?.allotment;
    if (!selectedSlot || !allotment) return;
    updateSlot(selectedSlot.id, (s) => ({
      ...s,
      vehicles: [...s.vehicles, { id: `veh-${s.id}-${Date.now()}`, ...vehicle }],
    }));
    logEvent(selectedSlot, {
      action: "vehicle_added",
      flatLabel: allotment.flatLabel,
      personName: allotment.residentName,
      vehicle,
      actorName,
      timestamp: new Date().toISOString(),
    });
    audit(selectedSlot, `Parked ${vehicleName(vehicle)}`);
    toast({ title: `${vehicleName(vehicle)} parked in ${selectedSlot.slotNumber}` });
  }

  function handleRemoveVehicle(vehicleId: string) {
    const allotment = selectedSlot?.allotment;
    const vehicle = selectedSlot?.vehicles.find((v) => v.id === vehicleId);
    if (!selectedSlot || !allotment || !vehicle) return;
    updateSlot(selectedSlot.id, (s) => ({
      ...s,
      vehicles: s.vehicles.filter((v) => v.id !== vehicleId),
    }));
    logEvent(selectedSlot, {
      action: "vehicle_removed",
      flatLabel: allotment.flatLabel,
      personName: allotment.residentName,
      vehicle: { type: vehicle.type, reg: vehicle.reg, ownerName: vehicle.ownerName },
      actorName,
      timestamp: new Date().toISOString(),
    });
    audit(selectedSlot, `Removed ${vehicleName(vehicle)}`);
    toast({
      title: `${vehicleName(vehicle)} removed from ${selectedSlot.slotNumber}`,
      variant: "info",
    });
  }

  function handleCreateSlot(values: AddParkingSlotInput) {
    const slotNumber = values.slotNumber.trim();
    const newSlot: ParkingSlotRecord = {
      id: `slot-${slotNumber.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
      slotNumber,
      zone: values.zone.trim(),
      bay: values.bay,
      allotment: null,
      vehicles: [],
    };
    setSlots((prev) => [...prev, newSlot]);
    setCreateOpen(false);
    recordAudit({
      module: "Parking",
      entityType: "Parking Slot",
      entityId: newSlot.id,
      entityLabel: newSlot.slotNumber,
      action: "Create",
      performedBy: actorName,
    });
    toast({ title: "Parking slot created" });
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground">
            <PageIcon />
            Parking
          </h1>
          <p className="text-sm text-muted-foreground">
            Each slot is allotted to one flat. A car bay also fits that flat&apos;s two-wheeler and
            cycle. Pick a slot to allot it, park vehicles, or see its history.
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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="flex flex-col gap-1">
            <p className="text-xs text-muted-foreground">Slots allotted</p>
            <p className="text-2xl font-semibold tabular-nums text-foreground">
              {allottedCount}
              <span className="text-sm font-normal text-muted-foreground"> / {slots.length}</span>
            </p>
            <p className="text-xs text-emerald-700 dark:text-emerald-400">
              {slots.length - allottedCount} available to allot
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-1">
            <p className="text-xs text-muted-foreground">Vehicles parked</p>
            <p className="text-2xl font-semibold tabular-nums text-foreground">{parkedTotal}</p>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              {parkedByType.map(({ type, count }) => {
                const Icon = VEHICLE_ICON[type];
                return (
                  <span key={type} className="flex items-center gap-1">
                    <Icon className="size-3.5" />
                    {count} {VEHICLE_LABEL[type].toLowerCase()}
                    {count === 1 ? "" : "s"}
                  </span>
                );
              })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-1">
            <p className="text-xs text-muted-foreground">Registered vehicles without a slot</p>
            <p
              className={cn(
                "flex items-center gap-1.5 text-2xl font-semibold tabular-nums",
                unparkedVehicles.length > 0
                  ? "text-amber-700 dark:text-amber-400"
                  : "text-foreground",
              )}
            >
              {unparkedVehicles.length > 0 && <TriangleAlert className="size-4" />}
              {unparkedVehicles.length}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {unparkedVehicles.length === 0
                ? "Every registered vehicle has a spot."
                : unparkedVehicles
                    .map((v) => `${v.registrationNumber} (${flatLabelFor(v.flatId)})`)
                    .join(", ")}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search slot, flat, resident, vehicle…"
              className="w-64 pl-8"
            />
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
            {(["all", "allotted", "available"] as StatusFilter[]).map((status) => (
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
            {(["all", ...PARKING_VEHICLE_TYPES] as TypeFilter[]).map((type) => {
              const Icon = type === "all" ? null : VEHICLE_ICON[type];
              return (
                <Button
                  key={type}
                  variant={typeFilter === type ? "secondary" : "ghost"}
                  size="sm"
                  className="gap-1.5"
                  onClick={() => setTypeFilter(type)}
                >
                  {Icon && <Icon className="size-3.5" />}
                  {type === "all" ? "Any vehicle" : VEHICLE_LABEL[type]}
                </Button>
              );
            })}
          </div>
        </div>
        {view === "map" && (
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm border border-border bg-card" />
              Allotted
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm border border-dashed border-emerald-400 bg-emerald-50 dark:bg-emerald-950" />
              Available
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
                    {zoneSlots.filter((s) => s.allotment).length}/{zoneSlots.length} allotted
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 md:grid-cols-6">
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
          data={filteredSlots}
          columns={tableColumns}
          getRowId={(row) => row.id}
          title="Society parking"
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
                      {selectedSlot.zone} · {PARKING_BAYS[selectedSlot.bay].label}
                    </SheetDescription>
                  </div>
                  <span className="ml-auto shrink-0">
                    <StatusBadge slot={selectedSlot} />
                  </span>
                </div>
              </SheetHeader>
              <SlotSheetBody
                key={`${selectedSlot.id}-${selectedSlot.allotment?.flatId ?? "none"}`}
                slot={selectedSlot}
                slots={slots}
                events={slotEvents}
                unparked={unparkedForSelected}
                onAllot={handleAllot}
                onRelease={handleRelease}
                onAddVehicle={handleAddVehicle}
                onRemoveVehicle={handleRemoveVehicle}
                onSelectSlot={setSelectedSlotId}
              />
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
