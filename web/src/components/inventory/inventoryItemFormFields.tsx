"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { EditInventoryItemInput } from "@/lib/inventoryMockData";

export function fieldError(errors: unknown[]): string | undefined {
  if (errors.length === 0) return undefined;
  const issue = errors[0];
  if (typeof issue === "string") return issue;
  if (issue && typeof issue === "object" && "message" in issue) {
    return String((issue as { message: unknown }).message);
  }
  return String(issue);
}

export function InventoryItemFormFields({ form }: { form: any }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <form.Field name="name">
        {(field: any) => (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="inv-name">Name</Label>
            <Input
              id="inv-name"
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
            <Label htmlFor="inv-category">Category</Label>
            <Input
              id="inv-category"
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

      <form.Field name="unit">
        {(field: any) => (
          <div className="flex flex-col gap-1.5">
            <Label>Unit</Label>
            <Select
              value={field.state.value}
              onValueChange={(v) => field.handleChange(v as EditInventoryItemInput["unit"])}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pcs">Pcs</SelectItem>
                <SelectItem value="Box">Box</SelectItem>
                <SelectItem value="Litre">Litre</SelectItem>
                <SelectItem value="Kg">Kg</SelectItem>
                <SelectItem value="Set">Set</SelectItem>
                <SelectItem value="Roll">Roll</SelectItem>
              </SelectContent>
            </Select>
            {fieldError(field.state.meta.errors) && (
              <p className="text-xs text-destructive">{fieldError(field.state.meta.errors)}</p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field name="store">
        {(field: any) => (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="inv-store">Store</Label>
            <Input
              id="inv-store"
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

      <form.Field name="currentStock">
        {(field: any) => (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="inv-stock">Current stock</Label>
            <Input
              id="inv-stock"
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

      <form.Field name="reorderLevel">
        {(field: any) => (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="inv-reorder">Reorder level</Label>
            <Input
              id="inv-reorder"
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
    </div>
  );
}
