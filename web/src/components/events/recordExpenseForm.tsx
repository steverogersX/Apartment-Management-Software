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
import {
  EVENT_EXPENSE_CATEGORIES,
  recordExpenseSchema,
  type RecordExpenseInput,
} from "@/lib/eventsMockData";
import { fieldError } from "@/lib/fieldError";

export function RecordExpenseForm({
  onSave,
  onCancel,
}: {
  onSave: (values: RecordExpenseInput) => void;
  onCancel: () => void;
}) {
  const form = useForm({
    defaultValues: {
      category: "Pooja / Rituals",
      description: "",
      amount: 0,
      paidTo: "",
      date: new Date().toISOString().slice(0, 10),
    } as RecordExpenseInput,
    validators: { onChange: recordExpenseSchema },
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
        <form.Field name="category">
          {(field) => (
            <div className="flex flex-col gap-1.5">
              <Label>Category</Label>
              <Select
                value={field.state.value}
                onValueChange={(v) => field.handleChange(v as RecordExpenseInput["category"])}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_EXPENSE_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </form.Field>

        <form.Field name="amount">
          {(field) => (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="expense-amount">Amount (₹)</Label>
              <Input
                id="expense-amount"
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

        <form.Field name="paidTo">
          {(field) => (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="expense-paid-to">Paid to</Label>
              <Input
                id="expense-paid-to"
                placeholder="e.g. Pandit Raghunath Sharma"
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

        <form.Field name="date">
          {(field) => (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="expense-date">Date</Label>
              <DatePicker
                id="expense-date"
                value={field.state.value}
                onChange={(val) => field.handleChange(val)}
              />
              {fieldError(field.state.meta.errors) && (
                <p className="text-xs text-destructive">{fieldError(field.state.meta.errors)}</p>
              )}
            </div>
          )}
        </form.Field>
      </div>

      <form.Field name="description">
        {(field) => (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="expense-description">Description</Label>
            <Textarea
              id="expense-description"
              placeholder="e.g. Pooja charges — priest fees and ritual items"
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

      <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
        {([canSubmit, isSubmitting]) => (
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? "Recording…" : "Record expense"}
            </Button>
          </div>
        )}
      </form.Subscribe>
    </form>
  );
}
