"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { EditBudgetHeadInput } from "@/lib/budgetMockData";

export function fieldError(errors: unknown[]): string | undefined {
  if (errors.length === 0) return undefined;
  const issue = errors[0];
  if (typeof issue === "string") return issue;
  if (issue && typeof issue === "object" && "message" in issue) {
    return String((issue as { message: unknown }).message);
  }
  return String(issue);
}

export function BudgetFormFields({ form }: { form: any }) {
  return (
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

      <form.Field name="type">
        {(field: any) => (
          <div className="flex flex-col gap-1.5">
            <Label>Type</Label>
            <Select
              value={field.state.value}
              onValueChange={(v) => field.handleChange(v as EditBudgetHeadInput["type"])}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Income">Income</SelectItem>
                <SelectItem value="Expense">Expense</SelectItem>
              </SelectContent>
            </Select>
            {fieldError(field.state.meta.errors) && (
              <p className="text-xs text-destructive">{fieldError(field.state.meta.errors)}</p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field name="plannedAmount">
        {(field: any) => (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="budget-planned">Planned amount</Label>
            <Input
              id="budget-planned"
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

      <form.Field name="actualAmount">
        {(field: any) => (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="budget-actual">Actual amount</Label>
            <Input
              id="budget-actual"
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
  );
}
