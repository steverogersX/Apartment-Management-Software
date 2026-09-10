"use client";

import { useForm } from "@tanstack/react-form";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/datePicker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  createPurchaseOrderSchema,
  purchaseOrders,
  purchaseRequests,
  vendors,
  type CreatePurchaseOrderInput,
} from "@/lib/purchasingMockData";

function fieldError(errors: unknown[]): string | undefined {
  if (errors.length === 0) return undefined;
  const issue = errors[0];
  if (typeof issue === "string") return issue;
  if (issue && typeof issue === "object" && "message" in issue)
    return String((issue as { message: unknown }).message);
  return String(issue);
}

export function CreatePurchaseOrderForm({
  onSave,
  onCancel,
}: {
  onSave: (values: CreatePurchaseOrderInput) => void;
  onCancel: () => void;
}) {
  const availablePRs = purchaseRequests.filter(
    (pr) =>
      pr.status === "Approved" &&
      !purchaseOrders.some((po) => po.prId === pr.id && po.status !== "Cancelled"),
  );

  const form = useForm({
    defaultValues: {
      prId: "",
      vendorId: "",
      expectedDeliveryDate: "",
    } as unknown as CreatePurchaseOrderInput,
    validators: { onChange: createPurchaseOrderSchema },
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
      <form.Field name="prId">
        {(field: any) => (
          <div className="flex flex-col gap-1.5">
            <Label>Purchase request</Label>
            <Select value={field.state.value} onValueChange={(v) => field.handleChange(v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select approved PR" />
              </SelectTrigger>
              <SelectContent>
                {availablePRs.map((pr) => (
                  <SelectItem key={pr.id} value={pr.id}>
                    {pr.requestNumber} — {pr.items.map((i) => i.description).join(", ")} (
                    {pr.items.length} items)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldError(field.state.meta.errors) && (
              <p className="text-xs text-destructive">{fieldError(field.state.meta.errors)}</p>
            )}
            {availablePRs.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No approved requests pending a PO — approve a request first.
              </p>
            )}
            {field.state.value && (
              <div className="rounded-md border border-border p-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchaseRequests
                      .find((pr) => pr.id === field.state.value)
                      ?.items.map((it, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="text-sm text-foreground">
                            {it.description}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {it.quantity}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{it.unit}</TableCell>
                          <TableCell className="text-right text-sm text-muted-foreground">
                            ₹{it.estimatedUnitPrice.toLocaleString("en-IN")}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}
      </form.Field>

      <form.Field name="vendorId">
        {(field: any) => (
          <div className="flex flex-col gap-1.5">
            <Label>Vendor</Label>
            <Select value={field.state.value} onValueChange={(v) => field.handleChange(v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select vendor" />
              </SelectTrigger>
              <SelectContent>
                {vendors.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.name} — {v.category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldError(field.state.meta.errors) && (
              <p className="text-xs text-destructive">{fieldError(field.state.meta.errors)}</p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field name="expectedDeliveryDate">
        {(field: any) => (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="po-expected">Expected delivery</Label>
            <DatePicker
              id="po-expected"
              value={field.state.value ? String(field.state.value).slice(0, 10) : ""}
              onChange={(val) => field.handleChange(val ? `${val}T00:00:00+05:30` : "")}
            />
            {fieldError(field.state.meta.errors) && (
              <p className="text-xs text-destructive">{fieldError(field.state.meta.errors)}</p>
            )}
          </div>
        )}
      </form.Field>

      <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
        {([canSubmit, isSubmitting]) => (
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? "Creating…" : "Create PO"}
            </Button>
          </div>
        )}
      </form.Subscribe>
    </form>
  );
}
