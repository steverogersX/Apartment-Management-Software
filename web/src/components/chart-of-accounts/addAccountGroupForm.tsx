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
  addAccountGroupSchema,
  type AccountGroup,
  type AddAccountGroupInput,
} from "@/lib/chartOfAccountsMockData";
import { fieldError } from "@/lib/fieldError";

const GROUP_TYPES = [
  "Capital Account",
  "Current Assets",
  "Current Liabilities",
  "Fixed Assets",
  "Direct Income",
  "Indirect Income",
  "Direct Expenses",
  "Indirect Expenses",
] as const;

export function AddAccountGroupForm({
  groups,
  onSave,
  onCancel,
}: {
  groups: AccountGroup[];
  onSave: (values: AddAccountGroupInput) => void;
  onCancel: () => void;
}) {
  const topLevel = groups.filter((g) => g.parentGroupId === null);

  const form = useForm({
    defaultValues: {
      name: "",
      type: "Current Assets",
      parentGroupId: null,
    } as unknown as AddAccountGroupInput,
    validators: { onChange: addAccountGroupSchema },
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
            <Label htmlFor="grp-name">Name</Label>
            <Input
              id="grp-name"
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

      <form.Field name="parentGroupId">
        {(field: any) => (
          <div className="flex flex-col gap-1.5">
            <Label>Parent group</Label>
            <Select
              value={field.state.value ?? "none"}
              onValueChange={(v) => {
                const parent = topLevel.find((g) => g.id === v);
                field.handleChange(v === "none" ? null : v);
                if (parent) form.setFieldValue("type", parent.type as any);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="None (top-level group)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (top-level group)</SelectItem>
                {topLevel.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </form.Field>

      <form.Field name="type">
        {(field: any) => (
          <form.Subscribe selector={(s: any) => s.values.parentGroupId}>
            {(parentId: string | null) => (
              <div className="flex flex-col gap-1.5">
                <Label>Type{parentId ? " (inherited from parent)" : ""}</Label>
                <Select
                  value={field.state.value}
                  onValueChange={(v) => field.handleChange(v)}
                  disabled={!!parentId}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GROUP_TYPES.map((t) => (
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
          </form.Subscribe>
        )}
      </form.Field>

      <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
        {([canSubmit, isSubmitting]) => (
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? "Creating…" : "Create group"}
            </Button>
          </div>
        )}
      </form.Subscribe>
    </form>
  );
}
