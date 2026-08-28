"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Permission,
  type PermissionDefinition,
  type PermissionKey,
  type RoleResponse,
} from "@shared/index";
import { useAuth } from "@/hooks/useAuth";
import { createRoleRequest, updateRoleRequest } from "@/lib/roleApi";
import { ApiClientError } from "@/lib/apiClient";

const PERMISSION_ENTRIES = Object.entries(Permission) as [PermissionKey, PermissionDefinition][];

const PERMISSIONS_BY_DOMAIN = PERMISSION_ENTRIES.reduce<
  Record<string, [PermissionKey, PermissionDefinition][]>
>((acc, entry) => {
  const domain = entry[1].domain;
  (acc[domain] ??= []).push(entry);
  return acc;
}, {});

function domainLabel(domain: string) {
  return domain.charAt(0).toUpperCase() + domain.slice(1);
}

export function RolePermissionForm({ role }: { role?: RoleResponse }) {
  const router = useRouter();
  const { has, token, activeSociety } = useAuth();
  const isEdit = !!role;
  const canEdit = isEdit ? has("RolesUpdate") && !role.isSystem : has("RolesCreate");
  const [name, setName] = React.useState(role?.name ?? "");
  const [description, setDescription] = React.useState(role?.description ?? "");
  const [selected, setSelected] = React.useState<Set<PermissionKey>>(
    () => new Set(role?.permissions ?? []),
  );
  const [nameError, setNameError] = React.useState<string | undefined>();
  const [formError, setFormError] = React.useState<string | undefined>();
  const [submitting, setSubmitting] = React.useState(false);

  function togglePermission(key: PermissionKey, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(key);
      else next.delete(key);
      return next;
    });
  }

  function toggleDomain(domain: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const [key] of PERMISSIONS_BY_DOMAIN[domain]) {
        if (checked) next.add(key);
        else next.delete(key);
      }
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(undefined);
    if (!name.trim()) {
      setNameError("Role name is required");
      return;
    }
    if (selected.size === 0) {
      setFormError("Select at least one permission");
      return;
    }
    if (!token || !activeSociety) {
      setFormError("No active society — switch societies and try again");
      return;
    }

    const permissionNames = Array.from(selected, (key) => Permission[key].name);

    setSubmitting(true);
    try {
      if (isEdit && role) {
        await updateRoleRequest(
          token,
          activeSociety.societyToken,
          activeSociety.societyId,
          role.id,
          {
            name: name.trim(),
            description: description.trim() || undefined,
            permissions: permissionNames,
          },
        );
      } else {
        await createRoleRequest(token, activeSociety.societyToken, activeSociety.societyId, {
          name: name.trim(),
          description: description.trim() || undefined,
          permissions: permissionNames,
        });
      }
      router.push("/dashboard/roles");
    } catch (err) {
      setFormError(err instanceof ApiClientError ? err.message : "Failed to save role");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Card>
        <CardHeader>
          <CardTitle>Role details</CardTitle>
          <CardDescription>Name and describe what this role is for.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="role-name">Role name</Label>
              <Input
                id="role-name"
                placeholder="Committee Member"
                value={name}
                disabled={!canEdit}
                onChange={(e) => {
                  setName(e.target.value);
                  setNameError(undefined);
                }}
                aria-invalid={!!nameError}
              />
              {nameError && <p className="text-xs text-destructive">{nameError}</p>}
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="role-description">Description</Label>
              <Textarea
                id="role-description"
                placeholder="What is this role for?"
                value={description}
                disabled={!canEdit}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Permissions</CardTitle>
          <CardDescription>
            {selected.size} of {PERMISSION_ENTRIES.length} permissions selected.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {Object.entries(PERMISSIONS_BY_DOMAIN).map(([domain, entries]) => {
            const allChecked = entries.every(([key]) => selected.has(key));
            const someChecked = !allChecked && entries.some(([key]) => selected.has(key));
            return (
              <div
                key={domain}
                className="flex flex-col gap-2.5 rounded-lg border border-border p-3"
              >
                <div className="flex items-center justify-between border-b border-border pb-2.5">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="size-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">
                      {domainLabel(domain)}
                    </span>
                  </div>
                  <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    Select all
                    <Checkbox
                      checked={allChecked}
                      indeterminate={someChecked}
                      disabled={!canEdit}
                      onCheckedChange={(checked) => toggleDomain(domain, checked === true)}
                    />
                  </label>
                </div>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {entries.map(([key, permission]) => (
                    <label
                      key={key}
                      className="flex items-start gap-2.5 rounded-md p-1.5 text-sm hover:bg-muted/50"
                    >
                      <Checkbox
                        checked={selected.has(key)}
                        disabled={!canEdit}
                        onCheckedChange={(checked) => togglePermission(key, checked === true)}
                        className="mt-0.5"
                      />
                      <span className="flex flex-col">
                        <span className="font-medium text-foreground">
                          {permission.description}
                        </span>
                        <span className="text-xs text-muted-foreground">{permission.name}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-2 border-t border-border pt-4">
        {formError ? <p className="text-xs text-destructive">{formError}</p> : <span />}
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={() => router.push("/dashboard/roles")}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting || !canEdit} className="gap-1.5">
            <ShieldCheck className="size-3.5" />
            {submitting ? "Saving…" : isEdit ? "Save changes" : "Create role"}
          </Button>
        </div>
      </div>
    </form>
  );
}
