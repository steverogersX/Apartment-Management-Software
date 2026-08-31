"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { House, Plus, UserPlus, X } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { flats, type FlatType } from "@/lib/flatsMockData";
import { residents, type ResidentOccupancyType } from "@/lib/residentsMockData";
import { cn, getInitials, gradientForName } from "@/lib/utils";

const FLAT_TYPES: FlatType[] = ["1BHK", "2BHK", "3BHK", "4BHK"];

type PendingResident =
  | {
      key: string;
      kind: "new";
      name: string;
      email: string;
      phone: string;
      occupancyType: ResidentOccupancyType;
    }
  | { key: string; kind: "existing"; residentId: string };

function mascotUrl(seed: string) {
  return `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(seed)}`;
}

function ResidentAvatar({
  name,
  seed,
  size = "sm",
}: {
  name: string;
  seed: string;
  size?: "sm" | "default";
}) {
  const [from, to] = gradientForName(name || seed);
  return (
    <Avatar size={size}>
      <AvatarImage src={mascotUrl(seed)} alt={name || "New resident"} />
      <AvatarFallback
        className="text-[10px] font-semibold text-white"
        style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}
      >
        {name ? getInitials(name) : "?"}
      </AvatarFallback>
    </Avatar>
  );
}

export function CreateFlatForm() {
  const router = useRouter();
  const [flatNumber, setFlatNumber] = React.useState("");
  const [tower, setTower] = React.useState("");
  const [floor, setFloor] = React.useState("");
  const [type, setType] = React.useState<FlatType>("2BHK");
  const [areaSqft, setAreaSqft] = React.useState("");

  const [pendingResidents, setPendingResidents] = React.useState<PendingResident[]>([]);
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [addKind, setAddKind] = React.useState<"new" | "existing">("new");
  const [draftName, setDraftName] = React.useState("");
  const [draftEmail, setDraftEmail] = React.useState("");
  const [draftPhone, setDraftPhone] = React.useState("");
  const [draftOccupancy, setDraftOccupancy] = React.useState<ResidentOccupancyType>("owner");
  const [draftExistingId, setDraftExistingId] = React.useState("");
  const [draftError, setDraftError] = React.useState<string | undefined>();

  const [error, setError] = React.useState<string | undefined>();
  const [submitting, setSubmitting] = React.useState(false);

  function resetDraft() {
    setDraftName("");
    setDraftEmail("");
    setDraftPhone("");
    setDraftOccupancy("owner");
    setDraftExistingId("");
    setDraftError(undefined);
  }

  function confirmAddResident() {
    if (addKind === "new") {
      if (!draftName.trim() || !draftEmail.trim() || !draftPhone.trim()) {
        setDraftError("Name, email and phone are required");
        return;
      }
      setPendingResidents((rows) => [
        ...rows,
        {
          key: crypto.randomUUID(),
          kind: "new",
          name: draftName.trim(),
          email: draftEmail.trim(),
          phone: draftPhone.trim(),
          occupancyType: draftOccupancy,
        },
      ]);
    } else {
      if (!draftExistingId) {
        setDraftError("Select an existing resident");
        return;
      }
      setPendingResidents((rows) => [
        ...rows,
        { key: crypto.randomUUID(), kind: "existing", residentId: draftExistingId },
      ]);
    }
    resetDraft();
    setShowAddForm(false);
  }

  function removePending(key: string) {
    setPendingResidents((rows) => rows.filter((r) => r.key !== key));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(undefined);

    if (!flatNumber.trim() || !tower.trim() || !floor.trim() || !areaSqft.trim()) {
      setError("All fields are required");
      return;
    }
    const floorNum = Number(floor);
    const areaNum = Number(areaSqft);
    if (!Number.isFinite(floorNum) || !Number.isFinite(areaNum) || areaNum <= 0) {
      setError("Floor and area must be valid numbers");
      return;
    }

    setSubmitting(true);

    const flatTower = tower.trim().toUpperCase();
    const flatNum = flatNumber.trim();
    const newFlatId = crypto.randomUUID();

    flats.push({
      id: newFlatId,
      flatNumber: flatNum,
      tower: flatTower,
      floor: floorNum,
      type,
      areaSqft: areaNum,
      occupancyStatus: pendingResidents.length > 0 ? "occupied" : "vacant",
      maintenanceStatus: "due",
      currentResidentIds: [],
    });
    const flat = flats[flats.length - 1];

    for (const pending of pendingResidents) {
      if (pending.kind === "new") {
        const resident = {
          id: crypto.randomUUID(),
          name: pending.name,
          email: pending.email,
          phone: pending.phone,
          flatNumber: flatNum,
          tower: flatTower,
          flatId: newFlatId,
          occupancyType: pending.occupancyType,
          memberCount: 1,
          vehiclesCount: 0,
          status: "active" as const,
          moveInDate: new Date().toISOString(),
        };
        residents.push(resident);
        flat.currentResidentIds.push(resident.id);
      } else {
        const resident = residents.find((r) => r.id === pending.residentId);
        if (resident) {
          resident.flatId = newFlatId;
          resident.flatNumber = flatNum;
          resident.tower = flatTower;
          resident.status = "active";
          flat.currentResidentIds.push(resident.id);
        }
      }
    }

    router.push("/dashboard/people-hub/flats");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <House className="size-4 text-muted-foreground" />
            Flat details
          </CardTitle>
          <CardDescription>Basic information about the unit.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="flat-number">Flat number</Label>
              <Input
                id="flat-number"
                placeholder="301"
                value={flatNumber}
                onChange={(e) => setFlatNumber(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="flat-tower">Tower</Label>
              <Input
                id="flat-tower"
                placeholder="A"
                value={tower}
                onChange={(e) => setTower(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="flat-floor">Floor</Label>
              <Input
                id="flat-floor"
                type="number"
                placeholder="3"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as FlatType)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FLAT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="flat-area">Area (sq ft)</Label>
              <Input
                id="flat-area"
                type="number"
                placeholder="1450"
                value={areaSqft}
                onChange={(e) => setAreaSqft(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="size-4 text-muted-foreground" />
            Residents
          </CardTitle>
          <CardDescription>
            Optional — leave the flat vacant, or assign residents now.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {pendingResidents.length > 0 && (
            <div className="flex flex-col gap-2">
              {pendingResidents.map((p) => {
                const existing =
                  p.kind === "existing" ? residents.find((r) => r.id === p.residentId) : null;
                const name = p.kind === "new" ? p.name : (existing?.name ?? "Unknown resident");
                const occupancyType = p.kind === "new" ? p.occupancyType : existing?.occupancyType;
                const seed = p.kind === "new" ? name : p.residentId;
                const subtext =
                  p.kind === "new"
                    ? p.email
                    : existing
                      ? `Moving from ${existing.tower}-${existing.flatNumber}`
                      : "";
                return (
                  <div
                    key={p.key}
                    className="flex items-center gap-2.5 rounded-md border border-border p-2.5"
                  >
                    <ResidentAvatar name={name} seed={seed} />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm font-medium text-foreground">{name}</span>
                      <span className="truncate text-xs text-muted-foreground">{subtext}</span>
                    </div>
                    {occupancyType && (
                      <Badge variant={occupancyType === "owner" ? "secondary" : "outline"}>
                        {occupancyType === "owner" ? "Owner" : "Tenant"}
                      </Badge>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground"
                      onClick={() => removePending(p.key)}
                    >
                      <X className="size-3.5" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}

          {showAddForm ? (
            <div className="flex flex-col gap-4 rounded-md border border-border p-3.5">
              <Tabs value={addKind} onValueChange={(v) => setAddKind(v as typeof addKind)}>
                <TabsList>
                  <TabsTrigger value="new">New resident</TabsTrigger>
                  <TabsTrigger value="existing">Existing resident</TabsTrigger>
                </TabsList>

                <TabsContent value="new" className="animate-rise mt-4">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <ResidentAvatar
                        name={draftName}
                        seed={draftName || "new-resident"}
                        size="default"
                      />
                      <p className="text-xs text-muted-foreground">
                        Profile picture is generated automatically from the name.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="resident-name">Full name</Label>
                        <Input
                          id="resident-name"
                          placeholder="Priya Sharma"
                          value={draftName}
                          onChange={(e) => setDraftName(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="resident-email">Email</Label>
                        <Input
                          id="resident-email"
                          type="email"
                          placeholder="priya@example.com"
                          value={draftEmail}
                          onChange={(e) => setDraftEmail(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="resident-phone">Phone</Label>
                        <Input
                          id="resident-phone"
                          placeholder="+91 98765 43210"
                          value={draftPhone}
                          onChange={(e) => setDraftPhone(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label>Occupancy</Label>
                        <Select
                          value={draftOccupancy}
                          onValueChange={(v) => setDraftOccupancy(v as ResidentOccupancyType)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="owner">Owner</SelectItem>
                            <SelectItem value="tenant">Tenant</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="existing" className="animate-rise mt-4">
                  <div className="flex flex-col gap-1.5">
                    <Label>Resident</Label>
                    <Select
                      value={draftExistingId}
                      onValueChange={(v) => setDraftExistingId(v ?? "")}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a resident">
                          {(id: string) =>
                            residents.find((r) => r.id === id)?.name ?? "Select a resident"
                          }
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {residents
                          .filter(
                            (r) =>
                              !pendingResidents.some(
                                (p) => p.kind === "existing" && p.residentId === r.id,
                              ),
                          )
                          .map((r) => (
                            <SelectItem key={r.id} value={r.id} className="py-1.5">
                              <span className="flex min-w-0 flex-1 items-center gap-2.5">
                                <ResidentAvatar name={r.name} seed={r.id} />
                                <span className="flex min-w-0 flex-col">
                                  <span className="truncate text-sm font-medium text-foreground">
                                    {r.name}
                                  </span>
                                  <span className="truncate text-xs text-muted-foreground">
                                    {r.tower}-{r.flatNumber}
                                  </span>
                                </span>
                              </span>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Moves this resident out of their current flat and into this one.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>

              {draftError && <p className="text-xs text-destructive">{draftError}</p>}

              <div className="flex items-center gap-2 self-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    resetDraft();
                    setShowAddForm(false);
                  }}
                >
                  Cancel
                </Button>
                <Button type="button" size="sm" className="gap-1.5" onClick={confirmAddResident}>
                  <Plus className="size-3.5" />
                  Add resident
                </Button>
              </div>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              className={cn("w-fit gap-1.5", pendingResidents.length === 0 && "self-start")}
              onClick={() => setShowAddForm(true)}
            >
              <Plus className="size-3.5" />
              Add resident
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-2 border-t border-border pt-4">
        {error ? <p className="text-xs text-destructive">{error}</p> : <span />}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/people-hub/flats")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={submitting} className="gap-1.5">
            <House className="size-3.5" />
            {submitting ? "Adding…" : "Add flat"}
          </Button>
        </div>
      </div>
    </form>
  );
}
