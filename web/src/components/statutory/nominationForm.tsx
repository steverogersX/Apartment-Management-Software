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
import { flats } from "@/lib/flatsMockData";
import { addNominationSchema, type AddNominationInput } from "@/lib/nominationRegisterMockData";
import { fieldError } from "@/components/assets/assetFormFields";

export function NominationForm({
  onSave,
  onCancel,
}: {
  onSave: (values: AddNominationInput) => void;
  onCancel: () => void;
}) {
  const form = useForm({
    defaultValues: {
      flatId: "",
      memberName: "",
      nomineeName: "",
      nomineeRelation: "",
      nomineeAddress: "",
      dateOfNomination: "",
      witnessName: "",
    } as AddNominationInput,
    validators: { onChange: addNominationSchema },
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
          {(field: any) => (
            <div className="flex flex-col gap-1.5">
              <Label>Flat</Label>
              <Select value={field.state.value} onValueChange={(v) => field.handleChange(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select flat" />
                </SelectTrigger>
                <SelectContent>
                  {flats.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.tower}-{f.flatNumber}
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

        <form.Field name="memberName">
          {(field: any) => (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nom-member">Member name</Label>
              <Input
                id="nom-member"
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

        <form.Field name="nomineeName">
          {(field: any) => (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nom-name">Nominee name</Label>
              <Input
                id="nom-name"
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

        <form.Field name="nomineeRelation">
          {(field: any) => (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nom-relation">Relation</Label>
              <Input
                id="nom-relation"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="e.g. Spouse, Son, Mother"
                aria-invalid={field.state.meta.errors.length > 0}
              />
              {fieldError(field.state.meta.errors) && (
                <p className="text-xs text-destructive">{fieldError(field.state.meta.errors)}</p>
              )}
            </div>
          )}
        </form.Field>

        <form.Field name="nomineeAddress">
          {(field: any) => (
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="nom-address">Nominee address</Label>
              <Textarea
                id="nom-address"
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

        <form.Field name="dateOfNomination">
          {(field: any) => (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nom-date">Date of nomination</Label>
              <DatePicker
                id="nom-date"
                value={field.state.value ? field.state.value.slice(0, 10) : ""}
                onChange={(val) => field.handleChange(val ? `${val}T00:00:00+05:30` : "")}
              />
              {fieldError(field.state.meta.errors) && (
                <p className="text-xs text-destructive">{fieldError(field.state.meta.errors)}</p>
              )}
            </div>
          )}
        </form.Field>

        <form.Field name="witnessName">
          {(field: any) => (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nom-witness">Witness (optional)</Label>
              <Input
                id="nom-witness"
                value={field.state.value ?? ""}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
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
              {isSubmitting ? "Adding…" : "Add nomination"}
            </Button>
          </div>
        )}
      </form.Subscribe>
    </form>
  );
}
