"use client";

import { ServiceProvidersTable } from "@/components/serviceProvidersTable";

export default function ServiceProvidersPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">Service Providers</h1>
        <p className="text-sm text-muted-foreground">
          Trusted vendors and service contacts for the society.
        </p>
      </div>
      <ServiceProvidersTable />
    </div>
  );
}
