import { Wrench } from "lucide-react";

import { Card } from "@/components/ui/card";

export default function MaintenanceHistoryPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">History</h1>
        <p className="text-sm text-muted-foreground">
          Past maintenance requests and service records for this society.
        </p>
      </div>
      <Card className="items-center justify-center gap-2 rounded-md py-16 text-center">
        <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Wrench className="size-4.5" />
        </span>
        <p className="text-sm font-medium text-foreground">No maintenance history yet</p>
        <p className="max-w-xs text-xs text-muted-foreground">
          Completed and past maintenance requests will show up here.
        </p>
      </Card>
    </div>
  );
}
