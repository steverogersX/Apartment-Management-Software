import { InviteVisitorDialog } from "@/components/inviteVisitorDialog";
import { VisitorsTable } from "@/components/visitorsTable";

export default function VisitorsPage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Visitors</h1>
          <p className="text-sm text-muted-foreground">
            Pre-invite guests and review who came to Flat 304.
          </p>
        </div>
        <InviteVisitorDialog />
      </div>

      <VisitorsTable />
    </div>
  );
}
