import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { RolePermissionForm } from "@/components/roles/rolePermissionForm";

export default function NewRolePage() {
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
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Create role</h1>
          <p className="text-sm text-muted-foreground">
            Pick exactly what this role can see and do across the society.
          </p>
        </div>
      </div>

      <RolePermissionForm />
    </div>
  );
}
