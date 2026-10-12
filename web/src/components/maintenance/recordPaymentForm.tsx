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
import {
  recordMaintenancePaymentSchema,
  type RecordMaintenancePaymentInput,
} from "@/lib/maintenanceMockData";

function fieldError(errors: unknown[]): string | undefined {
  if (errors.length === 0) return undefined;
  const issue = errors[0];
  if (typeof issue === "string") return issue;
  if (issue && typeof issue === "object" && "message" in issue) {
    return String((issue as { message: unknown }).message);
  }
  return String(issue);
}

export function RecordPaymentForm({
  onSave,
  onCancel,
}: {
  onSave: (values: RecordMaintenancePaymentInput) => void;
  onCancel: () => void;
}) {
  const form = useForm({
    defaultValues: {
      paidDate: new Date().toISOString().slice(0, 10),
      paidMode: "UPI",
      receiptNumber: "",
    } as RecordMaintenancePaymentInput,
    validators: { onChange: recordMaintenancePaymentSchema },
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
      <form.Field name="paidDate">
        {(field: any) => (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="payment-date">Paid on</Label>
            <DatePicker
              id="payment-date"
              value={field.state.value}
              onChange={(val) => field.handleChange(val)}
            />
            {fieldError(field.state.meta.errors) && (
              <p className="text-xs text-destructive">{fieldError(field.state.meta.errors)}</p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field name="paidMode">
        {(field: any) => (
          <div className="flex flex-col gap-1.5">
            <Label>Payment mode</Label>
            <Select
              value={field.state.value}
              onValueChange={(v) =>
                field.handleChange(v as RecordMaintenancePaymentInput["paidMode"])
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UPI">UPI</SelectItem>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                <SelectItem value="Cheque">Cheque</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </form.Field>

      <form.Field name="receiptNumber">
        {(field: any) => (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="payment-receipt">Receipt number</Label>
            <Input
              id="payment-receipt"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="e.g. RCPT-2026-0601"
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
              {isSubmitting ? "Saving…" : "Record payment"}
            </Button>
          </div>
        )}
      </form.Subscribe>
    </form>
  );
}
