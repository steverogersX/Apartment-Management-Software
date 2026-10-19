"use client";

import * as React from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { Bike, Car, ChevronRight, Home, Plus, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";

import { formatDate, getInitials, gradientForName, avatarUrlForName } from "@/lib/utils";
import { useStaggeredReveal } from "@/lib/stagger";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable, type DataTableFilterConfig } from "@/components/dataTable";
import { DataTableColumnHeader } from "@/components/dataTableColumnHeader";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  flats,
  flatVehicleHistory,
  type FlatMaintenanceStatus,
  type FlatOccupancyStatus,
  type FlatRecord,
  type FlatVehicleEntry,
  getTowers,
} from "@/lib/flatsMockData";
import {
  flatDuesKey,
  getDuesByFlat,
  maintenanceStatusFromDues,
  type FlatMaintenanceDue,
} from "@/lib/maintenanceMockData";
import { residents } from "@/lib/residentsMockData";
import { useAuth } from "@/hooks/useAuth";
import { StatusIcon } from "@/components/statusIcon";

const OCCUPANCY_LABEL: Record<FlatOccupancyStatus, string> = {
  occupied: "Occupied",
  vacant: "Vacant",
};

const MAINTENANCE_LABEL: Record<FlatMaintenanceStatus, string> = {
  paid: "Paid",
  due: "Due",
};

const residentMap = new Map(residents.map((r) => [r.id, r]));
const residentNameMap = new Map(residents.map((r) => [r.id, r.name.toLowerCase()]));

const vehiclesByFlat = new Map<string, FlatVehicleEntry[]>();
for (const v of flatVehicleHistory) {
  if (!v.isCurrent) continue;
  vehiclesByFlat.set(v.flatId, [...(vehiclesByFlat.get(v.flatId) ?? []), v]);
}

function FlatMaintenanceCell({ flat, dues }: { flat: FlatRecord; dues: FlatMaintenanceDue[] }) {
  const { has } = useAuth();
  const status = maintenanceStatusFromDues(dues);
  const content = (
    <>
      <StatusIcon status={status} />
      <span className="whitespace-nowrap text-foreground">{MAINTENANCE_LABEL[status]}</span>
    </>
  );
  if (!has("MaintenanceViewAll") || dues.length === 0) {
    return <div className="flex items-center gap-2">{content}</div>;
  }
  return (
    <Link
      href={`/dashboard/maintenance/dues/${flat.tower}-${flat.flatNumber}`}
      onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center gap-2 rounded-md px-1 py-0.5 underline-offset-2 hover:bg-muted hover:underline"
    >
      {content}
    </Link>
  );
}

