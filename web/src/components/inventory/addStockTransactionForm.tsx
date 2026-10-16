"use client";

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
import { Textarea } from "@/components/ui/textarea";
import { addStockTransactionSchema, type AddStockTransactionInput } from "@/lib/inventoryMockData";
import { fieldError } from "@/lib/fieldError";

export function AddStockTransactionForm({
  onSave,
  onCancel,
}: {
  onSave: (values: AddStockTransactionInput) => void;
  onCancel: () => void;
}) {
  const form = useForm({
    defaultValues: {
      type: "Stock In",
      quantity: 1,
      reason: "",
      allottedTo: "",
    } as unknown as AddStockTransactionInput,
    validators: { onChange: addStockTransactionSchema },
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
                onValueChange={(v) => field.handleChange(v as AddStockTransactionInput["type"])}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Stock In">Stock In</SelectItem>
                  <SelectItem value="Stock Out">Stock Out</SelectItem>
                  <SelectItem value="Staff Allotment">Staff Allotment</SelectItem>
                </SelectContent>
              </Select>
              {fieldError(field.state.meta.errors) && (
                <p className="text-xs text-destructive">{fieldError(field.state.meta.errors)}</p>
              )}
            </div>
          )}
        </form.Field>

        <form.Field name="quantity">
          {(field: any) => (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="txn-quantity">Quantity</Label>
              <Input
                id="txn-quantity"
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
      </div>

      <form.Field name="reason">
        {(field: any) => (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="txn-reason">Reason</Label>
            <Textarea
              id="txn-reason"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              rows={2}
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
          field.state.value === "Staff Allotment" ? (
            <form.Field name="allottedTo">
              {(allottedField: any) => (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="txn-allotted">Allotted to</Label>
                  <Input
                    id="txn-allotted"
                    value={allottedField.state.value ?? ""}
                    onBlur={allottedField.handleBlur}
                    onChange={(e) => allottedField.handleChange(e.target.value)}
                    placeholder="Staff name"
                  />
                  {fieldError(allottedField.state.meta.errors) && (
                    <p className="text-xs text-destructive">
                      {fieldError(allottedField.state.meta.errors)}
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
              {isSubmitting ? "Saving…" : "Record transaction"}
            </Button>
          </div>
        )}
      </form.Subscribe>
    </form>
  );
}
