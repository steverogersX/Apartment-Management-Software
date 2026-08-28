import { Car, Bike } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { vehicles } from "@/lib/mockData";

export default function VehiclesPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-5">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">Vehicles & Parking</h1>
        <p className="text-sm text-muted-foreground">Registered vehicles for Flat 304.</p>
      </div>

      <div className="overflow-hidden rounded-md border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="h-9 bg-muted/40 px-4 text-xs font-medium text-muted-foreground">
                Vehicle
              </TableHead>
              <TableHead className="h-9 bg-muted/40 px-4 text-xs font-medium text-muted-foreground">
                Registration
              </TableHead>
              <TableHead className="h-9 bg-muted/40 px-4 text-xs font-medium text-muted-foreground">
                Color
              </TableHead>
              <TableHead className="h-9 bg-muted/40 px-4 text-xs font-medium text-muted-foreground">
                Parking slot
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicles.map((v) => {
              const Icon = v.type === "car" ? Car : Bike;
              return (
                <TableRow key={v.id} className="border-border hover:bg-muted/50">
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
                        <Icon className="size-4" />
                      </span>
                      <span className="font-medium text-foreground">
                        {v.make} {v.model}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 font-mono text-xs font-medium tabular-nums text-foreground">
                    {v.registrationNumber}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-muted-foreground">{v.color}</TableCell>
                  <TableCell className="px-4 py-3 text-muted-foreground">
                    {v.parkingSlot ?? "Unassigned"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
