import { Dumbbell, Waves, TreePalm, Music } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const amenities = [
  { name: "Clubhouse", icon: Music, status: "Open", hours: "6 AM – 10 PM" },
  { name: "Swimming Pool", icon: Waves, status: "Open", hours: "6 AM – 8 PM" },
  { name: "Gym", icon: Dumbbell, status: "Open", hours: "5 AM – 10 PM" },
  { name: "Children's Park", icon: TreePalm, status: "Closed", hours: "4 PM – 7 PM" },
];

export default function AmenitiesPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-5">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">Amenities</h1>
        <p className="text-sm text-muted-foreground">View rules, timings, and book a slot.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {amenities.map((a) => (
          <Card
            key={a.name}
            className="rounded-md flex-row items-center justify-between px-4 py-3.5"
          >
            <div className="flex items-center gap-3">
              <span className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
                <a.icon className="size-4" />
              </span>
              <div>
                <p className="text-sm font-medium text-foreground">{a.name}</p>
                <p className="text-xs text-muted-foreground">{a.hours}</p>
              </div>
            </div>
            <Badge
              variant="outline"
              className={
                a.status === "Open"
                  ? "border-emerald-200 text-emerald-700 dark:border-emerald-800 dark:text-emerald-400"
                  : "text-muted-foreground"
              }
            >
              {a.status}
            </Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}
