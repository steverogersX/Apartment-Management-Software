"use client";

import * as React from "react";
import { useForm } from "@tanstack/react-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addParkingSlotSchema, type AddParkingSlotInput } from "@/lib/parkingMockData";

const NEW_ZONE = "__new__";

function fieldError(errors: unknown[]): string | undefined {
  if (errors.length === 0) return undefined;
  const issue = errors[0];
  if (typeof issue === "string") return issue;
  if (issue && typeof issue === "object" && "message" in issue) {
    return String((issue as { message: unknown }).message);
  }
  return String(issue);
}

export function CreateParkingSlotForm({
  onSave,
  onCancel,
  existingSlotNumbers,
  existingZones,
}: {
  onSave: (values: AddParkingSlotInput) => void;
  onCancel: () => void;
  existingSlotNumbers: string[];
  existingZones: string[];
}) {
  const [newZone, setNewZone] = React.useState("");
  const [newZoneError, setNewZoneError] = React.useState<string | undefined>(undefined);

  const schema = React.useMemo(
    () =>
      addParkingSlotSchema.superRefine((values, ctx) => {
        const taken = existingSlotNumbers.some(
          (n) => n.trim().toLowerCase() === values.slotNumber.trim().toLowerCase(),
        );
        if (taken) {
          ctx.addIssue({
            code: "custom",
            path: ["slotNumber"],
            message: "A slot with this number already exists",
          });
        }
      }),
    [existingSlotNumbers],
  );

  const form = useForm({
    defaultValues: {
      slotNumber: "",
      zone: existingZones[0] ?? "",
      vehicleType: "car",
    } as AddParkingSlotInput,
    validators: { onChange: schema },
    onSubmit: async ({ value }) => {
      const zone = value.zone === NEW_ZONE ? newZone.trim() : value.zone;
      if (!zone) {
        setNewZoneError("Zone name is required");
        return;
      }
      onSave({ ...value, zone });
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
      className="flex flex-col gap-4"
    >
      <form.Field name="slotNumber">
        {(field) => (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="slot-number">Slot number</Label>
            <Input
              id="slot-number"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="D-01"
              aria-invalid={field.state.meta.errors.length > 0}
            />
            {fieldError(field.state.meta.errors) && (
              <p className="text-xs text-destructive">{fieldError(field.state.meta.errors)}</p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field name="zone">
        {(field) => (
          <div className="flex flex-col gap-1.5">
            <Label>Zone</Label>
            <Select value={field.state.value} onValueChange={(v) => field.handleChange(v ?? "")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a zone" />
              </SelectTrigger>
              <SelectContent>
                {existingZones.map((zone) => (
                  <SelectItem key={zone} value={zone}>
                    {zone}
                  </SelectItem>
                ))}
                <SelectItem value={NEW_ZONE}>+ Add new zone</SelectItem>
              </SelectContent>
            </Select>
            {fieldError(field.state.meta.errors) && (
              <p className="text-xs text-destructive">{fieldError(field.state.meta.errors)}</p>
            )}
            {field.state.value === NEW_ZONE && (
              <div className="flex flex-col gap-1.5">
                <Input
                  value={newZone}
                  onChange={(e) => {
                    setNewZone(e.target.value);
                    if (newZoneError) setNewZoneError(undefined);
                  }}
                  placeholder="New zone name"
                  aria-invalid={newZoneError !== undefined}
                />
                {newZoneError && <p className="text-xs text-destructive">{newZoneError}</p>}
              </div>
            )}
          </div>
        )}
      </form.Field>

      <form.Field name="vehicleType">
        {(field) => (
          <div className="flex flex-col gap-1.5">
            <Label>Vehicle type</Label>
            <Select
              value={field.state.value}
              onValueChange={(v) =>
                field.handleChange((v ?? "car") as AddParkingSlotInput["vehicleType"])
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="car">Car</SelectItem>
                <SelectItem value="two_wheeler">Two-wheeler</SelectItem>
              </SelectContent>
            </Select>
            {fieldError(field.state.meta.errors) && (
              <p className="text-xs text-destructive">{fieldError(field.state.meta.errors)}</p>
            )}
          </div>
        )}
      </form.Field>

      <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
        {([canSubmit, isSubmitting]) => (
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? "Adding…" : "Add slot"}
            </Button>
          </div>
        )}
      </form.Subscribe>
    </form>
  );
}
