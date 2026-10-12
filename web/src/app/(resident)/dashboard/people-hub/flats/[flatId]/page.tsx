"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, History, KeyRound, Mail, Phone, Ruler, UserPlus } from "lucide-react";

import { DoodleHouse } from "@/components/icons/doodleHouse";

import { useBreadcrumbTitle } from "@/components/breadcrumbs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AssignResidentDialog,
  type NewResidentInput,
} from "@/components/flats/assignResidentDialog";
import { flats, type FlatOccupancyStatus } from "@/lib/flatsMockData";
import { residents, type ResidentRecord } from "@/lib/residentsMockData";
import { cn, getInitials, gradientForName } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { StatusIcon } from "@/components/statusIcon";

const OCCUPANCY_STATUS_LABEL: Record<FlatOccupancyStatus, string> = {
  occupied: "Occupied",
  vacant: "Vacant",
};

const RESIDENT_OCCUPANCY_LABEL: Record<string, string> = {
  owner: "Owner",
  tenant: "Tenant",
};

export default function FlatDetailPage() {
  const { toast } = useToast();
  const params = useParams<{ flatId: string }>();
  const [version, setVersion] = React.useState(0);
  const [assignOpen, setAssignOpen] = React.useState(false);
  // Memoized (not a plain `.find()`) so the mutation handlers below, which replace entries in
  // the shared `flats`/`residents` arrays, don't read as mutating a render-scoped value.
  const flat = React.useMemo(
    () => flats.find((f) => f.id === params.flatId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [params.flatId, version],
  );

  useBreadcrumbTitle(flat ? `${flat.tower}-${flat.flatNumber}` : null);

  if (!flat) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <p className="text-sm text-muted-foreground">Flat not found.</p>
        <Link
          href="/dashboard/people-hub/flats"
          className="text-sm font-medium text-foreground underline"
        >
          Back to flats
        </Link>
      </div>
    );
  }

  const currentResidents = residents.filter((r) => flat.currentResidentIds.includes(r.id));
  const flatLabel = `${flat.tower}-${flat.flatNumber}`;

  function handleAssignNew(input: NewResidentInput) {
    if (!flat) return;
    const flatId = flat.id;
    const targetIndex = flats.findIndex((f) => f.id === flatId);
    if (targetIndex === -1) return;

    const resident: ResidentRecord = {
      id: crypto.randomUUID(),
      name: input.name,
      email: input.email,
      phone: input.phone,
      flatNumber: flats[targetIndex].flatNumber,
      tower: flats[targetIndex].tower,
      flatId,
      occupancyType: input.occupancyType,
      memberCount: 1,
      vehiclesCount: 0,
      status: "active",
      moveInDate: new Date().toISOString(),
    };
    residents.push(resident);
    flats[targetIndex] = {
      ...flats[targetIndex],
      currentResidentIds: [...flats[targetIndex].currentResidentIds, resident.id],
      occupancyStatus: "occupied",
    };
    setVersion((v) => v + 1);
    toast({ title: "Resident assigned" });
  }

  function handleAssignExisting(residentId: string) {
    if (!flat) return;
    const flatId = flat.id;
    const targetIndex = flats.findIndex((f) => f.id === flatId);
    const residentIndex = residents.findIndex((r) => r.id === residentId);
    if (targetIndex === -1 || residentIndex === -1) return;
    const previousFlatId = residents[residentIndex].flatId;

    const previousFlatIndex = flats.findIndex((f) => f.id === previousFlatId);
    if (previousFlatIndex !== -1 && previousFlatIndex !== targetIndex) {
      const remainingResidentIds = flats[previousFlatIndex].currentResidentIds.filter(
        (id) => id !== residentId,
      );
      flats[previousFlatIndex] = {
        ...flats[previousFlatIndex],
        currentResidentIds: remainingResidentIds,
        occupancyStatus:
          remainingResidentIds.length === 0 ? "vacant" : flats[previousFlatIndex].occupancyStatus,
      };
    }

    residents[residentIndex] = {
      ...residents[residentIndex],
      flatId,
      flatNumber: flats[targetIndex].flatNumber,
      tower: flats[targetIndex].tower,
      status: "active",
    };
    const nextResidentIds = flats[targetIndex].currentResidentIds.includes(residentId)
      ? flats[targetIndex].currentResidentIds
      : [...flats[targetIndex].currentResidentIds, residentId];
    flats[targetIndex] = {
      ...flats[targetIndex],
      currentResidentIds: nextResidentIds,
      occupancyStatus: "occupied",
    };
    setVersion((v) => v + 1);
    toast({ title: "Resident assigned" });
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <Link
        href="/dashboard/people-hub/flats"
        className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Back to flats
      </Link>

      <Card>
        <CardContent className="flex gap-5 p-6">
          <span className="flex size-20 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <DoodleHouse className="size-9" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight text-foreground">
                {flat.tower}-{flat.flatNumber}
              </h1>
              <Badge variant="outline">{flat.type}</Badge>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2 py-0.5 text-xs font-medium">
                <StatusIcon status={flat.occupancyStatus} />
                {OCCUPANCY_STATUS_LABEL[flat.occupancyStatus]}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span>Floor {flat.floor}</span>
              <span className="inline-flex items-center gap-1.5">
                <Ruler className="size-3.5 shrink-0" />
                {flat.areaSqft.toLocaleString("en-IN")} sq ft
              </span>
              <span>Tower {flat.tower}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div
        className={cn("grid grid-cols-1 gap-5", flat.owner && "lg:grid-cols-[minmax(0,1fr)_320px]")}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle className="text-sm">Current residents</CardTitle>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              onClick={() => setAssignOpen(true)}
            >
              <UserPlus className="size-3.5" />
              {flat.occupancyStatus === "vacant" ? "Assign resident" : "Add resident"}
            </Button>
          </CardHeader>
          <CardContent>
            {currentResidents.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No current residents — flat is vacant. Assign a resident to mark it occupied.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {currentResidents.map((r) => {
                  const [from, to] = gradientForName(r.name);
                  return (
                    <Link
                      key={r.id}
                      href={`/dashboard/people-hub/residents/${r.id}`}
                      className="flex items-center gap-3 rounded-md border border-border p-3 transition-colors hover:bg-muted/50"
                    >
                      <Avatar size="sm">
                        <AvatarImage
                          src={`https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(r.id)}`}
                          alt={r.name}
                        />
                        <AvatarFallback
                          className="text-[10px] font-semibold text-white"
                          style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}
                        >
                          {getInitials(r.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-sm font-medium text-foreground">
                          {r.name}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">{r.phone}</span>
                      </div>
                      <Badge variant={r.occupancyType === "owner" ? "secondary" : "outline"}>
                        {RESIDENT_OCCUPANCY_LABEL[r.occupancyType]}
                      </Badge>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {flat.owner && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <KeyRound className="size-4 text-muted-foreground" />
                Owner on record
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {flat.occupancyStatus === "vacant" && (
                <p className="text-xs text-muted-foreground">
                  Vacant just means nobody lives here right now — this flat still has a registered
                  owner.
                </p>
              )}
              <div className="flex items-center gap-3">
                <Avatar size="sm">
                  <AvatarFallback className="text-[10px] font-semibold">
                    {getInitials(flat.owner.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate text-sm font-medium text-foreground">
                  {flat.owner.name}
                </span>
              </div>
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Phone className="size-3.5 shrink-0" />
                {flat.owner.phone}
              </span>
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Mail className="size-3.5 shrink-0" />
                <span className="truncate">{flat.owner.email}</span>
              </span>
            </CardContent>
          </Card>
        )}
      </div>

      <div>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5"
          render={<Link href={`/dashboard/people-hub/history?flatId=${flat.id}`} />}
        >
          <History className="size-3.5" />
          View history
        </Button>
      </div>

      <AssignResidentDialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
        flatLabel={flatLabel}
        owner={flat.owner}
        onAssignNew={handleAssignNew}
        onAssignExisting={handleAssignExisting}
      />
    </div>
  );
}
