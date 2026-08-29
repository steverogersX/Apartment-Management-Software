"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Calendar, Car, History, Mail, Phone } from "lucide-react";

import { DoodleHouse } from "@/components/icons/doodleHouse";

import { useBreadcrumbTitle } from "@/components/breadcrumbs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { flats, flatVehicleHistory } from "@/lib/flatsMockData";
import { residents } from "@/lib/residentsMockData";
import { getInitials, gradientForName } from "@/lib/utils";

const OCCUPANCY_LABEL: Record<string, string> = {
  owner: "Owner",
  tenant: "Tenant",
};

const STATUS_DOT: Record<string, string> = {
  active: "bg-emerald-500",
  moved_out: "bg-zinc-400",
  pending: "bg-amber-500",
};

const STATUS_LABEL: Record<string, string> = {
  active: "Active",
  moved_out: "Moved out",
  pending: "Pending",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ResidentDetailPage() {
  const params = useParams<{ residentId: string }>();
  const resident = residents.find((r) => r.id === params.residentId);

  useBreadcrumbTitle(resident?.name ?? null);

  if (!resident) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <p className="text-sm text-muted-foreground">Resident not found.</p>
        <Link
          href="/dashboard/people-hub/flats"
          className="text-sm font-medium text-foreground underline"
        >
          Back to flats
        </Link>
      </div>
    );
  }

  const flat = flats.find((f) => f.id === resident.flatId);
  const vehicles = flatVehicleHistory.filter((v) => v.residentId === resident.id && v.isCurrent);

  const [from, to] = gradientForName(resident.name);

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
          <Avatar className="size-20 shrink-0 text-lg">
            <AvatarImage
              src={`https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(resident.id)}`}
              alt={resident.name}
            />
            <AvatarFallback
              className="text-lg font-semibold text-white"
              style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}
            >
              {getInitials(resident.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight text-foreground">
                {resident.name}
              </h1>
              <Badge variant={resident.occupancyType === "owner" ? "secondary" : "outline"}>
                {OCCUPANCY_LABEL[resident.occupancyType]}
              </Badge>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2 py-0.5 text-xs font-medium">
                <span
                  className={`size-1.5 shrink-0 rounded-full ${STATUS_DOT[resident.status] ?? "bg-zinc-400"}`}
                />
                {STATUS_LABEL[resident.status] ?? resident.status}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <DoodleHouse className="size-3.5 shrink-0" />
                {flat ? (
                  <Link
                    href={`/dashboard/people-hub/flats/${flat.id}`}
                    className="font-medium text-foreground underline-offset-2 hover:underline"
                  >
                    {flat.tower}-{flat.flatNumber}
                  </Link>
                ) : (
                  <span className="font-medium text-foreground">
                    {resident.tower}-{resident.flatNumber}
                  </span>
                )}
              </span>
              <span className="text-muted-foreground/40">·</span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="size-3.5 shrink-0" />
                Move-in {formatDate(resident.moveInDate)}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Phone className="size-3.5 shrink-0" />
                {resident.phone}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Mail className="size-3.5 shrink-0" />
                <span className="truncate">{resident.email}</span>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Car className="size-4 text-muted-foreground" />
            Current vehicles
          </CardTitle>
        </CardHeader>
        <CardContent>
          {vehicles.length === 0 ? (
            <p className="text-sm text-muted-foreground">No current vehicles.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {vehicles.map((v) => (
                <div
                  key={v.registrationNumber}
                  className="flex flex-wrap items-center gap-2 rounded-md border border-border p-3 text-sm"
                >
                  <span className="font-medium text-foreground">{v.registrationNumber}</span>
                  <Badge variant="secondary" className="text-[11px]">
                    Current
                  </Badge>
                  <span className="text-muted-foreground">
                    {v.make} {v.model} · {v.color} · {v.type === "car" ? "Car" : "Two-wheeler"}
                  </span>
                  {v.parkingSlot && (
                    <Badge variant="outline" className="text-[11px]">
                      {v.parkingSlot}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5"
          render={<Link href={`/dashboard/people-hub/history?residentId=${resident.id}`} />}
        >
          <History className="size-3.5" />
          View history
        </Button>
      </div>
    </div>
  );
}
