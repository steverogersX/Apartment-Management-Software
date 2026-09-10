"use client";

import { useForm } from "@tanstack/react-form";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/datePicker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { recordTopUpSchema, type RecordTopUpInput } from "@/lib/eventsMockData";

function fieldError(errors: unknown[]): string | undefined {
  if (errors.length === 0) return undefined;
  const issue = errors[0];
  if (typeof issue === "string") return issue;
  if (issue && typeof issue === "object" && "message" in issue) {
    return String((issue as { message: unknown }).message);
  }
  return String(issue);
}

export function RecordTopUpForm({
  pendingAmount,
  onSave,
  onCancel,
}: {
  pendingAmount: number;
  onSave: (values: RecordTopUpInput) => void;
  onCancel: () => void;
}) {
  const form = useForm({
    defaultValues: {
      amount: pendingAmount,
      note: "",
      date: new Date().toISOString().slice(0, 10),
    } as RecordTopUpInput,
    validators: { onChange: recordTopUpSchema },
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
      <p className="rounded-md bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
        Currently pending:{" "}
        <span className="font-medium text-foreground">
          ₹{pendingAmount.toLocaleString("en-IN")}
        </span>{" "}
        against the target. This records the society covering some or all of that gap — it does not
        move money in this mocked app.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <form.Field name="amount">
          {(field) => (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="topup-amount">Amount (₹)</Label>
              <Input
                id="topup-amount"
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

        <form.Field name="date">
          {(field) => (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="topup-date">Date</Label>
              <DatePicker
                id="topup-date"
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

      <form.Field name="note">
        {(field) => (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="topup-note">Note — source of funds</Label>
            <Textarea
              id="topup-note"
              placeholder="e.g. Drawn from society general fund to settle vendor payments"
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
              {isSubmitting ? "Recording…" : "Record top-up"}
            </Button>
          </div>
        )}
      </form.Subscribe>
    </form>
  );
}
