"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { RoleResponse } from "@shared/index";

import { RolePermissionForm } from "@/components/roles/rolePermissionForm";
import { useBreadcrumbTitle } from "@/components/breadcrumbs";
import { useAuth } from "@/hooks/useAuth";
import { getRoleRequest } from "@/lib/roleApi";
import { ApiClientError } from "@/lib/apiClient";

export default function EditRolePage() {
  const params = useParams<{ roleId: string }>();
  const { token, activeSociety } = useAuth();
  const [role, setRole] = React.useState<RoleResponse | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!token || !activeSociety) return;
    getRoleRequest(token, activeSociety.societyToken, activeSociety.societyId, params.roleId)
      .then(setRole)
      .catch((err) => setError(err instanceof ApiClientError ? err.message : "Role not found"));
  }, [token, activeSociety, params.roleId]);

  useBreadcrumbTitle(role?.name);

  if (error) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <p className="text-sm text-muted-foreground">{error}</p>
        <Link href="/dashboard/roles" className="text-sm font-medium text-foreground underline">
          Back to roles
        </Link>
      </div>
    );
  }

  if (!role) return null;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Link
          href="/dashboard/roles"
          className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back to roles
        </Link>
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">{role.name}</h1>
          <p className="text-sm text-muted-foreground">
            {role.isSystem
              ? "System roles are fixed and cannot be edited."
              : "Update the name, description, and permissions for this role."}
          </p>
        </div>
      </div>

      <RolePermissionForm role={role} />
    </div>
  );
}
