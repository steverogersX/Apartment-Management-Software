"use client";

import { useForm } from "@tanstack/react-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  editStaffSchema,
  STAFF_ROLES,
  STAFF_SHIFTS,
  type EditStaffInput,
  type StaffMember,
} from "@/lib/staffMockData";
import { fieldError } from "@/lib/fieldError";

export function AddStaffForm({
  staff,
  onSave,
  onCancel,
}: {
  staff?: StaffMember;
  onSave: (values: EditStaffInput) => void;
  onCancel: () => void;
}) {
  const form = useForm({
    defaultValues: {
      name: staff?.name ?? "",
      role: staff?.role ?? "Security Guard",
      phone: staff?.phone ?? "",
      shift: staff?.shift ?? "Day",
      monthlyWage: staff?.monthlyWage ?? 0,
      joinedOn: staff?.joinedOn ?? new Date().toISOString().slice(0, 10) + "T00:00:00+05:30",
      idProofVerified: staff?.idProofVerified ?? false,
      status: staff?.status ?? "active",
    } as unknown as EditStaffInput,
    validators: { onChange: editStaffSchema },
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
            <Label htmlFor="staff-name">Name</Label>
            <Input
              id="staff-name"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Full name"
            />
            {fieldError(field.state.meta.errors) && (
              <p className="text-xs text-destructive">{fieldError(field.state.meta.errors)}</p>
            )}
          </div>
        )}
      </form.Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <form.Field name="role">
          {(field: any) => (
            <div className="flex flex-col gap-1.5">
              <Label>Role</Label>
              <Select
                value={field.state.value}
                onValueChange={(v) => field.handleChange(v as EditStaffInput["role"])}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STAFF_ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </form.Field>

        <form.Field name="shift">
          {(field: any) => (
            <div className="flex flex-col gap-1.5">
              <Label>Shift</Label>
              <Select
                value={field.state.value}
                onValueChange={(v) => field.handleChange(v as EditStaffInput["shift"])}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STAFF_SHIFTS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </form.Field>

        <form.Field name="phone">
          {(field: any) => (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="staff-phone">Phone</Label>
              <Input
                id="staff-phone"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="+91 ..."
              />
              {fieldError(field.state.meta.errors) && (
                <p className="text-xs text-destructive">{fieldError(field.state.meta.errors)}</p>
              )}
            </div>
          )}
        </form.Field>

        <form.Field name="monthlyWage">
          {(field: any) => (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="staff-wage">Monthly wage</Label>
              <Input
                id="staff-wage"
                type="number"
                value={field.state.value ?? ""}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(Number(e.target.value))}
              />
              {fieldError(field.state.meta.errors) && (
                <p className="text-xs text-destructive">{fieldError(field.state.meta.errors)}</p>
              )}
            </div>
          )}
        </form.Field>

        <form.Field name="joinedOn">
          {(field: any) => (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="staff-joined">Joined on</Label>
              <DatePicker
                id="staff-joined"
                value={field.state.value ? String(field.state.value).slice(0, 10) : ""}
                onChange={(val) => field.handleChange(val ? `${val}T00:00:00+05:30` : "")}
              />
            </div>
          )}
        </form.Field>

        <form.Field name="status">
          {(field: any) => (
            <div className="flex flex-col gap-1.5">
              <Label>Status</Label>
              <Select
                value={field.state.value}
                onValueChange={(v) => field.handleChange(v as EditStaffInput["status"])}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on_leave">On leave</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </form.Field>
      </div>

      <form.Field name="idProofVerified">
        {(field: any) => (
          <label className="flex items-center gap-2 text-sm text-foreground">
            <Checkbox
              checked={field.state.value}
              onCheckedChange={(checked) => field.handleChange(checked === true)}
            />
            ID proof verified
          </label>
        )}
      </form.Field>

      <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
        {([canSubmit, isSubmitting]) => (
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? "Saving…" : staff ? "Save changes" : "Add staff"}
            </Button>
          </div>
        )}
      </form.Subscribe>
    </form>
  );
}
