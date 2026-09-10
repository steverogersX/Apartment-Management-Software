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
import { ledgerAccounts } from "@/lib/chartOfAccountsMockData";
import { addInvestmentSchema, type AddInvestmentInput } from "@/lib/investmentRegisterMockData";
import { fieldError } from "@/components/assets/assetFormFields";

export function InvestmentForm({
  onSave,
  onCancel,
}: {
  onSave: (values: AddInvestmentInput) => void;
  onCancel: () => void;
}) {
  const form = useForm({
    defaultValues: {
      type: "Fixed Deposit",
      institution: "",
      investedAmount: 0,
      investmentDate: "",
      maturityDate: null,
      interestRate: 0,
      linkedLedgerAccountId: null,
    } as AddInvestmentInput,
    validators: { onChange: addInvestmentSchema },
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
                onValueChange={(v) => field.handleChange(v as AddInvestmentInput["type"])}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fixed Deposit">Fixed Deposit</SelectItem>
                  <SelectItem value="Bond">Bond</SelectItem>
                  <SelectItem value="Mutual Fund">Mutual Fund</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              {fieldError(field.state.meta.errors) && (
                <p className="text-xs text-destructive">{fieldError(field.state.meta.errors)}</p>
              )}
            </div>
          )}
        </form.Field>

        <form.Field name="institution">
          {(field: any) => (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="inv-inst">Institution</Label>
              <Input
                id="inv-inst"
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

        <form.Field name="investedAmount">
          {(field: any) => (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="inv-amount">Invested amount (₹)</Label>
              <Input
                id="inv-amount"
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

        <form.Field name="interestRate">
          {(field: any) => (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="inv-rate">Interest rate (% p.a.)</Label>
              <Input
                id="inv-rate"
                type="number"
                step="0.1"
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

        <form.Field name="investmentDate">
          {(field: any) => (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="inv-date">Investment date</Label>
              <DatePicker
                id="inv-date"
                value={field.state.value ? field.state.value.slice(0, 10) : ""}
                onChange={(val) => field.handleChange(val ? `${val}T00:00:00+05:30` : "")}
              />
              {fieldError(field.state.meta.errors) && (
                <p className="text-xs text-destructive">{fieldError(field.state.meta.errors)}</p>
              )}
            </div>
          )}
        </form.Field>

        <form.Field name="maturityDate">
          {(field: any) => (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="inv-maturity">Maturity date (optional)</Label>
              <DatePicker
                id="inv-maturity"
                value={field.state.value ? String(field.state.value).slice(0, 10) : ""}
                onChange={(val) => field.handleChange(val ? `${val}T00:00:00+05:30` : null)}
              />
              {fieldError(field.state.meta.errors) && (
                <p className="text-xs text-destructive">{fieldError(field.state.meta.errors)}</p>
              )}
            </div>
          )}
        </form.Field>

        <form.Field name="linkedLedgerAccountId">
          {(field: any) => (
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label>Linked ledger account (optional)</Label>
              <Select
                value={field.state.value ?? "none"}
                onValueChange={(v) => field.handleChange(v === "none" ? null : v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="No linked account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No linked account</SelectItem>
                  {ledgerAccounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              {isSubmitting ? "Adding…" : "Add investment"}
            </Button>
          </div>
        )}
      </form.Subscribe>
    </form>
  );
}
