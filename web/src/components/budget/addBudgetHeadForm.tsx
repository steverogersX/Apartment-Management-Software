"use client";

import { useForm } from "@tanstack/react-form";

import { Button } from "@/components/ui/button";
import { editBudgetHeadSchema, type EditBudgetHeadInput } from "@/lib/budgetMockData";
import { BudgetFormFields } from "./budgetFormFields";

export function AddBudgetHeadForm({
  financialYear,
  onSave,
  onCancel,
}: {
  financialYear: string;
  onSave: (values: EditBudgetHeadInput) => void;
  onCancel: () => void;
}) {
  const form = useForm({
    defaultValues: {
      name: "",
      type: "Expense",
      planningMode: "annual",
      plannedAmount: 0,
      monthlyPlanned: Array(12).fill(0),
      ledgerAccountId: "",
      financialYear,
    } as EditBudgetHeadInput,
    validators: { onChange: editBudgetHeadSchema },
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
      <BudgetFormFields form={form} />

      <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
        {([canSubmit, isSubmitting]) => (
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? "Adding…" : "Add budget head"}
            </Button>
          </div>
        )}
      </form.Subscribe>
    </form>
  );
}
