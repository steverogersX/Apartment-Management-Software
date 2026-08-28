import { BillsChart } from "@/components/billsChart";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { stats, billHistory } from "@/lib/mockData";

export default function BillingPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Bills & Payments</h1>
          <p className="text-sm text-muted-foreground">Flat 304 maintenance ledger.</p>
        </div>
        {stats.outstandingDues > 0 && (
          <Badge variant="destructive" className="rounded-full">
            ₹{stats.outstandingDues.toLocaleString()} due
          </Badge>
        )}
      </div>

      <BillsChart />

      <Card className="rounded-md gap-0 divide-y divide-border px-4 py-0">
        {billHistory
          .slice()
          .reverse()
          .map((month) => (
            <div key={month.date} className="flex items-center justify-between py-3 text-sm">
              <span className="text-foreground">
                {month.month} {new Date(month.date).getFullYear()}
              </span>
              {month.due > 0 ? (
                <span className="font-medium text-red-600 dark:text-red-400">
                  ₹{month.due.toLocaleString()} due
                </span>
              ) : (
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  ₹{month.paid.toLocaleString()} paid
                </span>
              )}
            </div>
          ))}
      </Card>
    </div>
  );
}
