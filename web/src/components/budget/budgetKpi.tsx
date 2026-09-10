import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function VarianceStat({ planned, actual }: { planned: number; actual: number }) {
  const variance = actual - planned;
  const variancePct = planned ? (variance / planned) * 100 : 0;
  const isBad = variance > 0;
  const isGood = variance < 0;
  const colorClass = isBad
    ? "text-red-600 dark:text-red-400"
    : isGood
      ? "text-emerald-600 dark:text-emerald-400"
      : "";

  return (
    <Card>
      <CardHeader className="pb-2">
        <p className="text-xs text-muted-foreground">Variance</p>
        <CardTitle className={`text-2xl tabular-nums ${colorClass}`}>
          {variance > 0 ? "+" : ""}
          {formatCurrency(variance)}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className={`text-xs tabular-nums ${colorClass || "text-muted-foreground"}`}>
          {variancePct > 0 ? "+" : ""}
          {variancePct.toFixed(1)}%
        </p>
      </CardContent>
    </Card>
  );
}

export function BudgetKpiRow({
  label,
  planned,
  actual,
}: {
  label: string;
  planned: number;
  actual: number;
}) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-foreground">{label}</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <p className="text-xs text-muted-foreground">Planned</p>
            <CardTitle className="text-2xl tabular-nums">{formatCurrency(planned)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <p className="text-xs text-muted-foreground">Actual</p>
            <CardTitle className="text-2xl tabular-nums">{formatCurrency(actual)}</CardTitle>
          </CardHeader>
        </Card>
        <VarianceStat planned={planned} actual={actual} />
      </div>
    </div>
  );
}
