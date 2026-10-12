"use client";

import * as React from "react";
import { useForm } from "@tanstack/react-form";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/datePicker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FlatSelect } from "@/components/flats/flatSelect";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { flats } from "@/lib/flatsMockData";
import { residents } from "@/lib/residentsMockData";
import { recordContributionSchema, type RecordContributionInput } from "@/lib/eventsMockData";

const CONTRIBUTION_MODES: RecordContributionInput["mode"][] = [
  "Cash",
  "Cheque",
  "NEFT/RTGS",
  "UPI",
  "Card",
  "Online Gateway",
];

function fieldError(errors: unknown[]): string | undefined {
  if (errors.length === 0) return undefined;
  const issue = errors[0];
  if (typeof issue === "string") return issue;
  if (issue && typeof issue === "object" && "message" in issue) {
    return String((issue as { message: unknown }).message);
  }
  return String(issue);
}

export function RecordContributionForm({
  onSave,
  onCancel,
}: {
  onSave: (values: RecordContributionInput) => void;
  onCancel: () => void;
}) {
  const form = useForm({
    defaultValues: {
      flatId: "",
      residentId: "",
      amount: 0,
      mode: "UPI",
      date: new Date().toISOString().slice(0, 10),
      note: "",
    } as RecordContributionInput,
    validators: { onChange: recordContributionSchema },
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
        <form.Field name="flatId">
          {(field) => (
            <div className="flex flex-col gap-1.5">
              <Label>Flat</Label>
              <FlatSelect
                flats={flats}
                value={field.state.value}
                onValueChange={(v) => {
                  field.handleChange(v);
                  form.setFieldValue("residentId", "");
                }}
              />
              {fieldError(field.state.meta.errors) && (
                <p className="text-xs text-destructive">{fieldError(field.state.meta.errors)}</p>
              )}
            </div>
          )}
        </form.Field>

        <form.Subscribe selector={(state) => state.values.flatId}>
          {(flatId) => {
            const residentsForFlat = residents.filter((r) => r.flatId === flatId);
            return (
              <form.Field name="residentId">
                {(field) => (
                  <div className="flex flex-col gap-1.5">
                    <Label>Resident</Label>
                    <Select
                      value={field.state.value}
                      onValueChange={(v) => field.handleChange(v ?? "")}
                      disabled={!flatId || residentsForFlat.length === 0}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={flatId ? "Select a resident" : "Select a flat first"}
                        >
                          {(value: string) =>
                            residentsForFlat.find((r) => r.id === value)?.name ??
                            "Select a resident"
                          }
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {residentsForFlat.map((r) => (
                          <SelectItem key={r.id} value={r.id}>
                            {r.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {flatId && residentsForFlat.length === 0 && (
                      <p className="text-xs text-muted-foreground">
                        This flat has no residents yet.
                      </p>
                    )}
                    {fieldError(field.state.meta.errors) && (
                      <p className="text-xs text-destructive">
                        {fieldError(field.state.meta.errors)}
                      </p>
                    )}
                  </div>
                )}
              </form.Field>
            );
          }}
        </form.Subscribe>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <form.Field name="amount">
          {(field) => (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="contribution-amount">Amount (₹)</Label>
              <Input
                id="contribution-amount"
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

        <form.Field name="mode">
          {(field) => (
            <div className="flex flex-col gap-1.5">
              <Label>Payment mode</Label>
              <Select
                value={field.state.value}
                onValueChange={(v) => field.handleChange(v as RecordContributionInput["mode"])}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTRIBUTION_MODES.map((mode) => (
                    <SelectItem key={mode} value={mode}>
                      {mode}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </form.Field>
      </div>

      <form.Field name="date">
        {(field) => (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="contribution-date">Date</Label>
            <DatePicker
              id="contribution-date"
              value={field.state.value}
              onChange={(val) => field.handleChange(val)}
            />
            {fieldError(field.state.meta.errors) && (
              <p className="text-xs text-destructive">{fieldError(field.state.meta.errors)}</p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field name="note">
        {(field) => (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="contribution-note">Note (optional)</Label>
            <Textarea
              id="contribution-note"
              value={field.state.value ?? ""}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              rows={2}
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
              {isSubmitting ? "Recording…" : "Record contribution"}
            </Button>
          </div>
        )}
      </form.Subscribe>
    </form>
  );
}
