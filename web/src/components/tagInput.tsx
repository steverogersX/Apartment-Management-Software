"use client";

import * as React from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function TagInput({
  value,
  onChange,
  suggestions,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions: string[];
}) {
  const [draft, setDraft] = React.useState("");
  const filtered = suggestions.filter(
    (t) => !value.includes(t) && t.toLowerCase().includes(draft.toLowerCase()),
  );

  function addTag(raw: string) {
    const tag = raw.trim().toLowerCase().replace(/\s+/g, "-");
    if (!tag || value.includes(tag)) return;
    onChange([...value, tag]);
    setDraft("");
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag));
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-2 py-1.5 focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50">
        {value.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-1 pr-1">
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="rounded-full p-0.5 text-muted-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
              aria-label={`Remove ${tag} tag`}
            >
              <X className="size-3" />
            </button>
          </Badge>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              addTag(draft);
            } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
              removeTag(value[value.length - 1]);
            }
          }}
          placeholder={value.length === 0 ? "Add tags…" : ""}
          className="h-6 min-w-24 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
      {draft && filtered.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {filtered.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => addTag(s)}
              className={cn(
                "rounded-full border border-dashed border-border px-2 py-0.5 text-xs text-muted-foreground transition-colors hover:border-foreground hover:text-foreground",
              )}
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
