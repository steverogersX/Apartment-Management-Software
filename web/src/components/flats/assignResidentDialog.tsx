"use client";

import * as React from "react";
import { KeyRound, Mail, Phone, UserPlus } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import type { FlatOwnerContact } from "@/lib/flatsMockData";
import {
  isUnassignedResident,
  residents,
  type ResidentOccupancyType,
} from "@/lib/residentsMockData";
import { getInitials, gradientForName } from "@/lib/utils";

function mascotUrl(seed: string) {
  return `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(seed)}`;
}

function ResidentAvatar({ name, seed }: { name: string; seed: string }) {
  const [from, to] = gradientForName(name || seed);
  return (
    <Avatar size="sm">
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

export type NewResidentInput = {
  name: string;
  email: string;
  phone: string;
  occupancyType: ResidentOccupancyType;
};

export function AssignResidentDialog({
  open,
  onOpenChange,
  flatLabel,
  owner,
  onAssignNew,
  onAssignExisting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flatLabel: string;
  owner?: FlatOwnerContact | null;
  onAssignNew: (input: NewResidentInput) => void;
  onAssignExisting: (residentId: string) => void;
}) {
  const [kind, setKind] = React.useState<"new" | "existing">("new");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [occupancyType, setOccupancyType] = React.useState<ResidentOccupancyType>("owner");
  const [existingId, setExistingId] = React.useState("");
  const [error, setError] = React.useState<string | undefined>();

  function reset() {
    setKind("new");
    setName("");
    setEmail("");
    setPhone("");
    setOccupancyType("owner");
    setExistingId("");
    setError(undefined);
  }

  function handleAssign() {
    if (kind === "new") {
      if (!name.trim() || !email.trim() || !phone.trim()) {
        setError("Name, email and phone are required");
        return;
      }
      onAssignNew({ name: name.trim(), email: email.trim(), phone: phone.trim(), occupancyType });
    } else {
      if (!existingId) {
        setError("Select an existing resident");
        return;
      }
      onAssignExisting(existingId);
    }
    reset();
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Assign resident</DialogTitle>
          <DialogDescription>Move a resident into {flatLabel}.</DialogDescription>
        </DialogHeader>

        {owner && (
          <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/40 p-3">
            <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              <KeyRound className="size-3.5" />
              Owner on record for {flatLabel}
            </p>
            <div className="flex items-center gap-3">
              <Avatar size="sm">
                <AvatarFallback className="text-[10px] font-semibold">
                  {getInitials(owner.name)}
                </AvatarFallback>
              </Avatar>
              <span className="truncate text-sm font-medium text-foreground">{owner.name}</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Phone className="size-3.5 shrink-0" />
                {owner.phone}
              </span>
              <span className="flex items-center gap-1.5">
                <Mail className="size-3.5 shrink-0" />
                {owner.email}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              This flat is vacant but not unowned — assigning a resident here doesn&apos;t change
              who owns it, unless you mark them as Owner too.
            </p>
          </div>
        )}

        <Tabs value={kind} onValueChange={(v) => setKind(v as typeof kind)}>
          <TabsList>
            <TabsTrigger value="new">New resident</TabsTrigger>
            <TabsTrigger value="existing">Existing resident</TabsTrigger>
          </TabsList>

          <TabsContent value="new" className="animate-rise mt-4">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <ResidentAvatar name={name} seed={name || "new-resident"} />
                <p className="text-xs text-muted-foreground">
                  Profile picture is generated automatically from the name.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="assign-name">Full name</Label>
                  <Input
                    id="assign-name"
                    placeholder="Priya Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="assign-email">Email</Label>
                  <Input
                    id="assign-email"
                    type="email"
                    placeholder="priya@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="assign-phone">Phone</Label>
                  <Input
                    id="assign-phone"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Occupancy</Label>
                  <Select
                    value={occupancyType}
                    onValueChange={(v) => setOccupancyType(v as ResidentOccupancyType)}
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
              <Select value={existingId} onValueChange={(v) => setExistingId(v ?? "")}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a resident">
                    {(id: string) =>
                      residents.find((r) => r.id === id)?.name ?? "Select a resident"
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {/* Unassigned residents float to the top — they're who an admin is usually looking for here. */}
                  {[...residents]
                    .sort(
                      (a, b) => Number(isUnassignedResident(b)) - Number(isUnassignedResident(a)),
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
                              {isUnassignedResident(r)
                                ? "Unassigned"
                                : `${r.tower}-${r.flatNumber}`}
                            </span>
                          </span>
                        </span>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Moves this resident out of their current flat and into {flatLabel}.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {error && <p className="text-xs text-destructive">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              reset();
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button type="button" className="gap-1.5" onClick={handleAssign}>
            <UserPlus className="size-3.5" />
            Assign
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
