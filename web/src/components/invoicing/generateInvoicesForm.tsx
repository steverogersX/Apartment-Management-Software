"use client";

import * as React from "react";
import { useForm } from "@tanstack/react-form";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/datePicker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { additionalCharges, billingRateSettings, gstSettings } from "@/lib/billingSettingsMockData";
import { flats, getTowers } from "@/lib/flatsMockData";
import { generateInvoicesSchema, type GenerateInvoicesInput } from "@/lib/invoicingMockData";
import { fieldError } from "@/lib/fieldError";
import { FlatCheckboxGrid } from "@/components/flats/flatCheckboxGrid";

function computeMaintenanceForFlat(flat: { areaSqft: number }) {
  const { method, equalSplitAmount, ratePerSqft } = billingRateSettings;
  if (method === "Equal Split") return equalSplitAmount;
  if (method === "Per Sqft") return Math.round(ratePerSqft * flat.areaSqft);
  return Math.round(equalSplitAmount + ratePerSqft * flat.areaSqft);
}

export function GenerateInvoicesForm({
  onSave,
  onCancel,
}: {
  onSave: (values: GenerateInvoicesInput) => void;
  onCancel: () => void;
}) {
  const sinkingDefault =
    additionalCharges.find((c) => c.name === "Sinking Fund")?.defaultAmount ?? 0;
  const parkingDefault = additionalCharges.find((c) => c.name === "Parking")?.defaultAmount ?? 0;

  const [selectedFlatIds, setSelectedFlatIds] = React.useState<string[]>([]);

  const form = useForm({
    defaultValues: {
      billingPeriod: "",
      dueDate: "",
      maintenanceAmount: billingRateSettings.equalSplitAmount,
      sinkingFundAmount: sinkingDefault,
      parkingAmount: parkingDefault,
      gstRate: gstSettings.gstApplicable ? gstSettings.gstRate : 0,
      selectedFlatIds: [] as string[],
    } as unknown as GenerateInvoicesInput,
    validators: { onChange: generateInvoicesSchema },
    onSubmit: async ({ value }) => {
      onSave({ ...value, selectedFlatIds });
    },
  });

  function updateMaintenanceForSelection(nextIds: string[]) {
    if (nextIds.length === 0) return;
    const firstFlat = flats.find((f) => f.id === nextIds[0]);
    if (!firstFlat) return;
    const computed = computeMaintenanceForFlat(firstFlat);
    form.setFieldValue("maintenanceAmount", computed as any);
  }

  function toggleFlat(id: string, checked: boolean) {
    setSelectedFlatIds((prev) => {
      const next = checked ? [...prev, id] : prev.filter((f) => f !== id);
      form.setFieldValue("selectedFlatIds", next as any);
      updateMaintenanceForSelection(next);
      return next;
    });
  }

  function selectAll() {
    const all = flats.map((f) => f.id);
    setSelectedFlatIds(all);
    form.setFieldValue("selectedFlatIds", all as any);
    updateMaintenanceForSelection(all);
  }

  function selectTower(tower: string) {
    const ids = flats.filter((f) => f.tower === tower).map((f) => f.id);
    setSelectedFlatIds((prev) => {
      const set = new Set(prev);
      ids.forEach((id) => set.add(id));
      const next = Array.from(set);
      form.setFieldValue("selectedFlatIds", next as any);
      updateMaintenanceForSelection(next);
      return next;
    });
  }

  function clearAll() {
    setSelectedFlatIds([]);
    form.setFieldValue("selectedFlatIds", [] as any);
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
      className="flex flex-col gap-4"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <form.Field name="billingPeriod">
          {(field: any) => (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="inv-billing">Billing period</Label>
              <Input
                id="inv-billing"
                placeholder="May 2026"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                aria-invalid={field.state.meta.errors.length > 0}
              />
              {fieldError(field.state.meta.errors) && (
                <p className="text-xs text-destructive">{fieldError(field.state.meta.errors)}</p>
              )}
            </div>
          )}
        </form.Field>

        <form.Field name="dueDate">
          {(field: any) => (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="inv-due">Due date</Label>
              <DatePicker
                id="inv-due"
                value={field.state.value ? String(field.state.value).slice(0, 10) : ""}
                onChange={(val) => field.handleChange(val ? `${val}T00:00:00+05:30` : "")}
              />
              {fieldError(field.state.meta.errors) && (
                <p className="text-xs text-destructive">{fieldError(field.state.meta.errors)}</p>
              )}
            </div>
          )}
        </form.Field>

        <form.Field name="maintenanceAmount">
          {(field: any) => (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="inv-maint">Maintenance amount</Label>
              <Input
                id="inv-maint"
                type="number"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) =>
                  field.handleChange(e.target.value === "" ? 0 : Number(e.target.value))
                }
                aria-invalid={field.state.meta.errors.length > 0}
              />
              {fieldError(field.state.meta.errors) && (
                <p className="text-xs text-destructive">{fieldError(field.state.meta.errors)}</p>
              )}
            </div>
          )}
        </form.Field>

        <form.Field name="sinkingFundAmount">
          {(field: any) => (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="inv-sinking">Sinking fund (optional)</Label>
              <Input
                id="inv-sinking"
                type="number"
                value={field.state.value ?? 0}
                onBlur={field.handleBlur}
                onChange={(e) =>
                  field.handleChange(e.target.value === "" ? 0 : Number(e.target.value))
                }
              />
            </div>
          )}
        </form.Field>

        <form.Field name="parkingAmount">
          {(field: any) => (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="inv-parking">Parking (optional)</Label>
              <Input
                id="inv-parking"
                type="number"
                value={field.state.value ?? 0}
                onBlur={field.handleBlur}
                onChange={(e) =>
                  field.handleChange(e.target.value === "" ? 0 : Number(e.target.value))
                }
              />
            </div>
          )}
        </form.Field>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Flats</Label>
        <div className="flex flex-wrap gap-1.5">
          <Button type="button" variant="outline" size="sm" onClick={selectAll}>
            All flats
          </Button>
          {getTowers().map((t) => (
            <Button
              key={t}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => selectTower(t)}
            >
              Tower {t}
            </Button>
          ))}
          <Button type="button" variant="ghost" size="sm" onClick={clearAll}>
            Clear
          </Button>
        </div>
        <FlatCheckboxGrid
          flats={flats}
          isChecked={(f) => selectedFlatIds.includes(f.id)}
          onToggle={(f, checked) => toggleFlat(f.id, checked)}
        />
        <form.Field name="selectedFlatIds">
          {(field: any) => (
            <>
              {fieldError(field.state.meta.errors) && (
                <p className="text-xs text-destructive">{fieldError(field.state.meta.errors)}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {selectedFlatIds.length} flat{selectedFlatIds.length === 1 ? "" : "s"} selected
              </p>
            </>
          )}
        </form.Field>
      </div>

      <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
        {([canSubmit, isSubmitting]) => (
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!canSubmit || isSubmitting || selectedFlatIds.length === 0}
            >
              {isSubmitting
                ? "Generating…"
                : `Generate ${selectedFlatIds.length} invoice${selectedFlatIds.length === 1 ? "" : "s"}`}
            </Button>
          </div>
        )}
      </form.Subscribe>
    </form>
  );
}
