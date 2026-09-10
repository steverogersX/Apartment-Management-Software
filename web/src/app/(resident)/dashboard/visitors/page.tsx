"use client";

import { InviteVisitorDialog } from "@/components/inviteVisitorDialog";
import { VisitorsTable } from "@/components/visitorsTable";
import { useCurrentFlat } from "@/hooks/useCurrentFlat";

export default function VisitorsPage() {
  const { flatNumber } = useCurrentFlat();

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">My Visitors</h1>
          <p className="text-sm text-muted-foreground">
            Pre-invite guests and review who came to{" "}
            {flatNumber ? `Flat ${flatNumber}` : "your flat"}.
          </p>
        </div>
        <InviteVisitorDialog />
      </div>

      <VisitorsTable />
    </div>
  );
}
