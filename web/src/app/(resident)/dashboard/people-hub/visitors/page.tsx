"use client";

import { SocietyVisitorsTable } from "@/components/societyVisitorsTable";

export default function VisitorsHubPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">Visitor Log</h1>
        <p className="text-sm text-muted-foreground">
          Every visitor, every flat — gate logs and pre-approvals.
        </p>
      </div>
      <SocietyVisitorsTable />
    </div>
  );
}
