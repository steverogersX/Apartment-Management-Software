"use client";

import * as React from "react";
import { useForm } from "@tanstack/react-form";
import { CalendarClock, Plus, Trash2, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { flats } from "@/lib/flatsMockData";
import { MultiSelectDropdown } from "@/components/notices/multiSelectDropdown";
import { DateTimePicker } from "@/components/dateTimePicker";
import { pollFormSchema, type PollFormInput } from "@/lib/pollsMockData";

function fieldError(errors: unknown[]): string | undefined {
  if (errors.length === 0) return undefined;
  const issue = errors[0];
  if (typeof issue === "string") return issue;
  if (issue && typeof issue === "object" && "message" in issue)
    return String((issue as { message: unknown }).message);
  return String(issue);
}

export function PollForm({
  onSave,
  onCancel,
}: {
  onSave: (values: PollFormInput) => void;
  onCancel: () => void;
}) {
  const towerOptions = React.useMemo(
    () => Array.from(new Set(flats.map((f) => f.tower))).sort(),
    [],
  );
  const flatOptions = React.useMemo(
    () => flats.map((f) => `${f.tower}-${f.flatNumber}`).sort(),
    [],
  );

  const form = useForm({
    defaultValues: {
      question: "",
      description: "",
      options: ["", ""],
      pollType: "single" as const,
      audienceScope: "All" as const,
      audienceValue: [] as string[],
      closesAt: "",
    } as PollFormInput,
    validators: { onChange: pollFormSchema },
    onSubmit: async ({ value }) => {
      onSave(value);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
      className="flex flex-col gap-6"
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 sm:p-5">
            <form.Field name="question">
              {(field) => (
                <div className="flex flex-col gap-1">
                  <input
                    id="poll-question"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Ask a question…"
                    aria-invalid={field.state.meta.errors.length > 0}
                    className="w-full border-none bg-transparent text-2xl font-semibold text-foreground outline-none placeholder:text-muted-foreground/50"
                  />
                  {fieldError(field.state.meta.errors) && (
                    <p className="text-xs text-destructive">
                      {fieldError(field.state.meta.errors)}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field name="description">
              {(field) => (
                <div className="flex flex-col gap-1.5">
                  <Textarea
                    id="poll-description"
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    rows={3}
                    placeholder="Add context (optional)…"
                    aria-invalid={field.state.meta.errors.length > 0}
                    className="resize-none border-none bg-transparent px-0 shadow-none focus-visible:ring-0"
                  />
                  {fieldError(field.state.meta.errors) && (
                    <p className="text-xs text-destructive">
                      {fieldError(field.state.meta.errors)}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field name="options">
              {(field) => (
                <div className="flex flex-col gap-2">
                  <Label>Options</Label>
                  <div className="flex flex-col gap-2">
                    {field.state.value.map((opt: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Input
                          value={opt}
                          onChange={(e) => {
                            const next = [...field.state.value];
                            next[idx] = e.target.value;
                            field.handleChange(next);
                          }}
                          onBlur={field.handleBlur}
                          placeholder={`Option ${idx + 1}`}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          disabled={field.state.value.length <= 2}
                          onClick={() => {
                            const next = field.state.value.filter(
                              (_: string, i: number) => i !== idx,
                            );
                            field.handleChange(next);
                          }}
                          aria-label={`Remove option ${idx + 1}`}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  {fieldError(field.state.meta.errors) && (
                    <p className="text-xs text-destructive">
                      {fieldError(field.state.meta.errors)}
                    </p>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-fit gap-1.5"
                    disabled={field.state.value.length >= 6}
                    onClick={() => field.handleChange([...field.state.value, ""])}
                  >
                    <Plus className="size-3.5" />
                    Add option
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    {field.state.value.length}/6 options
                  </p>
                </div>
              )}
            </form.Field>
          </div>

          <div className="flex flex-col divide-y divide-border rounded-lg border border-border bg-card px-4 sm:px-5">
            <div className="grid grid-cols-1 items-start gap-1.5 py-3 sm:grid-cols-[140px_1fr] sm:items-center sm:gap-4">
              <span className="text-sm text-muted-foreground">Poll type</span>
              <form.Field name="pollType">
                {(field) => (
                  <div className="inline-flex w-fit justify-self-start rounded-md border border-border bg-muted/30 p-0.5">
                    {(["single", "multiple"] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => field.handleChange(t)}
                        className={cn(
                          "rounded-[5px] px-3 py-1 text-xs font-medium capitalize transition-colors",
                          field.state.value === t
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {t === "single" ? "Single choice" : "Multiple choice"}
                      </button>
                    ))}
                  </div>
                )}
              </form.Field>
            </div>

            <div className="grid grid-cols-1 items-start gap-1.5 py-3 sm:grid-cols-[140px_1fr] sm:items-center sm:gap-4">
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Users className="size-3.5" />
                Audience
              </span>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
                <form.Field name="audienceScope">
                  {(field) => (
                    <Select
                      value={field.state.value}
                      onValueChange={(v) => {
                        field.handleChange(v as PollFormInput["audienceScope"]);
                        form.setFieldValue("audienceValue", []);
                      }}
                    >
                      <SelectTrigger className="w-full sm:w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All residents</SelectItem>
                        <SelectItem value="Blocks">Specific blocks</SelectItem>
                        <SelectItem value="Flats">Specific flats</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </form.Field>
                <form.Subscribe selector={(s) => s.values.audienceScope}>
                  {(scope) =>
                    scope !== "All" && (
                      <form.Field name="audienceValue">
                        {(field) => (
                          <MultiSelectDropdown
                            options={scope === "Blocks" ? towerOptions : flatOptions}
                            value={field.state.value ?? []}
                            onChange={(v) => field.handleChange(v)}
                            placeholder={scope === "Blocks" ? "Select blocks" : "Select flats"}
                            searchPlaceholder={
                              scope === "Blocks" ? "Search blocks…" : "Search flats…"
                            }
                          />
                        )}
                      </form.Field>
                    )
                  }
                </form.Subscribe>
              </div>
            </div>

            <div className="grid grid-cols-1 items-start gap-1.5 py-3 sm:grid-cols-[140px_1fr] sm:items-center sm:gap-4">
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <CalendarClock className="size-3.5" />
                Closes at
              </span>
              <form.Field name="closesAt">
                {(field) => (
                  <div className="flex flex-col gap-1">
                    <DateTimePicker
                      value={field.state.value ?? ""}
                      onChange={(v) => field.handleChange(v)}
                      placeholder="Pick a closing date and time"
                    />
                    {fieldError(field.state.meta.errors) && (
                      <p className="text-xs text-destructive">
                        {fieldError(field.state.meta.errors)}
                      </p>
                    )}
                  </div>
                )}
              </form.Field>
            </div>
          </div>
        </div>

        <aside className="h-fit lg:sticky lg:top-6">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Preview</p>
          <form.Subscribe
            selector={(s) =>
              [
                s.values.question,
                s.values.description,
                s.values.options,
                s.values.pollType,
              ] as const
            }
          >
            {([question, description, options, pollType]) => (
              <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
                <div className="flex flex-col gap-3 p-4">
                  <h4 className="text-sm font-semibold text-foreground">
                    {(question as string) || "Untitled poll"}
                  </h4>
                  {(description as string) && (
                    <p className="text-xs text-muted-foreground">{description as string}</p>
                  )}
                  <p className="text-[11px] text-muted-foreground">
                    {pollType === "single" ? "Single choice" : "Multiple choice"} ·{" "}
                    {(options as string[]).filter(Boolean).length} options
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {(options as string[]).map((opt, i) => (
                      <div
                        key={i}
                        className="rounded-md border border-border px-3 py-2 text-xs text-foreground"
                      >
                        {opt || `Option ${i + 1}`}
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-[10px]">
                      Preview
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </form.Subscribe>
        </aside>
      </div>

      <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
        {([canSubmit, isSubmitting]) => (
          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? "Saving…" : "Create poll"}
            </Button>
          </div>
        )}
      </form.Subscribe>
    </form>
  );
}