function FlatVehiclesCell({ vehicles }: { vehicles: FlatVehicleEntry[] }) {
  if (vehicles.length === 0) return <span className="text-muted-foreground">—</span>;
  const [first, ...rest] = vehicles;
  const FirstIcon = first.type === "car" ? Car : Bike;
  return (
    <div onClick={(e) => e.stopPropagation()}>
      <HoverCard>
        <HoverCardTrigger
          delay={150}
          closeDelay={100}
          className="inline-flex items-center gap-1.5 rounded-md px-1 py-0.5 whitespace-nowrap hover:bg-muted"
        >
          <FirstIcon className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="font-mono text-xs font-medium tabular-nums text-foreground">
            {first.registrationNumber}
          </span>
          {rest.length > 0 && (
            <Badge variant="secondary" className="px-1.5 py-0 text-[11px]">
              +{rest.length}
            </Badge>
          )}
        </HoverCardTrigger>
        <HoverCardContent className="w-72 p-2" side="bottom" align="start">
          <div className="mb-1 px-1 text-[11px] font-medium tracking-widest text-muted-foreground">
            {vehicles.length} {vehicles.length === 1 ? "VEHICLE" : "VEHICLES"}
          </div>
          <div className="flex max-h-56 flex-col overflow-y-auto">
            {vehicles.map((v) => {
              const Icon = v.type === "car" ? Car : Bike;
              return (
                <div key={v.registrationNumber} className="flex items-center gap-2.5 px-1 py-1.5">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <Icon className="size-3.5" />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium text-foreground">
                      {v.make} {v.model}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {v.color} · {v.ownerName}
                    </span>
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-0.5">
                    <span className="font-mono text-xs font-medium tabular-nums text-foreground">
                      {v.registrationNumber}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {v.parkingSlot ? `Slot ${v.parkingSlot}` : "No slot"}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
}

const towerOptions = getTowers();

function FlatSubRow({ flat }: { flat: FlatRecord }) {
  const router = useRouter();
  const [selected, setSelected] = React.useState<Record<string, boolean>>({});
  const currentResidents = React.useMemo(
    () =>
      flat.currentResidentIds
        .map((id) => residentMap.get(id))
        .filter((r): r is NonNullable<typeof r> => !!r),
    [flat.currentResidentIds],
  );
  const selectedCount = currentResidents.filter((r) => selected[r.id]).length;
  const allSelected = currentResidents.length > 0 && selectedCount === currentResidents.length;
  const someSelected = selectedCount > 0 && !allSelected;
  const revealCount = useStaggeredReveal(currentResidents.length);

  if (currentResidents.length === 0) {
    return (
      <div className="py-3" style={{ paddingLeft: 68, paddingRight: 16 }}>
        <div className="mb-1.5 text-[11px] font-medium tracking-widest text-muted-foreground">
          RESIDENTS
        </div>
        <div className="overflow-x-auto rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow className="border-border bg-muted/40 hover:bg-muted/40">
                <TableHead
                  className="h-10 bg-muted/40 px-0"
                  style={{ width: 36, minWidth: 36, maxWidth: 36 }}
                />
                <TableHead className="h-10 bg-muted/40 px-4 text-sm">Resident</TableHead>
                <TableHead className="h-10 bg-muted/40 px-4 text-sm">Occupancy</TableHead>
                <TableHead className="h-10 bg-muted/40 px-4 text-sm">Phone</TableHead>
                <TableHead className="h-10 bg-muted/40 px-4 text-sm">Status</TableHead>
                <TableHead className="h-10 bg-muted/40 px-4 text-sm">Move-in</TableHead>
                <TableHead
                  className="h-10 bg-muted/40 px-4"
                  style={{ width: 32, minWidth: 32, maxWidth: 32 }}
                />
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={7} className="h-16 text-center text-sm text-muted-foreground">
                  No residents
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="py-3" style={{ paddingLeft: 68, paddingRight: 16 }}>
      <div className="mb-1.5 text-[11px] font-medium tracking-widest text-muted-foreground">
        RESIDENTS
      </div>
      <div className="overflow-x-auto rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow className="border-border bg-muted/40 hover:bg-muted/40">
              <TableHead
                className="h-10 bg-muted/40 px-0"
                style={{ width: 36, minWidth: 36, maxWidth: 36 }}
              >
                <span
                  className="flex items-center justify-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Checkbox
                    checked={allSelected}
                    indeterminate={someSelected}
                    onCheckedChange={(v) =>
                      setSelected(
                        v ? Object.fromEntries(currentResidents.map((r) => [r.id, true])) : {},
                      )
                    }
                    aria-label="Select all residents"
                  />
                </span>
              </TableHead>
              <TableHead className="h-10 bg-muted/40 px-4 text-sm">Resident</TableHead>
              <TableHead className="h-10 bg-muted/40 px-4 text-sm">Occupancy</TableHead>
              <TableHead className="h-10 bg-muted/40 px-4 text-sm">Phone</TableHead>
              <TableHead className="h-10 bg-muted/40 px-4 text-sm">Status</TableHead>
              <TableHead className="h-10 bg-muted/40 px-4 text-sm">Move-in</TableHead>
              <TableHead
                className="h-10 bg-muted/40 px-4"
                style={{ width: 32, minWidth: 32, maxWidth: 32 }}
              />
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentResidents.slice(0, revealCount).map((r) => {
              const [from, to] = gradientForName(r.name);
              return (
                <TableRow
                  key={r.id}
                  className="cursor-pointer border-border hover:bg-muted/50 animate-rise"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/dashboard/people-hub/residents/${r.id}`);
                  }}
                >
                  <TableCell
                    className="px-0 py-2"
                    style={{ width: 36, minWidth: 36, maxWidth: 36 }}
                  >
                    <span
                      className="flex items-center justify-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={!!selected[r.id]}
                        onCheckedChange={(v) => setSelected((prev) => ({ ...prev, [r.id]: !!v }))}
                        aria-label="Select resident"
                      />
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-2">
                    <div className="flex items-center gap-2.5">
                      <Avatar size="sm">
                        <AvatarImage src={avatarUrlForName(r.id)} alt={r.name} />
                        <AvatarFallback
                          className="text-[10px] font-semibold text-white"
                          style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}
                        >
                          {getInitials(r.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate text-sm font-medium text-foreground">{r.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-2">
                    <Badge variant={r.occupancyType === "owner" ? "secondary" : "outline"}>
                      {r.occupancyType === "owner" ? "Owner" : "Tenant"}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-2">
                    <span className="whitespace-nowrap text-sm text-muted-foreground">
                      {r.phone}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-2">
                    <span className="inline-flex items-center gap-1.5">
                      <StatusIcon status={r.status} />
                      <span className="whitespace-nowrap text-sm text-foreground">
                        {STATUS_LABEL[r.status]}
                      </span>
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-2">
                    <span className="whitespace-nowrap text-sm text-muted-foreground">
                      {formatDate(r.moveInDate)}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-2">
                    <ChevronRight className="ml-auto size-3.5 shrink-0 text-muted-foreground/40" />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

const STATUS_LABEL: Record<string, string> = {
  active: "Active",
  pending: "Pending",
  moved_out: "Moved out",
};

export function FlatsTable() {
  const duesByFlat = React.useMemo(() => getDuesByFlat(), []);
  const duesFor = React.useCallback(
    (flat: FlatRecord) => duesByFlat.get(flatDuesKey(flat.tower, flat.flatNumber)) ?? [],
    [duesByFlat],
  );

  const columns = React.useMemo<ColumnDef<FlatRecord>[]>(
    () => [
      {
        id: "flat",
        accessorKey: "flatNumber",
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Flat"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Home className="size-3.5" />
            </span>
            <Link
              href={`/dashboard/people-hub/flats/${row.original.id}`}
              onClick={(e) => e.stopPropagation()}
              className="truncate text-sm font-medium text-foreground underline-offset-2 hover:underline"
            >
              {row.original.tower}-{row.original.flatNumber}
            </Link>
          </div>
        ),
      },
      {
        id: "floor",
        accessorKey: "floor",
        meta: { label: "Floor" },
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Floor"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-muted-foreground">{row.original.floor}</span>
        ),
      },
      {
        id: "type",
        accessorKey: "type",
        meta: { label: "Type" },
        header: () => <DataTableColumnHeader label="Type" />,
        cell: ({ row }) => <Badge variant="outline">{row.original.type}</Badge>,
      },
      {
        id: "maintenanceStatus",
        accessorFn: (row) => maintenanceStatusFromDues(duesFor(row)),
        meta: { label: "Maintenance" },
        header: () => <DataTableColumnHeader label="Maintenance" />,
        cell: ({ row }) => <FlatMaintenanceCell flat={row.original} dues={duesFor(row.original)} />,
      },
      {
        id: "occupancyStatus",
        accessorKey: "occupancyStatus",
        meta: { label: "Status" },
        header: () => <DataTableColumnHeader label="Status" />,
        cell: ({ row }) => {
          const status = row.original.occupancyStatus;
          return (
            <div className="flex items-center gap-2">
              <StatusIcon status={status} />
              <span className="whitespace-nowrap text-foreground">{OCCUPANCY_LABEL[status]}</span>
            </div>
          );
        },
      },
      {
        id: "occupancy",
        accessorFn: (row) => {
          if (row.currentResidentIds.length === 0) return "Vacant";
          const hasOwner = row.currentResidentIds.some(
            (id) => residentMap.get(id)?.occupancyType === "owner",
          );
          return hasOwner ? "Owner" : "Tenant";
        },
        meta: { label: "Occupancy" },
        header: () => <DataTableColumnHeader label="Occupancy" />,
        cell: ({ row }) => {
          const ids = row.original.currentResidentIds;
          if (ids.length === 0) return <span className="text-muted-foreground">Vacant</span>;
          const hasOwner = ids.some((id) => residentMap.get(id)?.occupancyType === "owner");
          return (
            <Badge variant={hasOwner ? "secondary" : "outline"}>
              {hasOwner ? "Owner" : "Tenant"}
            </Badge>
          );
        },
      },
      {
        id: "vehicles",
        accessorFn: (row) => vehiclesByFlat.get(row.id)?.length ?? 0,
        meta: { label: "Vehicles" },
        header: () => <DataTableColumnHeader icon={Car} label="Vehicles" />,
        cell: ({ row }) => (
          <FlatVehiclesCell vehicles={vehiclesByFlat.get(row.original.id) ?? []} />
        ),
      },
      {
        id: "actions",
        enableHiding: false,
        header: () => null,
        cell: ({ row }) =>
          row.original.occupancyStatus === "vacant" ? (
            <Button
              size="sm"
              variant="outline"
              className="h-7 gap-1.5 px-2 text-xs"
              onClick={(e) => e.stopPropagation()}
              render={<Link href={`/dashboard/people-hub/flats/${row.original.id}`} />}
            >
              <UserPlus className="size-3.5" />
              Assign
            </Button>
          ) : null,
      },
    ],
    [duesFor],
  );

  const filters = React.useMemo<DataTableFilterConfig<FlatRecord>[]>(
    () => [
      {
        id: "search",
        label: "Search",
        type: "search",
        placeholder: "Search flat, tower, resident or vehicle",
        predicate: (row, query) => {
          const q = query.toLowerCase();
          if (
            row.flatNumber.toLowerCase().includes(q) ||
            row.tower.toLowerCase().includes(q) ||
            `${row.tower}-${row.flatNumber}`.toLowerCase().includes(q)
          )
            return true;
          if (row.currentResidentIds.some((id) => (residentNameMap.get(id) ?? "").includes(q)))
            return true;
          return (vehiclesByFlat.get(row.id) ?? []).some((v) =>
            `${v.registrationNumber} ${v.make} ${v.model}`.toLowerCase().includes(q),
          );
        },
      },
      {
        id: "tower",
        label: "Tower",
        type: "select",
        options: towerOptions.map((t) => ({ label: `Tower ${t}`, value: t })),
        predicate: (row, value) => row.tower === value,
      },
      {
        id: "occupancyStatus",
        label: "Status",
        type: "select",
        options: (["occupied", "vacant"] as FlatOccupancyStatus[]).map((v) => ({
          label: OCCUPANCY_LABEL[v],
          value: v,
        })),
        predicate: (row, value) => row.occupancyStatus === value,
      },
      {
        id: "type",
        label: "Type",
        type: "select",
        options: [...new Set(flats.map((f) => f.type))].sort().map((t) => ({ label: t, value: t })),
        predicate: (row, value) => row.type === value,
      },
      {
        id: "maintenanceStatus",
        label: "Maintenance",
        type: "select",
        options: [
          { label: "Paid", value: "paid" },
          { label: "Due", value: "due" },
        ],
        predicate: (row, value) => maintenanceStatusFromDues(duesFor(row)) === value,
      },
      {
        id: "occupancy",
        label: "Occupancy",
        type: "select",
        options: [
          { label: "Owner-occupied", value: "owner" },
          { label: "Tenant-occupied", value: "tenant" },
        ],
        predicate: (row, value) => {
          if (row.currentResidentIds.length === 0) return false;
          const hasOwner = row.currentResidentIds.some(
            (id) => residentMap.get(id)?.occupancyType === "owner",
          );
          return value === "owner" ? hasOwner : !hasOwner;
        },
      },
      {
        id: "groupBy",
        label: "Group by",
        type: "groupBy",
        options: [
          { label: "None", value: "none" },
          { label: "Tower", value: "tower" },
          { label: "Status", value: "status" },
          { label: "Residents", value: "residents" },
        ],
        groupBy: (row, value) => {
          if (value === "residents") {
            const firstId = row.currentResidentIds[0];
            if (!firstId) return "Vacant";
            return residentMap.get(firstId)?.name ?? "Vacant";
          }
          return value === "status" ? OCCUPANCY_LABEL[row.occupancyStatus] : `Tower ${row.tower}`;
        },
      },
    ],
    [duesFor],
  );

  const renderSubRow = React.useCallback((row: FlatRecord) => <FlatSubRow flat={row} />, []);

  const [statusFilter, setStatusFilter] = React.useState<"all" | FlatOccupancyStatus>("all");
  const vacantCount = React.useMemo(
    () => flats.filter((f) => f.occupancyStatus === "vacant").length,
    [],
  );
  const filterValues = React.useMemo<Record<string, string>>(() => {
    const values: Record<string, string> = {};
    if (statusFilter !== "all") values.occupancyStatus = statusFilter;
    return values;
  }, [statusFilter]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-1 self-start rounded-lg border border-border bg-card p-1">
        {(["all", "occupied", "vacant"] as const).map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? "secondary" : "ghost"}
            size="sm"
            className="gap-1.5 capitalize"
            onClick={() => setStatusFilter(status)}
          >
            {status}
            {status === "vacant" && (
              <Badge variant="outline" className="px-1.5 py-0 text-[11px]">
                {vacantCount}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      <DataTable
        key={statusFilter}
        data={flats}
        columns={columns}
        getRowId={(f) => f.id}
        renderSubRow={renderSubRow}
        enableRowSelection
        title="All flats"
        filters={filters}
        defaultFilterValues={filterValues}
        enableColumnReorder
        enableColumnVisibility
        enableFilterCustomization
        showPageSize
        pageSize={8}
        itemLabel="flat"
        emptyMessage="No flats match these filters."
        toolbarActions={
          <Button
            size="sm"
            className="gap-1.5"
            render={<Link href="/dashboard/people-hub/flats/new" />}
          >
            <Plus className="size-3.5" />
            Add flat
          </Button>
        }
      />
    </div>
  );
}
