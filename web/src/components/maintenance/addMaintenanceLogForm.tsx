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
  addMaintenanceLogSchema,
  MAINTENANCE_CATEGORIES,
  type AddMaintenanceLogInput,
} from "@/lib/maintenanceMockData";
import { staffMembers } from "@/lib/staffMockData";

function fieldError(errors: unknown[]): string | undefined {
  if (errors.length === 0) return undefined;
  const issue = errors[0];
  if (typeof issue === "string") return issue;
  if (issue && typeof issue === "object" && "message" in issue) {
    return String((issue as { message: unknown }).message);
  }
  return String(issue);
}

export function AddMaintenanceLogForm({
  onSave,
  onCancel,
}: {
  onSave: (values: AddMaintenanceLogInput) => void;
  onCancel: () => void;
}) {
  const activeStaff = staffMembers.filter((s) => s.status !== "inactive");

  const form = useForm({
    defaultValues: {
      scope: "flat",
      tower: "",
      flatNumber: "",
      location: "",
      category: "Plumbing",
      description: "",
      staffId: undefined,
      performedOn: new Date().toISOString().slice(0, 10),
      cost: undefined,
    } as unknown as AddMaintenanceLogInput,
    validators: { onChange: addMaintenanceLogSchema },
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
      <form.Field name="scope">
        {(field: any) => (
          <div className="flex flex-col gap-1.5">
            <Label>Scope</Label>
            <Select
              value={field.state.value}
              onValueChange={(v) => field.handleChange(v as AddMaintenanceLogInput["scope"])}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="flat">Flat</SelectItem>
                <SelectItem value="society">Society (common area)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </form.Field>

      <form.Subscribe selector={(state) => state.values.scope}>
        {(scope) =>
          scope === "flat" ? (
            <div className="grid grid-cols-2 gap-4">
              <form.Field name="tower">
                {(field: any) => (
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="maintenance-tower">Tower</Label>
                    <Input
                      id="maintenance-tower"
                      value={field.state.value ?? ""}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="e.g. B"
                    />
                  </div>
                )}
              </form.Field>
              <form.Field name="flatNumber">
                {(field: any) => (
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="maintenance-flat-number">Flat number</Label>
                    <Input
                      id="maintenance-flat-number"
                      value={field.state.value ?? ""}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="e.g. 304"
                    />
                  </div>
                )}
              </form.Field>
            </div>
          ) : (
            <form.Field name="location">
              {(field: any) => (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="maintenance-location">Location</Label>
                  <Input
                    id="maintenance-location"
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="e.g. Clubhouse Lift Lobby"
                  />
                  {fieldError(field.state.meta.errors) && (
                    <p className="text-xs text-destructive">
                      {fieldError(field.state.meta.errors)}
                    </p>
                  )}
                </div>
              )}
            </form.Field>
          )
        }
      </form.Subscribe>

      <div className="grid grid-cols-2 gap-4">
        <form.Field name="category">
          {(field: any) => (
            <div className="flex flex-col gap-1.5">
              <Label>Category</Label>
              <Select
                value={field.state.value}
                onValueChange={(v) => field.handleChange(v as AddMaintenanceLogInput["category"])}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MAINTENANCE_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </form.Field>

        <form.Field name="performedOn">
          {(field: any) => (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="maintenance-performed-on">Date</Label>
              <DatePicker
                id="maintenance-performed-on"
                value={field.state.value ?? ""}
                onChange={(val) => field.handleChange(val)}
              />
              {fieldError(field.state.meta.errors) && (
                <p className="text-xs text-destructive">{fieldError(field.state.meta.errors)}</p>
              )}
            </div>
          )}
        </form.Field>

        <form.Field name="staffId">
          {(field: any) => (
            <div className="flex flex-col gap-1.5">
              <Label>Done by</Label>
              <Select value={field.state.value ?? ""} onValueChange={(v) => field.handleChange(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select staff" />
                </SelectTrigger>
                <SelectContent className="min-w-72">
                  {activeStaff.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} · {s.role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </form.Field>

        <form.Field name="cost">
          {(field: any) => (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="maintenance-cost">Cost (optional)</Label>
              <Input
                id="maintenance-cost"
                type="number"
                value={field.state.value ?? ""}
                onBlur={field.handleBlur}
                onChange={(e) =>
                  field.handleChange(e.target.value === "" ? undefined : Number(e.target.value))
                }
              />
            </div>
          )}
        </form.Field>
      </div>

      <form.Field name="description">
        {(field: any) => (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="maintenance-description">What was (or will be) done</Label>
            <Textarea
              id="maintenance-description"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              rows={3}
              placeholder="e.g. Replaced the tap washer and checked for further leaks"
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
              {isSubmitting ? "Saving…" : "Log entry"}
            </Button>
          </div>
        )}
      </form.Subscribe>
    </form>
  );
}
