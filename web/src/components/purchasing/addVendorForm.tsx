"use client";

import { useForm } from "@tanstack/react-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fieldError } from "@/lib/fieldError";

const vendorSchema = z.object({
  name: z.string().min(2, "Name is required"),
  category: z.string().min(2, "Category is required"),
  contactPerson: z.string().min(2, "Contact person is required"),
  phone: z.string().min(10, "Phone is required"),
  email: z.string().email("Invalid email"),
});

export type AddVendorInput = z.infer<typeof vendorSchema>;

export function AddVendorForm({
  onSave,
  onCancel,
}: {
  onSave: (values: AddVendorInput) => void;
  onCancel: () => void;
}) {
  const form = useForm({
    defaultValues: {
      name: "",
      category: "",
      contactPerson: "",
      phone: "",
      email: "",
    } as AddVendorInput,
    validators: { onChange: vendorSchema },
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
        <form.Field name="name">
          {(field: any) => (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="vendor-name">Name</Label>
              <Input
                id="vendor-name"
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
        <form.Field name="category">
          {(field: any) => (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="vendor-category">Category</Label>
              <Input
                id="vendor-category"
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
        <form.Field name="contactPerson">
          {(field: any) => (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="vendor-contact">Contact person</Label>
              <Input
                id="vendor-contact"
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
        <form.Field name="phone">
          {(field: any) => (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="vendor-phone">Phone</Label>
              <Input
                id="vendor-phone"
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
        <form.Field name="email">
          {(field: any) => (
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="vendor-email">Email</Label>
              <Input
                id="vendor-email"
                type="email"
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
      </div>

      <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
        {([canSubmit, isSubmitting]) => (
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? "Adding…" : "Add vendor"}
            </Button>
          </div>
        )}
      </form.Subscribe>
    </form>
  );
}
