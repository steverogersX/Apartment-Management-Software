"use client";

import { useForm } from "@tanstack/react-form";

import { Button } from "@/components/ui/button";
import { editAssetSchema, type Asset, type EditAssetInput } from "@/lib/assetsMockData";
import { AssetFormFields } from "./assetFormFields";

export function EditAssetForm({
  asset,
  onSave,
  onCancel,
}: {
  asset: Asset;
  onSave: (values: EditAssetInput) => void;
  onCancel: () => void;
}) {
  const form = useForm({
    defaultValues: {
      name: asset.name,
      assetTag: asset.assetTag,
      category: asset.category,
      location: asset.location,
      purchaseDate: asset.purchaseDate,
      purchaseCost: asset.purchaseCost,
      vendor: asset.vendor,
      warrantyExpiry: asset.warrantyExpiry,
      amcExpiry: asset.amcExpiry,
      status: asset.status,
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
              {isSubmitting ? "Saving…" : "Save changes"}
            </Button>
          </div>
        )}
      </form.Subscribe>
    </form>
  );
}
