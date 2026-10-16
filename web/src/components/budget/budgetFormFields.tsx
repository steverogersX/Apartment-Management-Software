"use client";

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
import { ledgerAccounts } from "@/lib/chartOfAccountsMockData";
import { MONTHS_FY, type BudgetPlanningMode } from "@/lib/budgetMockData";
import { formatCurrency } from "@/lib/utils";
import { fieldError } from "@/lib/fieldError";

export function BudgetFormFields({ form }: { form: any }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <form.Field name="name">
          {(field: any) => (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="budget-name">Head name</Label>
              <Input
                id="budget-name"
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

        <form.Field name="ledgerAccountId">
          {(field: any) => (
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label>Ledger account</Label>
              <Select value={field.state.value} onValueChange={(v) => field.handleChange(v ?? "")}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select ledger account" />
                </SelectTrigger>
                <SelectContent>
                  {ledgerAccounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                &quot;Actual&quot; for this head is the sum of posted vouchers against this ledger.
              </p>
              {fieldError(field.state.meta.errors) && (
                <p className="text-xs text-destructive">{fieldError(field.state.meta.errors)}</p>
              )}
            </div>
          )}
        </form.Field>
      </div>

      <form.Field name="planningMode">
        {(modeField: any) => (
          <form.Field name="monthlyPlanned">
            {(monthlyField: any) => (
              <form.Field name="plannedAmount">
                {(plannedField: any) => {
                  const mode: BudgetPlanningMode = modeField.state.value;
                  const monthly: number[] = monthlyField.state.value;

                  function setMonthValue(i: number, value: number) {
                    const next = [...monthly];
                    next[i] = value;
                    monthlyField.handleChange(next);
                    plannedField.handleChange(next.reduce((sum: number, v: number) => sum + v, 0));
                  }

                  return (
                    <div className="flex flex-col gap-3 rounded-md border border-border p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Label>Planned amount</Label>
                        <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
                          <Button
                            type="button"
                            size="sm"
                            variant={mode === "annual" ? "secondary" : "ghost"}
                            onClick={() => modeField.handleChange("annual")}
                          >
                            Annual total
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant={mode === "monthly" ? "secondary" : "ghost"}
                            onClick={() => modeField.handleChange("monthly")}
                          >
                            Month by month
                          </Button>
                        </div>
                      </div>

                      {mode === "annual" ? (
                        <Input
                          id="budget-planned"
                          type="number"
                          value={plannedField.state.value}
                          onBlur={plannedField.handleBlur}
                          onChange={(e) =>
                            plannedField.handleChange(
                              e.target.value === "" ? 0 : Number(e.target.value),
                            )
                          }
                          aria-invalid={plannedField.state.meta.errors.length > 0}
                        />
                      ) : (
                        <>
                          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
                            {MONTHS_FY.map((m, i) => (
                              <div key={m} className="flex flex-col gap-1">
                                <Label className="text-xs text-muted-foreground">{m}</Label>
                                <Input
                                  type="number"
                                  value={monthly[i] ?? 0}
                                  onChange={(e) =>
                                    setMonthValue(
                                      i,
                                      e.target.value === "" ? 0 : Number(e.target.value),
                                    )
                                  }
                                />
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Total planned:{" "}
                            <span className="font-medium text-foreground">
                              {formatCurrency(plannedField.state.value)}
                            </span>
                          </p>
                        </>
                      )}
                      {fieldError(plannedField.state.meta.errors) && (
                        <p className="text-xs text-destructive">
                          {fieldError(plannedField.state.meta.errors)}
                        </p>
                      )}
                    </div>
                  );
                }}
              </form.Field>
            )}
          </form.Field>
        )}
      </form.Field>
    </div>
  );
}
