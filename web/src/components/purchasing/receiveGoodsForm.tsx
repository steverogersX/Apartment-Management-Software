"use client";

import * as React from "react";
import { useForm } from "@tanstack/react-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { receiveGoodsSchema, type PurchaseOrder } from "@/lib/purchasingMockData";

export function ReceiveGoodsForm({
  order,
  onSave,
  onCancel,
}: {
  order: PurchaseOrder;
  onSave: (
    values: {
      description: string;
      orderedQuantity: number;
      receivedQuantity: number;
      unit: string;
    }[],
  ) => void;
  onCancel: () => void;
}) {
  const form = useForm({
    defaultValues: {
      items: order.items.map((it) => ({
        description: it.description,
        orderedQuantity: it.quantity,
        receivedQuantity: it.quantity,
        unit: it.unit,
      })),
    } as any,
    validators: { onChange: receiveGoodsSchema },
    onSubmit: async ({ value }) => {
      onSave(value.items);
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
      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Ordered</TableHead>
              <TableHead>Received</TableHead>
              <TableHead>Unit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <form.Field name="items">
              {(field: any) => (
                <>
                  {field.state.value.map((it: any, idx: number) => (
                    <TableRow key={idx}>
                      <TableCell className="text-sm text-foreground">{it.description}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {it.orderedQuantity}
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={it.receivedQuantity}
                          onChange={(e) => {
                            const next = [...field.state.value];
                            next[idx] = {
                              ...next[idx],
                              receivedQuantity: Number(e.target.value) || 0,
                            };
                            field.handleChange(next);
                          }}
                          className="h-8 w-24"
                        />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{it.unit}</TableCell>
                    </TableRow>
                  ))}
                </>
              )}
            </form.Field>
          </TableBody>
        </Table>
      </div>

      <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
        {([canSubmit, isSubmitting]) => (
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? "Receiving…" : "Confirm receipt"}
            </Button>
          </div>
        )}
      </form.Subscribe>
    </form>
  );
}
