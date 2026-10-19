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
  computeInvoiceTotals,
  computeOutstandingBalance,
  type Invoice,
} from "@/lib/invoicingMockData";
import { recordPaymentSchema, type RecordPaymentInput } from "@/lib/duesMockData";
import { fieldError } from "@/lib/fieldError";

export function RecordPaymentForm({
  invoice,
  onSave,
  onCancel,
}: {
  invoice: Invoice;
  onSave: (values: RecordPaymentInput) => void;
  onCancel: () => void;
}) {
  const outstanding = computeOutstandingBalance(invoice);

  const form = useForm({
    defaultValues: {
      amount: outstanding,
      paymentMode: "UPI",
      paymentDate: new Date().toISOString().slice(0, 10) + "T00:00:00+05:30",
      remarks: "",
    } as unknown as RecordPaymentInput,
    validators: { onChange: recordPaymentSchema },
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
      <div className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
        Outstanding:{" "}
        <span className="font-medium text-foreground">₹{outstanding.toLocaleString("en-IN")}</span>{" "}
        · Total:{" "}
        <span className="font-medium text-foreground">
          ₹{computeInvoiceTotals(invoice).total.toLocaleString("en-IN")}
        </span>
      </div>

      <form.Field name="amount">
        {(field: any) => (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pay-amount">Amount</Label>
            <Input
              id="pay-amount"
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
            <p className="text-xs text-muted-foreground">
              Outstanding ₹{outstanding.toLocaleString("en-IN")}
            </p>
          </div>
        )}
      </form.Field>

      <form.Field name="paymentMode">
        {(field: any) => (
          <div className="flex flex-col gap-1.5">
            <Label>Payment mode</Label>
            <Select
              value={field.state.value}
              onValueChange={(v) => field.handleChange(v as RecordPaymentInput["paymentMode"])}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Cheque">Cheque</SelectItem>
                <SelectItem value="NEFT/RTGS">NEFT/RTGS</SelectItem>
                <SelectItem value="UPI">UPI</SelectItem>
                <SelectItem value="Card">Card</SelectItem>
                <SelectItem value="Online Gateway">Online Gateway</SelectItem>
              </SelectContent>
            </Select>
            {fieldError(field.state.meta.errors) && (
              <p className="text-xs text-destructive">{fieldError(field.state.meta.errors)}</p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field name="paymentDate">
        {(field: any) => (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pay-date">Payment date</Label>
            <DatePicker
              id="pay-date"
              value={field.state.value ? String(field.state.value).slice(0, 10) : ""}
              onChange={(val) => field.handleChange(val ? `${val}T00:00:00+05:30` : "")}
            />
            {fieldError(field.state.meta.errors) && (
              <p className="text-xs text-destructive">{fieldError(field.state.meta.errors)}</p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field name="remarks">
        {(field: any) => (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pay-remarks">Remarks</Label>
            <Textarea
              id="pay-remarks"
              value={field.state.value ?? ""}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              rows={2}
              placeholder="Optional"
            />
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
