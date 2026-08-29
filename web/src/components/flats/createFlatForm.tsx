"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { House } from "lucide-react";

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
import { flats, type FlatType } from "@/lib/flatsMockData";

const FLAT_TYPES: FlatType[] = ["1BHK", "2BHK", "3BHK", "4BHK"];

export function CreateFlatForm() {
  const router = useRouter();
  const [flatNumber, setFlatNumber] = React.useState("");
  const [tower, setTower] = React.useState("");
  const [floor, setFloor] = React.useState("");
  const [type, setType] = React.useState<FlatType>("2BHK");
  const [areaSqft, setAreaSqft] = React.useState("");
  const [error, setError] = React.useState<string | undefined>();
  const [submitting, setSubmitting] = React.useState(false);

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
    flats.push({
      id: crypto.randomUUID(),
      flatNumber: flatNumber.trim(),
      tower: tower.trim().toUpperCase(),
      floor: floorNum,
      type,
      areaSqft: areaNum,
      occupancyStatus: "vacant",
      currentResidentIds: [],
    });
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
          <CardDescription>New flats start vacant — assign residents afterwards.</CardDescription>
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
