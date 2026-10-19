"use client";

import { useForm } from "@tanstack/react-form";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/datePicker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { addServiceLogSchema, type AddServiceLogInput } from "@/lib/assetsMockData";
import { fieldError } from "@/lib/fieldError";

export function AddServiceLogForm({
  assetId: _assetId,
  onSave,
  onCancel,
}: {
  assetId: string;
  onSave: (values: AddServiceLogInput) => void;
  onCancel: () => void;
}) {
  const form = useForm({
    defaultValues: {
      type: "Service",
      date: new Date().toISOString().slice(0, 10) + "T00:00:00+05:30",
      description: "",
      vendor: "",
      cost: undefined,
      newAmcExpiry: undefined,
    } as unknown as AddServiceLogInput,
    validators: { onChange: addServiceLogSchema },
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <form.Field name="type">
          {(field: any) => (
            <div className="flex flex-col gap-1.5">
              <Label>Type</Label>
              <Select
                value={field.state.value}
                onValueChange={(v) => field.handleChange(v as AddServiceLogInput["type"])}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Service">Service</SelectItem>
                  <SelectItem value="Repair">Repair</SelectItem>
                  <SelectItem value="Inspection">Inspection</SelectItem>
                  <SelectItem value="AMC Renewal">AMC Renewal</SelectItem>
                </SelectContent>
              </Select>
              {fieldError(field.state.meta.errors) && (
                <p className="text-xs text-destructive">{fieldError(field.state.meta.errors)}</p>
              )}
            </div>
          )}
        </form.Field>

        <form.Field name="date">
          {(field: any) => (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="service-date">Date</Label>
              <DatePicker
                id="service-date"
                value={field.state.value ? String(field.state.value).slice(0, 10) : ""}
                onChange={(val) => field.handleChange(val ? `${val}T00:00:00+05:30` : "")}
              />
              {fieldError(field.state.meta.errors) && (
                <p className="text-xs text-destructive">{fieldError(field.state.meta.errors)}</p>
              )}
            </div>
          )}
        </form.Field>

        <form.Field name="vendor">
          {(field: any) => (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="service-vendor">Vendor</Label>
              <Input
                id="service-vendor"
                value={field.state.value ?? ""}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Optional"
              />
              {fieldError(field.state.meta.errors) && (
                <p className="text-xs text-destructive">{fieldError(field.state.meta.errors)}</p>
              )}
            </div>
          )}
        </form.Field>

        <form.Field name="cost">
          {(field: any) => (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="service-cost">Cost</Label>
              <Input
                id="service-cost"
                type="number"
                value={field.state.value ?? ""}
                onBlur={field.handleBlur}
                onChange={(e) =>
                  field.handleChange(e.target.value === "" ? undefined : Number(e.target.value))
                }
                placeholder="Optional"
              />
              {fieldError(field.state.meta.errors) && (
                <p className="text-xs text-destructive">{fieldError(field.state.meta.errors)}</p>
              )}
            </div>
          )}
        </form.Field>
      </div>

      <form.Field name="description">
        {(field: any) => (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="service-description">Description</Label>
            <Textarea
              id="service-description"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              rows={3}
              placeholder="What was done?"
              aria-invalid={field.state.meta.errors.length > 0}
            />
            {fieldError(field.state.meta.errors) && (
              <p className="text-xs text-destructive">{fieldError(field.state.meta.errors)}</p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field name="type">
        {(field: any) =>
          field.state.value === "AMC Renewal" ? (
            <form.Field name="newAmcExpiry">
              {(expiryField: any) => (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="service-amc-expiry">New AMC expiry</Label>
                  <DatePicker
                    id="service-amc-expiry"
                    value={
                      expiryField.state.value ? String(expiryField.state.value).slice(0, 10) : ""
                    }
                    onChange={(val) =>
                      expiryField.handleChange(val ? `${val}T00:00:00+05:30` : undefined)
                    }
                  />
                  {fieldError(expiryField.state.meta.errors) && (
                    <p className="text-xs text-destructive">
                      {fieldError(expiryField.state.meta.errors)}
                    </p>
                  )}
                </div>
              )}
            </form.Field>
          ) : null
        }
      </form.Field>

      <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
        {([canSubmit, isSubmitting]) => (
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? "Saving…" : "Log service"}
            </Button>
          </div>
        )}
      </form.Subscribe>
    </form>
  );
}
