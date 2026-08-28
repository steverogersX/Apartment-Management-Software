import { ComplaintsTable } from "@/components/complaintsTable";
import { platformComplaints } from "@/lib/platformMockData";

export default function PlatformComplaintsPage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">Complaints</h1>
        <p className="text-sm text-muted-foreground">
          Escalations and tickets raised across every society on the platform.
        </p>
      </div>
      <ComplaintsTable
        data={platformComplaints}
        title="All complaints"
        showSociety
        showAssignee={false}
        showPageSize
      />
    </div>
  );
}
