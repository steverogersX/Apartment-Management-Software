"use client";

import { useForm } from "@tanstack/react-form";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addPurchaseRequestSchema, type AddPurchaseRequestInput } from "@/lib/purchasingMockData";
import { fieldError } from "@/lib/fieldError";

export function AddPurchaseRequestForm({
  onSave,
  onCancel,
}: {
  onSave: (values: AddPurchaseRequestInput) => void;
  onCancel: () => void;
}) {
  const form = useForm({
    defaultValues: {
      requestedBy: "",
      items: [{ description: "", quantity: 1, unit: "Pcs", estimatedUnitPrice: 0 }],
    } as AddPurchaseRequestInput,
    validators: { onChange: addPurchaseRequestSchema },
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
      <form.Field name="requestedBy">
        {(field: any) => (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pr-requested">Requested by</Label>
            <Input
              id="pr-requested"
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

      <form.Field name="items">
        {(field: any) => (
          <div className="flex flex-col gap-2">
            <Label>Items</Label>
            <div className="flex flex-col gap-2">
              {field.state.value.map((it: any, idx: number) => (
                <div key={idx} className="flex flex-col gap-2 rounded-md border border-border p-3">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <Input
                      value={it.description}
                      onChange={(e) => {
                        const next = [...field.state.value];
                        next[idx] = { ...next[idx], description: e.target.value };
                        field.handleChange(next);
                      }}
                      placeholder="Description"
                    />
                    <Input
                      value={it.unit}
                      onChange={(e) => {
                        const next = [...field.state.value];
                        next[idx] = { ...next[idx], unit: e.target.value };
                        field.handleChange(next);
                      }}
                      placeholder="Unit (Pcs, Kg...)"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <Input
                      type="number"
                      value={it.quantity}
                      onChange={(e) => {
                        const next = [...field.state.value];
                        next[idx] = { ...next[idx], quantity: Number(e.target.value) || 0 };
                        field.handleChange(next);
                      }}
                      placeholder="Quantity"
                    />
                    <Input
                      type="number"
                      value={it.estimatedUnitPrice}
                      onChange={(e) => {
                        const next = [...field.state.value];
                        next[idx] = {
                          ...next[idx],
                          estimatedUnitPrice: Number(e.target.value) || 0,
                        };
                        field.handleChange(next);
                      }}
                      placeholder="Unit price"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-fit gap-1.5 text-muted-foreground"
                    disabled={field.state.value.length <= 1}
                    onClick={() => {
                      const next = field.state.value.filter((_: any, i: number) => i !== idx);
                      field.handleChange(next);
                    }}
                  >
                    <Trash2 className="size-3.5" />
                    Remove
                  </Button>
                </div>
              ))}
            </div>
            {fieldError(field.state.meta.errors) && (
              <p className="text-xs text-destructive">{fieldError(field.state.meta.errors)}</p>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-fit gap-1.5"
              onClick={() =>
                field.handleChange([
                  ...field.state.value,
                  { description: "", quantity: 1, unit: "Pcs", estimatedUnitPrice: 0 },
                ])
              }
            >
              <Plus className="size-3.5" />
              Add item
            </Button>
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
              {isSubmitting ? "Creating…" : "Create request"}
            </Button>
          </div>
        )}
      </form.Subscribe>
    </form>
  );
}
