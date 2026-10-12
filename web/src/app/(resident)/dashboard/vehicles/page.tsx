"use client";

import * as React from "react";
import { Bike, Car, Plus, SquareParking, BadgeCheck, Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  myParkingSlots,
  myVehicles,
  parkingRequests,
  parkingRules,
  type MyVehicle,
  type MyVehicleType,
} from "@/lib/vehiclesMockData";
import { cn } from "@/lib/utils";
import { PageIcon } from "@/components/pageIcon";

function StickerBadge({ status }: { status: MyVehicle["stickerStatus"] }) {
  if (status === "active") {
    return (
      <Badge
        variant="outline"
        className="border-emerald-200 text-emerald-700 dark:border-emerald-800 dark:text-emerald-400"
      >
        <BadgeCheck className="size-3" />
        Sticker active
      </Badge>
    );
  }
  if (status === "pending") {
    return (
      <Badge
        variant="outline"
        className="border-amber-200 text-amber-700 dark:border-amber-800 dark:text-amber-400"
      >
        <Clock className="size-3" />
        Sticker pending
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-muted-foreground">
      Sticker expired
    </Badge>
  );
}

function AddVehicleDialog({ onAdd }: { onAdd: (v: MyVehicle) => void }) {
  const [open, setOpen] = React.useState(false);
  const [reg, setReg] = React.useState("");
  const [type, setType] = React.useState<MyVehicleType>("car");
  const [make, setMake] = React.useState("");
  const [model, setModel] = React.useState("");
  const [color, setColor] = React.useState("");

  const valid = reg.trim() !== "" && make.trim() !== "" && model.trim() !== "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    onAdd({
      id: `v-${Date.now()}`,
      registrationNumber: reg.trim().toUpperCase(),
      type,
      make: make.trim(),
      model: model.trim(),
      color: color.trim() || "—",
      parkingSlot: null,
      stickerStatus: "pending",
      isPrimary: false,
    });
    setOpen(false);
    setReg("");
    setType("car");
    setMake("");
    setModel("");
    setColor("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" className="gap-1.5" />}>
        <Plus className="size-4" />
        Add vehicle
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <DialogHeader>
            <DialogTitle>Register a vehicle</DialogTitle>
            <DialogDescription>Mock only — the guard approves the gate sticker.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="veh-reg">Registration number</Label>
              <Input
                id="veh-reg"
                placeholder="e.g. AP 31 BT 4521"
                value={reg}
                onChange={(e) => setReg(e.target.value)}
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as MyVehicleType)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="car">Car</SelectItem>
                    <SelectItem value="two_wheeler">Two-wheeler</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="veh-color">Color</Label>
                <Input
                  id="veh-color"
                  placeholder="e.g. White"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="veh-make">Make</Label>
                <Input
                  id="veh-make"
                  placeholder="e.g. Hyundai"
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="veh-model">Model</Label>
                <Input
                  id="veh-model"
                  placeholder="e.g. Creta"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
            <Button type="submit" disabled={!valid}>
              Save vehicle
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function RequestSlotDialog() {
  const [open, setOpen] = React.useState(false);
  const [vehicle, setVehicle] = React.useState("");
  const [preference, setPreference] = React.useState("Covered · Basement B");
  const [done, setDone] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicle) return;
    setDone(true);
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setTimeout(() => setDone(false), 200);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button size="sm" variant="outline" className="gap-1.5" />}>
        <SquareParking className="size-4" />
        Request slot
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {!done ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <DialogHeader>
              <DialogTitle>Request a parking slot</DialogTitle>
              <DialogDescription>
                Mock only — the parking coordinator allots slots.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>Vehicle</Label>
                <Select value={vehicle} onValueChange={(v) => setVehicle(v as string)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {myVehicles
                      .filter((v) => !v.parkingSlot)
                      .map((v) => (
                        <SelectItem key={v.id} value={v.registrationNumber}>
                          {v.registrationNumber} · {v.make} {v.model}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Preference</Label>
                <Select value={preference} onValueChange={(v) => setPreference(v as string)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Covered · Basement B">Covered · Basement B</SelectItem>
                    <SelectItem value="Open · Basement B">Open · Basement B</SelectItem>
                    <SelectItem value="Open · Visitor block">Open · Visitor block</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
              <Button type="submit" disabled={!vehicle}>
                Submit request
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="flex flex-col gap-5">
            <DialogHeader>
              <DialogTitle>Request submitted</DialogTitle>
              <DialogDescription>
                Slot {preference} requested for {vehicle}. You are next in the waitlist.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose render={<Button type="button" />}>Done</DialogClose>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = React.useState<MyVehicle[]>(myVehicles);
  const allotted = myParkingSlots.filter((s) => s.status === "allotted").length;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground">
            <PageIcon />
            Vehicles & Parking
          </h1>
          <p className="text-sm text-muted-foreground">
            Vehicles and slots for Flat 304 · Tower B.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <RequestSlotDialog />
          <AddVehicleDialog onAdd={(v) => setVehicles((prev) => [...prev, v])} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card className="rounded-md py-3.5">
          <CardContent className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <Car className="size-4" />
            </span>
            <div>
              <p className="text-xl font-semibold text-foreground">{vehicles.length}</p>
              <p className="text-xs text-muted-foreground">My vehicles</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-md py-3.5">
          <CardContent className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <SquareParking className="size-4" />
            </span>
            <div>
              <p className="text-xl font-semibold text-foreground">{allotted}</p>
              <p className="text-xs text-muted-foreground">Allotted slots</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-md py-3.5">
          <CardContent className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <Clock className="size-4" />
            </span>
            <div>
              <p className="text-xl font-semibold text-foreground">{parkingRequests.length}</p>
              <p className="text-xs text-muted-foreground">Pending requests</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="vehicles">
        <TabsList>
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
          <TabsTrigger value="parking">Parking</TabsTrigger>
        </TabsList>

        <TabsContent value="vehicles">
          <div className="overflow-hidden rounded-md border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="h-9 bg-muted/40 px-4 text-xs font-medium text-muted-foreground">
                    Vehicle
                  </TableHead>
                  <TableHead className="h-9 bg-muted/40 px-4 text-xs font-medium text-muted-foreground">
                    Registration
                  </TableHead>
                  <TableHead className="h-9 bg-muted/40 px-4 text-xs font-medium text-muted-foreground">
                    Slot
                  </TableHead>
                  <TableHead className="h-9 bg-muted/40 px-4 text-xs font-medium text-muted-foreground">
                    Sticker
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicles.map((v) => {
                  const Icon = v.type === "car" ? Car : Bike;
                  return (
                    <TableRow key={v.id} className="border-border hover:bg-muted/50">
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <span className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
                            <Icon className="size-4" />
                          </span>
                          <span className="flex flex-col">
                            <span className="font-medium text-foreground">
                              {v.make} {v.model}
                              {v.isPrimary && (
                                <Badge variant="secondary" className="ml-2">
                                  Primary
                                </Badge>
                              )}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {v.color} · {v.type === "car" ? "Car" : "Two-wheeler"}
                            </span>
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 font-mono text-xs font-medium tabular-nums text-foreground">
                        {v.registrationNumber}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        {v.parkingSlot ? (
                          <Badge variant="outline" className="font-mono">
                            {v.parkingSlot}
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <StickerBadge status={v.stickerStatus} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="parking" className="flex flex-col gap-3">
          <div className="overflow-hidden rounded-md border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="h-9 bg-muted/40 px-4 text-xs font-medium text-muted-foreground">
                    Slot
                  </TableHead>
                  <TableHead className="h-9 bg-muted/40 px-4 text-xs font-medium text-muted-foreground">
                    Linked vehicle
                  </TableHead>
                  <TableHead className="h-9 bg-muted/40 px-4 text-xs font-medium text-muted-foreground">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myParkingSlots.map((s) => (
                  <TableRow key={s.id} className="border-border hover:bg-muted/50">
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
                          <SquareParking className="size-4" />
                        </span>
                        <span className="flex flex-col">
                          <span className={cn("font-mono text-sm font-semibold text-foreground")}>
                            {s.slotNumber}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {s.zone} · {s.slotType === "covered" ? "Covered" : "Open"}
                          </span>
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 font-mono text-xs tabular-nums text-foreground">
                      {s.vehicleReg ?? "—"}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className="border-emerald-200 text-emerald-700 dark:border-emerald-800 dark:text-emerald-400"
                      >
                        Allotted
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Card className="rounded-md">
            <CardContent className="flex flex-col gap-2.5 py-3.5">
              <p className="text-sm font-semibold text-foreground">Pending requests</p>
              {parkingRequests.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between gap-3 rounded-md bg-muted/50 px-3 py-2.5"
                >
                  <div>
                    <p className="font-mono text-xs font-medium text-foreground">{r.vehicleReg}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.preference} · requested {r.requestedOn}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-amber-200 text-amber-700 dark:border-amber-800 dark:text-amber-400"
                  >
                    <Clock className="size-3" />
                    Pending
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-md">
            <CardContent className="flex flex-col gap-2 py-3.5">
              <p className="text-sm font-semibold text-foreground">Parking rules</p>
              <ul className="flex flex-col gap-1.5">
                {parkingRules.map((rule) => (
                  <li key={rule} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 size-1 shrink-0 rounded-full bg-muted-foreground/60" />
                    {rule}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
