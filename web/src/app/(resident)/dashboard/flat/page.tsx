"use client";

import * as React from "react";
import { Check } from "lucide-react";

import { DoodleHouse } from "@/components/icons/doodleHouse";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFlats } from "@/hooks/useFlats";
import { currentFlat } from "@/lib/mockData";
import { mockFlats } from "@/lib/accountMockData";
import { cn } from "@/lib/utils";

export default function FlatPage() {
  const { flats, activeFlat, switchFlat } = useFlats();

  const flat = activeFlat
    ? {
        flatNumber: activeFlat.flatNumber,
        apartmentName: activeFlat.tower,
        floor: activeFlat.floor,
        type: activeFlat.type,
        areaSqft: activeFlat.areaSqft,
        ownerName: currentFlat.ownerName,
        tenantName: activeFlat.ownership === "Tenant" ? "Arjun Mehta (Tenant)" : null,
        societyName: activeFlat.societyName,
      }
    : currentFlat;

  const fields: { label: string; value: string }[] = [
    { label: "Flat number", value: flat.flatNumber },
    { label: "Tower", value: flat.apartmentName },
    { label: "Floor", value: String(flat.floor) },
    { label: "Type", value: flat.type },
    { label: "Area", value: `${flat.areaSqft} sq ft` },
    { label: "Owner", value: flat.ownerName },
    { label: "Tenant", value: flat.tenantName ?? "—" },
    { label: "Society", value: (flat as { societyName?: string }).societyName ?? "—" },
  ];

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">My Flat</h1>
          <p className="text-sm text-muted-foreground">
            {activeFlat
              ? `${activeFlat.label} · ${activeFlat.societyName}`
              : "Ownership and unit details on record."}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" size="sm" className="gap-2" />}>
            <DoodleHouse className="size-4" />
            {activeFlat?.label ?? "Flat A"} ↔ Switch
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            {flats.map((f) => {
              const isActive = f.id === activeFlat?.id;
              return (
                <DropdownMenuItem
                  key={f.id}
                  className={cn("gap-2.5 py-1.5", isActive && "bg-muted/70")}
                  onClick={() => switchFlat(f.id)}
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
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
                  {isActive && <Check className="ml-auto size-4 shrink-0" />}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Card className="rounded-md gap-0 divide-y divide-border px-4 py-0">
        {fields.map((f) => (
          <div key={f.label} className="flex items-center justify-between py-3 text-sm">
            <span className="text-muted-foreground">{f.label}</span>
            <span className="font-medium text-foreground">{f.value}</span>
          </div>
        ))}
      </Card>
      <p className="text-xs text-muted-foreground">
        Also switch flats via the profile menu (AM → Switch flat). Selection persists via local
        storage.
      </p>
    </div>
  );
}
