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
import {
  addLedgerAccountSchema,
  type AccountGroup,
  type AddLedgerAccountInput,
} from "@/lib/chartOfAccountsMockData";

function fieldError(errors: unknown[]): string | undefined {
  if (errors.length === 0) return undefined;
  const issue = errors[0];
  if (typeof issue === "string") return issue;
  if (issue && typeof issue === "object" && "message" in issue)
    return String((issue as { message: unknown }).message);
  return String(issue);
}

const LEDGER_TYPES = ["Asset", "Liability", "Income", "Expense", "Bank", "Cash"] as const;

export function AddLedgerAccountForm({
  groups,
  onSave,
  onCancel,
}: {
  groups: AccountGroup[];
  onSave: (values: AddLedgerAccountInput) => void;
  onCancel: () => void;
}) {
  const form = useForm({
    defaultValues: {
      name: "",
      type: "Expense",
      groupId: "",
    } as unknown as AddLedgerAccountInput,
    validators: { onChange: addLedgerAccountSchema },
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
      <form.Field name="name">
        {(field: any) => (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="la-name">Name</Label>
            <Input
              id="la-name"
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
                  {LEDGER_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
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

        <form.Field name="groupId">
          {(field: any) => (
            <div className="flex flex-col gap-1.5">
              <Label>Group</Label>
              <Select value={field.state.value} onValueChange={(v) => field.handleChange(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select group" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.parentGroupId ? `↳ ${g.name}` : g.name}
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
              {isSubmitting ? "Creating…" : "Create account"}
            </Button>
          </div>
        )}
      </form.Subscribe>
    </form>
  );
}
