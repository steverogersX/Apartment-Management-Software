import * as React from "react";
import { HistoryTable } from "@/components/historyTable";

export default function HistoryPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">History</h1>
        <p className="text-sm text-muted-foreground">
          Past occupancy and vehicle records for this society.
        </p>
      </div>
      <React.Suspense fallback={null}>
        <HistoryTable />
      </React.Suspense>
    </div>
  );
}
