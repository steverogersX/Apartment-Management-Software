"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { Breadcrumbs, BreadcrumbTitleProvider } from "@/components/breadcrumbs";
import { useAuth } from "@/hooks/useAuth";

export default function ResidentLayout({ children }: { children: React.ReactNode }) {
  const { status, user } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
    else if (status === "authenticated" && user?.isSuperAdmin) router.replace("/platform");
  }, [status, user, router]);

  if (status !== "authenticated" || user?.isSuperAdmin) return null;

  return (
    <div className="flex h-screen w-full gap-2 overflow-hidden bg-muted/40 p-2">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-background shadow-sm">
        <BreadcrumbTitleProvider>
          <Topbar />
          <div className="border-b border-border px-4 py-2.5 md:px-6">
            <Breadcrumbs />
          </div>
          <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
        </BreadcrumbTitleProvider>
      </div>
    </div>
  );
}
