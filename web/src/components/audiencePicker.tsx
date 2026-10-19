"use client";

import * as React from "react";

import { MultiSelectDropdown } from "@/components/notices/multiSelectDropdown";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { flats, getTowers } from "@/lib/flatsMockData";
import { cn } from "@/lib/utils";

export type AudienceScope = "All" | "Blocks" | "Flats";

export function AudiencePicker({
  scope,
  value,
  onScopeChange,
  onValueChange,
  triggerClassName,
}: {
  scope: AudienceScope;
  value: string[];
  onScopeChange: (scope: AudienceScope) => void;
  onValueChange: (value: string[]) => void;
  triggerClassName?: string;
}) {
  const towerOptions = React.useMemo(() => getTowers(), []);
  const flatOptions = React.useMemo(
    () => flats.map((f) => `${f.tower}-${f.flatNumber}`).sort(),
    [],
  );

  return (
    <>
      <Select value={scope} onValueChange={(v) => onScopeChange(v as AudienceScope)}>
        <SelectTrigger className={cn("w-full sm:w-40", triggerClassName)}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All residents</SelectItem>
          <SelectItem value="Blocks">Specific blocks</SelectItem>
          <SelectItem value="Flats">Specific flats</SelectItem>
        </SelectContent>
      </Select>
      {scope !== "All" && (
        <MultiSelectDropdown
          options={scope === "Blocks" ? towerOptions : flatOptions}
          value={value}
          onChange={onValueChange}
          placeholder={scope === "Blocks" ? "Select blocks" : "Select flats"}
          searchPlaceholder={scope === "Blocks" ? "Search blocks…" : "Search flats…"}
        />
      )}
    </>
  );
}
