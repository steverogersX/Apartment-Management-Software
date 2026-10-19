"use client";

import * as React from "react";
import { useForm } from "@tanstack/react-form";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { editProviderSchema, type EditProviderInput } from "@/lib/providersMockData";
import { flats } from "@/lib/flatsMockData";
import { ProviderFormFields } from "./providerFormFields";
import { FlatCheckboxGrid } from "@/components/flats/flatCheckboxGrid";

export function AddProviderForm({
  onSave,
  onCancel,
}: {
  onSave: (values: EditProviderInput, flats: string[]) => void;
  onCancel: () => void;
}) {
  const [selectedFlats, setSelectedFlats] = React.useState<string[]>([]);

  const form = useForm({
    defaultValues: {
      name: "",
      category: "Plumber",
      phone: "",
      idProofType: "",
      idProofNumber: "",
      status: "active",
    } as EditProviderInput,
    validators: { onChange: editProviderSchema },
    onSubmit: async ({ value }) => {
      onSave(value, selectedFlats);
    },
  });

  function toggleFlat(flatLabel: string, checked: boolean) {
    setSelectedFlats((prev) =>
      checked ? [...prev, flatLabel] : prev.filter((f) => f !== flatLabel),
    );
  }

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

      <div className="flex flex-col gap-2">
        <Label>Assign flats (optional)</Label>
        <FlatCheckboxGrid
          flats={flats}
          isChecked={(f) => selectedFlats.includes(`${f.tower}-${f.flatNumber}`)}
          onToggle={(f, checked) => toggleFlat(`${f.tower}-${f.flatNumber}`, checked)}
        />
        {selectedFlats.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {selectedFlats.length} flat{selectedFlats.length === 1 ? "" : "s"} selected
          </p>
        )}
      </div>

      <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
        {([canSubmit, isSubmitting]) => (
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? "Adding…" : "Add provider"}
            </Button>
          </div>
        )}
      </form.Subscribe>
    </form>
  );
}
