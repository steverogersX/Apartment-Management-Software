"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, History, Ruler } from "lucide-react";

import { DoodleHouse } from "@/components/icons/doodleHouse";

import { useBreadcrumbTitle } from "@/components/breadcrumbs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { flats, type FlatOccupancyStatus } from "@/lib/flatsMockData";
import { residents } from "@/lib/residentsMockData";
import { cn, getInitials, gradientForName } from "@/lib/utils";

const OCCUPANCY_STATUS_DOT: Record<FlatOccupancyStatus, string> = {
  occupied: "bg-emerald-500",
  vacant: "bg-zinc-400",
};

const OCCUPANCY_STATUS_LABEL: Record<FlatOccupancyStatus, string> = {
  occupied: "Occupied",
  vacant: "Vacant",
};

const RESIDENT_OCCUPANCY_LABEL: Record<string, string> = {
  owner: "Owner",
  tenant: "Tenant",
};

export default function FlatDetailPage() {
  const params = useParams<{ flatId: string }>();
  const flat = flats.find((f) => f.id === params.flatId);

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
                <span
                  className={cn(
                    "size-1.5 shrink-0 rounded-full",
                    OCCUPANCY_STATUS_DOT[flat.occupancyStatus],
                  )}
                />
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

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Current residents</CardTitle>
        </CardHeader>
        <CardContent>
          {currentResidents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No current residents — flat is vacant.</p>
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
                      <span className="truncate text-sm font-medium text-foreground">{r.name}</span>
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
    </div>
  );
}
