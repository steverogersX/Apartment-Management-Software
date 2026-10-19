"use client";

import { useForm } from "@tanstack/react-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FlatSelect } from "@/components/flats/flatSelect";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addVehicleSchema, flats, type AddVehicleInput } from "@/lib/flatsMockData";
import { residents } from "@/lib/residentsMockData";
import { fieldError } from "@/lib/fieldError";

export function CreateVehicleForm({
  onSave,
  onCancel,
  existingRegistrationNumbers,
}: {
  onSave: (values: AddVehicleInput) => void;
  onCancel: () => void;
  existingRegistrationNumbers: string[];
}) {
  const schema = addVehicleSchema.superRefine((values, ctx) => {
    const taken = existingRegistrationNumbers.some(
      (n) => n.trim().toLowerCase() === values.registrationNumber.trim().toLowerCase(),
    );
    if (taken) {
      ctx.addIssue({
        code: "custom",
        path: ["registrationNumber"],
        message: "A vehicle with this registration number already exists",
      });
    }
  });

  const form = useForm({
    defaultValues: {
      flatId: "",
      residentId: "",
      registrationNumber: "",
      type: "car",
      make: "",
      model: "",
      color: "",
    } as AddVehicleInput,
    validators: { onChange: schema },
    onSubmit: async ({ value }) => {
      onSave(value);
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
      <form.Field name="flatId">
        {(field) => (
          <div className="flex flex-col gap-1.5">
            <Label>Flat</Label>
            <FlatSelect
              flats={flats}
              value={field.state.value}
              onValueChange={(v) => {
                field.handleChange(v);
                form.setFieldValue("residentId", "");
              }}
            />
            {fieldError(field.state.meta.errors) && (
              <p className="text-xs text-destructive">{fieldError(field.state.meta.errors)}</p>
            )}
          </div>
        )}
      </form.Field>

      <form.Subscribe selector={(state) => state.values.flatId}>
        {(flatId) => {
          const residentsForFlat = residents.filter((r) => r.flatId === flatId);
          return (
            <form.Field name="residentId">
              {(field) =>
                flatId && residentsForFlat.length === 0 ? (
                  <div className="flex flex-col gap-1.5">
                    <Label>Owner</Label>
                    <p className="text-xs text-muted-foreground">This flat has no residents yet.</p>
                    {fieldError(field.state.meta.errors) && (
                      <p className="text-xs text-destructive">
                        {fieldError(field.state.meta.errors)}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    <Label>Owner</Label>
                    <Select
                      value={field.state.value}
                      onValueChange={(v) => field.handleChange(v ?? "")}
                      disabled={!flatId}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={flatId ? "Select an owner" : "Select a flat first"}
                        >
                          {(value: string) => {
                            const resident = residentsForFlat.find((r) => r.id === value);
                            return resident
                              ? resident.name
                              : flatId
                                ? "Select an owner"
                                : "Select a flat first";
                          }}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {residentsForFlat.map((resident) => (
                          <SelectItem key={resident.id} value={resident.id}>
                            {resident.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldError(field.state.meta.errors) && (
                      <p className="text-xs text-destructive">
                        {fieldError(field.state.meta.errors)}
                      </p>
                    )}
                  </div>
                )
              }
            </form.Field>
          );
        }}
      </form.Subscribe>

      <form.Field name="registrationNumber">
        {(field) => (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="vehicle-reg">Registration number</Label>
            <Input
              id="vehicle-reg"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="MH12 AB 1234"
              aria-invalid={field.state.meta.errors.length > 0}
            />
            {fieldError(field.state.meta.errors) && (
              <p className="text-xs text-destructive">{fieldError(field.state.meta.errors)}</p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field name="type">
        {(field) => (
          <div className="flex flex-col gap-1.5">
            <Label>Type</Label>
            <Select
              value={field.state.value}
              onValueChange={(v) => field.handleChange((v ?? "car") as AddVehicleInput["type"])}
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(value: string) => (value === "car" ? "Car" : "Two-wheeler")}
                </SelectValue>
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <form.Field name="make">
          {(field) => (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="vehicle-make">Make</Label>
              <Input
                id="vehicle-make"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Hyundai"
                aria-invalid={field.state.meta.errors.length > 0}
              />
              {fieldError(field.state.meta.errors) && (
                <p className="text-xs text-destructive">{fieldError(field.state.meta.errors)}</p>
              )}
            </div>
          )}
        </form.Field>

        <form.Field name="model">
          {(field) => (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="vehicle-model">Model</Label>
              <Input
                id="vehicle-model"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Creta"
                aria-invalid={field.state.meta.errors.length > 0}
              />
              {fieldError(field.state.meta.errors) && (
                <p className="text-xs text-destructive">{fieldError(field.state.meta.errors)}</p>
              )}
            </div>
          )}
        </form.Field>

        <form.Field name="color">
          {(field) => (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="vehicle-color">Color</Label>
              <Input
                id="vehicle-color"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="White"
                aria-invalid={field.state.meta.errors.length > 0}
              />
              {fieldError(field.state.meta.errors) && (
                <p className="text-xs text-destructive">{fieldError(field.state.meta.errors)}</p>
              )}
            </div>
          )}
        </form.Field>
      </div>

      <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
        {([canSubmit, isSubmitting]) => (
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? "Adding…" : "Add vehicle"}
            </Button>
          </div>
        )}
      </form.Subscribe>
    </form>
  );
}
