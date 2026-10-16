"use client";

import * as React from "react";
import { Search } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";

type FlatOption = { id: string; tower: string; flatNumber: string };

export function FlatCheckboxGrid({
  flats,
  isChecked,
  onToggle,
}: {
  flats: FlatOption[];
  isChecked: (flat: FlatOption) => boolean;
  onToggle: (flat: FlatOption, checked: boolean) => void;
}) {
  const [query, setQuery] = React.useState("");
  const visible = flats.filter((f) =>
    `${f.tower}-${f.flatNumber}`.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <div className="overflow-hidden rounded-md border border-border">
      <div className="flex items-center gap-1.5 border-b border-border px-2.5">
        <Search className="size-3.5 shrink-0 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search flats…"
          className="h-8 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
      <div className="max-h-36 overflow-y-auto p-2">
        {visible.length === 0 ? (
          <p className="py-2 text-center text-sm text-muted-foreground">No flats found.</p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {visible.map((f) => (
              <label
                key={f.id}
                className="flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 text-sm hover:bg-muted"
              >
                <Checkbox checked={isChecked(f)} onCheckedChange={(v) => onToggle(f, v === true)} />
                <span className="truncate">
                  {f.tower}-{f.flatNumber}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
