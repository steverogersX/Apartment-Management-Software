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
import { addVoucherSchema, type AddVoucherInput } from "@/lib/vouchersMockData";
import { ledgerAccounts } from "@/lib/chartOfAccountsMockData";
import { fieldError } from "@/lib/fieldError";

export function AddVoucherForm({
  onSave,
  onCancel,
}: {
  onSave: (values: AddVoucherInput) => void;
  onCancel: () => void;
}) {
  const form = useForm({
    defaultValues: {
      type: "Payment",
      date: new Date().toISOString().slice(0, 10) + "T00:00:00+05:30",
      narration: "",
      debitAccountId: "",
      creditAccountId: "",
      amount: 0,
    } as unknown as AddVoucherInput,
    validators: { onChange: addVoucherSchema },
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
              <Select value={field.state.value} onValueChange={(v) => field.handleChange(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Payment">Payment</SelectItem>
                  <SelectItem value="Receipt">Receipt</SelectItem>
                  <SelectItem value="Journal">Journal</SelectItem>
                  <SelectItem value="Contra">Contra</SelectItem>
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
              <Label htmlFor="vch-date">Date</Label>
              <DatePicker
                id="vch-date"
                value={field.state.value ? String(field.state.value).slice(0, 10) : ""}
                onChange={(val) => field.handleChange(val ? `${val}T00:00:00+05:30` : "")}
              />
              {fieldError(field.state.meta.errors) && (
                <p className="text-xs text-destructive">{fieldError(field.state.meta.errors)}</p>
              )}
            </div>
          )}
        </form.Field>

        <form.Field name="debitAccountId">
          {(field: any) => (
            <div className="flex flex-col gap-1.5">
              <Label>Debit account</Label>
              <form.Subscribe selector={(s: any) => s.values.creditAccountId}>
                {(creditId: string) => (
                  <Select value={field.state.value} onValueChange={(v) => field.handleChange(v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select debit account" />
                    </SelectTrigger>
                    <SelectContent>
                      {ledgerAccounts
                        .filter((a) => a.id !== creditId)
                        .map((a) => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.name} · {a.type}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}
              </form.Subscribe>
              {fieldError(field.state.meta.errors) && (
                <p className="text-xs text-destructive">{fieldError(field.state.meta.errors)}</p>
              )}
            </div>
          )}
        </form.Field>

        <form.Field name="creditAccountId">
          {(field: any) => (
            <div className="flex flex-col gap-1.5">
              <Label>Credit account</Label>
              <form.Subscribe selector={(s: any) => s.values.debitAccountId}>
                {(debitId: string) => (
                  <Select value={field.state.value} onValueChange={(v) => field.handleChange(v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select credit account" />
                    </SelectTrigger>
                    <SelectContent>
                      {ledgerAccounts
                        .filter((a) => a.id !== debitId)
                        .map((a) => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.name} · {a.type}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}
              </form.Subscribe>
              {fieldError(field.state.meta.errors) && (
                <p className="text-xs text-destructive">{fieldError(field.state.meta.errors)}</p>
              )}
            </div>
          )}
        </form.Field>

        <form.Field name="amount">
          {(field: any) => (
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="vch-amount">Amount</Label>
              <Input
                id="vch-amount"
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

      <form.Field name="narration">
        {(field: any) => (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="vch-narration">Narration</Label>
            <Textarea
              id="vch-narration"
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
              {isSubmitting ? "Creating…" : "Create voucher"}
            </Button>
          </div>
        )}
      </form.Subscribe>
    </form>
  );
}
