"use client";

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
import { ASSET_CATEGORIES, type EditAssetInput } from "@/lib/assetsMockData";
import { fieldError } from "@/lib/fieldError";

export function AssetFormFields({ form }: { form: any }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <form.Field name="name">
        {(field: any) => (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="asset-name">Name</Label>
            <Input
              id="asset-name"
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

      <form.Field name="assetTag">
        {(field: any) => (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="asset-tag">Asset tag</Label>
            <Input
              id="asset-tag"
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
            <Label>Category</Label>
            <Select
              value={field.state.value}
              onValueChange={(v) => field.handleChange(v as EditAssetInput["category"])}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ASSET_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
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

      <form.Field name="location">
        {(field: any) => (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="asset-location">Location</Label>
            <Input
              id="asset-location"
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

      <form.Field name="purchaseDate">
        {(field: any) => (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="asset-purchase-date">Purchase date</Label>
            <DatePicker
              id="asset-purchase-date"
              value={field.state.value ? field.state.value.slice(0, 10) : ""}
              onChange={(val) => field.handleChange(val ? `${val}T00:00:00+05:30` : "")}
            />
            {fieldError(field.state.meta.errors) && (
              <p className="text-xs text-destructive">{fieldError(field.state.meta.errors)}</p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field name="purchaseCost">
        {(field: any) => (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="asset-purchase-cost">Purchase cost</Label>
            <Input
              id="asset-purchase-cost"
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

      <form.Field name="vendor">
        {(field: any) => (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="asset-vendor">Vendor</Label>
            <Input
              id="asset-vendor"
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

      <form.Field name="warrantyExpiry">
        {(field: any) => (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="asset-warranty">Warranty expiry</Label>
            <DatePicker
              id="asset-warranty"
              value={field.state.value ? String(field.state.value).slice(0, 10) : ""}
              onChange={(val) => field.handleChange(val ? `${val}T00:00:00+05:30` : null)}
            />
            {fieldError(field.state.meta.errors) && (
              <p className="text-xs text-destructive">{fieldError(field.state.meta.errors)}</p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field name="amcExpiry">
        {(field: any) => (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="asset-amc">AMC expiry</Label>
            <DatePicker
              id="asset-amc"
              value={field.state.value ? String(field.state.value).slice(0, 10) : ""}
              onChange={(val) => field.handleChange(val ? `${val}T00:00:00+05:30` : null)}
            />
            {fieldError(field.state.meta.errors) && (
              <p className="text-xs text-destructive">{fieldError(field.state.meta.errors)}</p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field name="status">
        {(field: any) => (
          <div className="flex flex-col gap-1.5">
            <Label>Status</Label>
            <Select
              value={field.state.value}
              onValueChange={(v) => field.handleChange(v as EditAssetInput["status"])}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Under Repair">Under Repair</SelectItem>
                <SelectItem value="Retired">Retired</SelectItem>
              </SelectContent>
            </Select>
            {fieldError(field.state.meta.errors) && (
              <p className="text-xs text-destructive">{fieldError(field.state.meta.errors)}</p>
            )}
          </div>
        )}
      </form.Field>
    </div>
  );
}
