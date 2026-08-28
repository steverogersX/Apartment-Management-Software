import { ComplaintsTable } from "@/components/complaintsTable";

export default function ComplaintsPage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">Complaints</h1>
        <p className="text-sm text-muted-foreground">
          Raise, track, and resolve issues for Flat 304.
        </p>
      </div>
      <ComplaintsTable />
    </div>
  );
}
