"use client";

import { useForm } from "@tanstack/react-form";

import { Button } from "@/components/ui/button";
import { editInventoryItemSchema, type EditInventoryItemInput } from "@/lib/inventoryMockData";
import { InventoryItemFormFields } from "./inventoryItemFormFields";

export function AddInventoryItemForm({
  onSave,
  onCancel,
}: {
  onSave: (values: EditInventoryItemInput) => void;
  onCancel: () => void;
}) {
  const form = useForm({
    defaultValues: {
      name: "",
      category: "",
      unit: "Pcs",
      currentStock: 0,
      reorderLevel: 5,
      store: "Main Store",
    } as EditInventoryItemInput,
    validators: { onChange: editInventoryItemSchema },
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
      <InventoryItemFormFields form={form} />

      <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
        {([canSubmit, isSubmitting]) => (
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? "Adding…" : "Add item"}
            </Button>
          </div>
        )}
      </form.Subscribe>
    </form>
  );
}
