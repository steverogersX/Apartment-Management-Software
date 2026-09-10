"use client";

import { useForm } from "@tanstack/react-form";

import { Button } from "@/components/ui/button";
import {
  editProviderSchema,
  type EditProviderInput,
  type ServiceProvider,
} from "@/lib/providersMockData";
import { ProviderFormFields } from "./providerFormFields";

export function EditProviderForm({
  provider,
  onSave,
  onCancel,
}: {
  provider: ServiceProvider;
  onSave: (values: EditProviderInput) => void;
  onCancel: () => void;
}) {
  const form = useForm({
    defaultValues: {
      name: provider.name,
      category: provider.category,
      phone: provider.phone,
      idProofType: provider.idProofType,
      idProofNumber: provider.idProofNumber,
      status: provider.status,
    } as EditProviderInput,
    validators: { onChange: editProviderSchema },
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
      <ProviderFormFields form={form} />

      <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
        {([canSubmit, isSubmitting]) => (
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? "Saving…" : "Save changes"}
            </Button>
          </div>
        )}
      </form.Subscribe>
    </form>
  );
}
