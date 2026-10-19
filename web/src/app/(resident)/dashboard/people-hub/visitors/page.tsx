"use client";

import { SocietyVisitorsTable } from "@/components/societyVisitorsTable";
import { PageIcon } from "@/components/pageIcon";

export default function VisitorsHubPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <div>
        <h1 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground">
          <PageIcon />
          Visitor Log
        </h1>
        <p className="text-sm text-muted-foreground">
          Every visitor, every flat — gate logs and pre-approvals.
        </p>
      </div>
      <SocietyVisitorsTable />
    </div>
  );
}
