"use client";

import type { SocietyResponse } from "@shared/index";
import Link from "next/link";
import { MapPin, Users } from "lucide-react";

import { cn, getInitials } from "@/lib/utils";
import { getSocietyDetails } from "@/lib/platformMockData";
import { SocietyLogo } from "@/components/societyLogo";

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function SocietiesTable({ societies }: { societies: SocietyResponse[] }) {
  if (!societies.length) {
    return (
      <div className="flex h-32 items-center justify-center rounded-md border border-dashed border-border text-sm text-muted-foreground">
        No societies yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {societies.map((s) => {
        const details = getSocietyDetails(s.id, s.name);
        return (
          <Link
            key={s.id}
            href={`/platform/societies/${s.id}`}
            className="group flex flex-col gap-4 rounded-md border border-border bg-card p-4 transition-colors hover:border-foreground/20 hover:bg-muted/30"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <SocietyLogo
                  name={s.name}
                  initials={getInitials(s.name)}
                  src={details.logoUrl}
                  className="size-10 text-sm"
                />
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-semibold text-foreground">{s.name}</span>
                  <span className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                    <MapPin className="size-3" />
                    {details.city}
                  </span>
                </div>
              </div>
              <span className="flex items-center gap-1.5 shrink-0 pt-0.5">
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    s.isActive ? "bg-emerald-500" : "bg-muted-foreground",
                  )}
                />
                <span className="text-xs text-muted-foreground">
                  {s.isActive ? "Active" : "Inactive"}
                </span>
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="size-3" />
                {details.unitsCount} units
              </span>
              <span>Created {formatDate(s.createdAt)}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
