"use client";

import { useForm } from "@tanstack/react-form";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/datePicker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FlatSelect } from "@/components/flats/flatSelect";
import { flats } from "@/lib/flatsMockData";
import {
  addShareCertificateSchema,
  type AddShareCertificateInput,
} from "@/lib/shareRegisterMockData";
import { fieldError } from "@/lib/fieldError";

export function ShareCertificateForm({
  onSave,
  onCancel,
}: {
  onSave: (values: AddShareCertificateInput) => void;
  onCancel: () => void;
}) {
  const form = useForm({
    defaultValues: {
      flatId: "",
      certificateNumber: "",
      shareNumbers: "",
      numberOfShares: 5,
      faceValue: 50,
      issueDate: "",
      holderName: "",
    } as AddShareCertificateInput,
    validators: { onChange: addShareCertificateSchema },
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
              <FlatSelect
                flats={flats}
                value={field.state.value}
                onValueChange={(v) => field.handleChange(v)}
              />
              {fieldError(field.state.meta.errors) && (
                <p className="text-xs text-destructive">{fieldError(field.state.meta.errors)}</p>
              )}
            </div>
          )}
        </form.Field>

        <form.Field name="holderName">
          {(field: any) => (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sc-holder">Holder name</Label>
              <Input
                id="sc-holder"
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

        <form.Field name="certificateNumber">
          {(field: any) => (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sc-cert">Certificate number</Label>
              <Input
                id="sc-cert"
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

        <form.Field name="shareNumbers">
          {(field: any) => (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sc-numbers">Share numbers</Label>
              <Input
                id="sc-numbers"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="e.g. 76-80"
                aria-invalid={field.state.meta.errors.length > 0}
              />
              {fieldError(field.state.meta.errors) && (
                <p className="text-xs text-destructive">{fieldError(field.state.meta.errors)}</p>
              )}
            </div>
          )}
        </form.Field>

        <form.Field name="numberOfShares">
          {(field: any) => (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sc-count">Number of shares</Label>
              <Input
                id="sc-count"
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

        <form.Field name="faceValue">
          {(field: any) => (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sc-face">Face value (₹)</Label>
              <Input
                id="sc-face"
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

        <form.Field name="issueDate">
          {(field: any) => (
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="sc-date">Issue date</Label>
              <DatePicker
                id="sc-date"
                value={field.state.value ? field.state.value.slice(0, 10) : ""}
                onChange={(val) => field.handleChange(val ? `${val}T00:00:00+05:30` : "")}
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
              {isSubmitting ? "Issuing…" : "Issue certificate"}
            </Button>
          </div>
        )}
      </form.Subscribe>
    </form>
  );
}
