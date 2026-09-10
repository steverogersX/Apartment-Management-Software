"use client";

import * as React from "react";
import Link from "next/link";
import { Car, LayoutGrid, Loader2, Ruler, Ticket, UserRound, UsersRound } from "lucide-react";

import { DoodleHouse } from "@/components/icons/doodleHouse";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useFlats } from "@/hooks/useFlats";
import { currentFlat } from "@/lib/mockData";
import { cn } from "@/lib/utils";

export default function FlatPage() {
  const { flats, activeFlat, switchFlat, isSwitchingFlat } = useFlats();

  const flat = activeFlat
    ? {
        flatNumber: activeFlat.flatNumber,
        tower: activeFlat.tower,
        floor: activeFlat.floor,
        type: activeFlat.type,
        areaSqft: activeFlat.areaSqft,
        ownership: activeFlat.ownership,
        ownerName: currentFlat.ownerName,
        tenantName: activeFlat.ownership === "Tenant" ? "Arjun Mehta" : null,
        societyName: activeFlat.societyName,
      }
    : {
        flatNumber: currentFlat.flatNumber,
        tower: currentFlat.apartmentName,
        floor: currentFlat.floor,
        type: currentFlat.type,
        areaSqft: currentFlat.areaSqft,
        ownership: "Owner" as const,
        ownerName: currentFlat.ownerName,
        tenantName: currentFlat.tenantName,
        societyName: undefined as string | undefined,
      };

  const towerLetter = flat.tower.replace(/[^A-Za-z0-9]/g, "").slice(-1) || "?";

  const stats: {
    label: string;
    value: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { label: "Floor", value: `Floor ${flat.floor}`, icon: Ruler },
    { label: "Type", value: flat.type, icon: LayoutGrid },
    { label: "Area", value: `${flat.areaSqft.toLocaleString("en-IN")} sq ft`, icon: Ruler },
  ];

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">My Flat</h1>
          <p className="text-sm text-muted-foreground">Ownership and unit details on record.</p>
        </div>
        {flats.length > 1 && (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" size="sm" className="gap-2" disabled={isSwitchingFlat} />
              }
            >
              {isSwitchingFlat ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <DoodleHouse className="size-3.5" />
              )}
              {isSwitchingFlat ? "Switching…" : `${activeFlat?.label ?? "Flat A"}`}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              {flats.map((f) => {
                const isActive = f.id === activeFlat?.id;
                return (
                  <DropdownMenuItem
                    key={f.id}
                    disabled={isSwitchingFlat}
                    className={cn("gap-2.5 py-1.5", isActive && "bg-muted/70")}
                    onClick={() => switchFlat(f.id)}
                  >
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full border bg-muted text-xs font-medium text-foreground">
                      {f.label.slice(-1)}
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-medium">
                        {f.label} · {f.flatNumber}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {f.tower} · {f.type} · {f.ownership}
                      </span>
                    </span>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <Card className={cn("relative transition-opacity", isSwitchingFlat && "opacity-50")}>
        {isSwitchingFlat && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-background/70 backdrop-blur-[1px]">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        )}
        <CardContent className="flex flex-col gap-5 p-6">
          <div className="flex flex-wrap items-start gap-4">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">
              <DoodleHouse className="size-7" />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-semibold tracking-tight text-foreground">
                  {towerLetter}-{flat.flatNumber}
                </h2>
                <Badge variant={flat.ownership === "Owner" ? "secondary" : "outline"}>
                  {flat.ownership}
                </Badge>
              </div>
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full border bg-muted text-[11px] font-medium text-foreground">
                  {towerLetter}
                </span>
                {flat.tower}
                {flat.societyName && (
                  <>
                    <span className="text-muted-foreground/40">·</span>
                    {flat.societyName}
                  </>
                )}
              </p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-3 gap-3">
            {stats.map((s) => (
              <div
                key={s.label}
                className="flex flex-col gap-1 rounded-lg border border-border p-3"
              >
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <s.icon className="size-3.5 shrink-0" />
                  {s.label}
                </span>
                <span className="text-sm font-semibold text-foreground">{s.value}</span>
              </div>
            ))}
          </div>

          <Separator />

          <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
            <div className="flex flex-1 items-center gap-2.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <UserRound className="size-4" />
              </span>
              <div className="flex min-w-0 flex-col">
                <span className="text-xs text-muted-foreground">Owner</span>
                <span className="truncate text-sm font-medium text-foreground">
                  {flat.ownerName}
                </span>
              </div>
            </div>
            {flat.tenantName && (
              <div className="flex flex-1 items-center gap-2.5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <UsersRound className="size-4" />
                </span>
                <div className="flex min-w-0 flex-col">
                  <span className="text-xs text-muted-foreground">Tenant</span>
                  <span className="truncate text-sm font-medium text-foreground">
                    {flat.tenantName}
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5"
          render={<Link href="/dashboard/vehicles" />}
        >
          <Car className="size-3.5" />
          Vehicles & Parking
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5"
          render={<Link href="/dashboard/complaints" />}
        >
          <Ticket className="size-3.5" />
          Complaints
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Also switch flats via the profile menu (AM → Switch flat). Selection persists via local
        storage.
      </p>
    </div>
  );
}
