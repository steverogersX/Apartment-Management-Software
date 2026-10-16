"use client";

import { ServiceProvidersTable } from "@/components/serviceProvidersTable";
import { PageIcon } from "@/components/pageIcon";

export default function ServiceProvidersPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <div>
        <h1 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground">
          <PageIcon />
          Service Providers
        </h1>
        <p className="text-sm text-muted-foreground">
          Daily help and visiting service providers linked to residents&apos; flats. Society staff
          are under Staff; purchase vendors are under Accounts → Purchasing.
        </p>
      </div>
      <ServiceProvidersTable />
    </div>
  );
}
