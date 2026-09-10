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
import { PROVIDER_CATEGORIES, type EditProviderInput } from "@/lib/providersMockData";

export function fieldError(errors: unknown[]): string | undefined {
  if (errors.length === 0) return undefined;
  const issue = errors[0];
  if (typeof issue === "string") return issue;
  if (issue && typeof issue === "object" && "message" in issue) {
    return String((issue as { message: unknown }).message);
  }
  return String(issue);
}

export function ProviderFormFields({ form }: { form: any }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <form.Field name="name">
        {(field: any) => (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="provider-name">Name</Label>
            <Input
              id="provider-name"
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
              onValueChange={(v) => field.handleChange(v as EditProviderInput["category"])}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROVIDER_CATEGORIES.map((cat) => (
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

      <form.Field name="phone">
        {(field: any) => (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="provider-phone">Phone</Label>
            <Input
              id="provider-phone"
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

      <form.Field name="status">
        {(field: any) => (
          <div className="flex flex-col gap-1.5">
            <Label>Status</Label>
            <Select
              value={field.state.value}
              onValueChange={(v) => field.handleChange(v as EditProviderInput["status"])}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
            {fieldError(field.state.meta.errors) && (
              <p className="text-xs text-destructive">{fieldError(field.state.meta.errors)}</p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field name="idProofType">
        {(field: any) => (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="provider-idproof-type">ID proof type</Label>
            <Input
              id="provider-idproof-type"
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

      <form.Field name="idProofNumber">
        {(field: any) => (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="provider-idproof-number">ID proof number</Label>
            <Input
              id="provider-idproof-number"
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
    </div>
  );
}
