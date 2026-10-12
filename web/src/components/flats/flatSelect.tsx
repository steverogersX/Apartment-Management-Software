"use client";

import * as React from "react";
import { Home } from "lucide-react";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxSearchInput,
  ComboboxTrigger,
  ComboboxValue,
} from "@/components/ui/combobox";
import { cn } from "@/lib/utils";

type FlatOption = { value: string; label: string };

export function FlatSelect({
  flats,
  value,
  onValueChange,
  valueKey = "id",
  placeholder = "Select a flat",
  id,
  disabled,
  className,
}: {
  flats: { id: string; tower: string; flatNumber: string }[];
  value: string;
  onValueChange: (value: string) => void;
  valueKey?: "id" | "label";
  placeholder?: string;
  id?: string;
  disabled?: boolean;
  className?: string;
}) {
  const options = React.useMemo<FlatOption[]>(
    () =>
      flats.map((f) => {
        const label = `${f.tower}-${f.flatNumber}`;
        return { value: valueKey === "id" ? f.id : label, label };
      }),
    [flats, valueKey],
  );
  const selected = options.find((o) => o.value === value) ?? null;

  return (
    <Combobox
      items={options}
      value={selected}
      onValueChange={(option: FlatOption | null) => onValueChange(option?.value ?? "")}
      disabled={disabled}
      autoHighlight
    >
      <ComboboxTrigger id={id} className={cn("w-full", className)}>
        <ComboboxValue>
          {(option: FlatOption | null) =>
            option ? (
              <>
                <Home className="size-3.5 text-muted-foreground" />
                {option.label}
              </>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )
          }
        </ComboboxValue>
      </ComboboxTrigger>
      <ComboboxContent>
        <ComboboxSearchInput placeholder="Search flats…" />
        <ComboboxEmpty>No flats found.</ComboboxEmpty>
        <ComboboxList>
          {(option: FlatOption) => (
            <ComboboxItem key={option.value} value={option}>
              <Home className="size-3.5 text-muted-foreground" />
              {option.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
