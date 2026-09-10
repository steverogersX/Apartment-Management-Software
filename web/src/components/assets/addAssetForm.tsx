"use client";

import { useForm } from "@tanstack/react-form";

import { Button } from "@/components/ui/button";
import { editAssetSchema, type EditAssetInput } from "@/lib/assetsMockData";
import { AssetFormFields } from "./assetFormFields";

export function AddAssetForm({
  onSave,
  onCancel,
}: {
  onSave: (values: EditAssetInput) => void;
  onCancel: () => void;
}) {
  const form = useForm({
    defaultValues: {
      name: "",
      assetTag: "",
      category: "Electrical",
      location: "",
      purchaseDate: "",
      purchaseCost: 0,
      vendor: "",
      warrantyExpiry: null,
      amcExpiry: null,
      status: "Active",
    } as EditAssetInput,
    validators: { onChange: editAssetSchema },
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
      <AssetFormFields form={form} />

      <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
        {([canSubmit, isSubmitting]) => (
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? "Adding…" : "Add asset"}
            </Button>
          </div>
        )}
      </form.Subscribe>
    </form>
  );
}
