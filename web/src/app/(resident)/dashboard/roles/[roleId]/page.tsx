"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { RolePermissionForm } from "@/components/roles/rolePermissionForm";
import { useBreadcrumbTitle } from "@/components/breadcrumbs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, getInitials, gradientForName } from "@/lib/utils";
import { roles } from "@/lib/rolesMockData";
import { users } from "@/lib/usersMockData";
import type { UserAccountStatus } from "@/lib/usersMockData";

const STATUS_DOT: Record<UserAccountStatus, string> = {
  active: "bg-emerald-500",
  invited: "bg-amber-500",
  suspended: "bg-red-500",
};

const STATUS_LABEL: Record<UserAccountStatus, string> = {
  active: "Active",
  invited: "Invited",
  suspended: "Suspended",
};

export default function EditRolePage() {
  const params = useParams<{ roleId: string }>();
  const role = roles.find((r) => r.id === params.roleId) ?? null;

  useBreadcrumbTitle(role?.name);

  if (!role) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <p className="text-sm text-muted-foreground">Role not found</p>
        <Link href="/dashboard/roles" className="text-sm font-medium text-foreground underline">
          Back to roles
        </Link>
      </div>
    );
  }

  const members = users.filter((u) => u.role === role.name);
  const roleForForm = {
    ...role,
    societyId: "mock-society",
    createdAt: new Date(role.updatedAt),
    updatedAt: new Date(role.updatedAt),
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
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

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px]">
        <RolePermissionForm role={roleForForm} />

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Members ({members.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {members.length === 0 ? (
              <p className="text-sm text-muted-foreground">No members assigned to this role yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {members.map((user) => {
                  const [from, to] = gradientForName(user.name);
                  return (
                    <div key={user.id} className="flex items-center gap-3">
                      <Avatar size="sm">
                        <AvatarImage
                          src={`https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(user.id)}`}
                          alt={user.name}
                        />
                        <AvatarFallback
                          className="text-[10px] font-semibold text-white"
                          style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}
                        >
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-sm font-medium text-foreground">
                          {user.name}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                      </div>
                      <span className="inline-flex shrink-0 items-center gap-1.5">
                        <span
                          className={cn("size-1.5 shrink-0 rounded-full", STATUS_DOT[user.status])}
                        />
                        <span className="whitespace-nowrap text-xs font-medium text-foreground">
                          {STATUS_LABEL[user.status]}
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
