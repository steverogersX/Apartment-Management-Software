"use client";

import { useForm } from "@tanstack/react-form";

import { Button } from "@/components/ui/button";
import {
  editInventoryItemSchema,
  type EditInventoryItemInput,
  type InventoryItem,
} from "@/lib/inventoryMockData";
import { InventoryItemFormFields } from "./inventoryItemFormFields";

export function EditInventoryItemForm({
  item,
  onSave,
  onCancel,
}: {
  item: InventoryItem;
  onSave: (values: EditInventoryItemInput) => void;
  onCancel: () => void;
}) {
  const form = useForm({
    defaultValues: {
      name: item.name,
      category: item.category,
      unit: item.unit,
      currentStock: item.currentStock,
      reorderLevel: item.reorderLevel,
      store: item.store,
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
              {isSubmitting ? "Saving…" : "Save changes"}
            </Button>
          </div>
        )}
      </form.Subscribe>
    </form>
  );
}
