import { Card } from "@/components/ui/card";
import { currentFlat } from "@/lib/mockData";

const fields: { label: string; value: string }[] = [
  { label: "Flat number", value: currentFlat.flatNumber },
  { label: "Tower", value: currentFlat.apartmentName },
  { label: "Floor", value: String(currentFlat.floor) },
  { label: "Type", value: currentFlat.type },
  { label: "Area", value: `${currentFlat.areaSqft} sq ft` },
  { label: "Owner", value: currentFlat.ownerName },
  { label: "Tenant", value: currentFlat.tenantName ?? "—" },
];

export default function FlatPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">My Flat</h1>
        <p className="text-sm text-muted-foreground">Ownership and unit details on record.</p>
      </div>

      <Card className="rounded-md gap-0 divide-y divide-border px-4 py-0">
        {fields.map((f) => (
          <div key={f.label} className="flex items-center justify-between py-3 text-sm">
            <span className="text-muted-foreground">{f.label}</span>
            <span className="font-medium text-foreground">{f.value}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}
