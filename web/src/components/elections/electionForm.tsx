"use client";

import * as React from "react";
import { useForm } from "@tanstack/react-form";
import { CalendarClock, Plus, Trash2, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { DateTimePicker } from "@/components/dateTimePicker";
import { CoverImageDropzone } from "@/components/fileDropzone";
import { electionFormSchema, type ElectionFormInput } from "@/lib/electionsMockData";
import { fieldError } from "@/lib/fieldError";
import { AudiencePicker } from "@/components/audiencePicker";

export function ElectionForm({
  onSave,
  onCancel,
}: {
  onSave: (values: ElectionFormInput) => void;
  onCancel: () => void;
}) {
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      seats: 1,
      candidates: [
        { name: "", flat: "", statement: "", photo: undefined },
        { name: "", flat: "", statement: "", photo: undefined },
      ],
      audienceScope: "All" as const,
      audienceValue: [] as string[],
      opensAt: "",
      closesAt: "",
    } as ElectionFormInput,
    validators: { onChange: electionFormSchema },
    onSubmit: async ({ value }) => {
      // Validate seats < candidates.length
      if (value.seats >= value.candidates.length) {
        setSubmitError(
          `Seats (${value.seats}) must be less than number of candidates (${value.candidates.length})`,
        );
        return;
      }
      // Validate closesAt after opensAt
      if (new Date(value.closesAt).getTime() <= new Date(value.opensAt).getTime()) {
        setSubmitError("Closing time must be after opening time");
        return;
      }
      setSubmitError(null);
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
            <form.Field name="title">
              {(field) => (
                <div className="flex flex-col gap-1">
                  <input
                    id="election-title"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Untitled election"
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
                    id="election-description"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    rows={4}
                    placeholder="Describe the election — number of open seats, term length, context…"
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

            <form.Field name="seats">
              {(field) => (
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">Open seats</label>
                  <Input
                    id="election-seats"
                    type="number"
                    min={1}
                    value={field.state.value as number}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(Number(e.target.value) || 0)}
                    placeholder="2"
                    className="w-32"
                    aria-invalid={field.state.meta.errors.length > 0}
                  />
                  {fieldError(field.state.meta.errors) && (
                    <p className="text-xs text-destructive">
                      {fieldError(field.state.meta.errors)}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field name="candidates">
              {(field) => (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">Candidates</label>
                    <span className="text-xs text-muted-foreground">
                      {field.state.value.length} candidates
                    </span>
                  </div>
                  <div className="flex flex-col gap-3">
                    {field.state.value.map(
                      (
                        candidate: {
                          name: string;
                          flat: string;
                          statement: string;
                          photo?: string;
                        },
                        idx: number,
                      ) => (
                        <div
                          key={idx}
                          className="flex flex-col gap-2 rounded-lg border border-border p-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground">
                              Candidate {idx + 1}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              disabled={field.state.value.length <= 2}
                              onClick={() => {
                                const next = field.state.value.filter(
                                  (_: unknown, i: number) => i !== idx,
                                );
                                field.handleChange(next);
                              }}
                              aria-label={`Remove candidate ${idx + 1}`}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                          <Input
                            value={candidate.name}
                            onChange={(e) => {
                              const next = [...field.state.value];
                              next[idx] = { ...next[idx], name: e.target.value };
                              field.handleChange(next);
                            }}
                            placeholder="Name"
                            className="w-full"
                          />
                          <Input
                            value={candidate.flat}
                            onChange={(e) => {
                              const next = [...field.state.value];
                              next[idx] = { ...next[idx], flat: e.target.value };
                              field.handleChange(next);
                            }}
                            placeholder="Flat (e.g. A-301)"
                            className="w-full"
                          />
                          <Textarea
                            value={candidate.statement}
                            onChange={(e) => {
                              const next = [...field.state.value];
                              next[idx] = { ...next[idx], statement: e.target.value };
                              field.handleChange(next);
                            }}
                            placeholder="Short manifesto / statement…"
                            rows={2}
                            className="resize-none"
                          />
                          <CoverImageDropzone
                            value={candidate.photo}
                            onChange={(v) => {
                              const next = [...field.state.value];
                              next[idx] = { ...next[idx], photo: v };
                              field.handleChange(next);
                            }}
                          />
                        </div>
                      ),
                    )}
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
                    onClick={() =>
                      field.handleChange([
                        ...field.state.value,
                        { name: "", flat: "", statement: "", photo: undefined },
                      ])
                    }
                  >
                    <Plus className="size-3.5" />
                    Add candidate
                  </Button>
                </div>
              )}
            </form.Field>
          </div>

          <div className="flex flex-col divide-y divide-border rounded-lg border border-border bg-card px-4 sm:px-5">
            <div className="grid grid-cols-1 items-start gap-1.5 py-3 sm:grid-cols-[140px_1fr] sm:items-center sm:gap-4">
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Users className="size-3.5" />
                Audience
              </span>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
                <form.Subscribe selector={(s) => s.values}>
                  {(values) => (
                    <AudiencePicker
                      scope={values.audienceScope}
                      value={values.audienceValue ?? []}
                      onScopeChange={(scope) => {
                        form.setFieldValue("audienceScope", scope);
                        form.setFieldValue("audienceValue", []);
                      }}
                      onValueChange={(value) => form.setFieldValue("audienceValue", value)}
                    />
                  )}
                </form.Subscribe>
              </div>
            </div>

            <div className="grid grid-cols-1 items-start gap-1.5 py-3 sm:grid-cols-[140px_1fr] sm:items-center sm:gap-4">
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <CalendarClock className="size-3.5" />
                Opens at
              </span>
              <form.Field name="opensAt">
                {(field) => (
                  <div className="flex flex-col gap-1">
                    <DateTimePicker
                      value={field.state.value ?? ""}
                      onChange={(v) => field.handleChange(v)}
                      placeholder="Pick opening date and time"
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
                      placeholder="Pick closing date and time"
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
          {submitError && <p className="text-xs text-destructive">{submitError}</p>}
        </div>

        <aside className="h-fit lg:sticky lg:top-6">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Preview</p>
          <form.Subscribe
            selector={(s) =>
              [
                s.values.title,
                s.values.seats,
                s.values.candidates,
                s.values.audienceScope,
                s.values.audienceValue,
              ] as const
            }
          >
            {([title, seats, candidates, audienceScope, audienceValue]) => {
              const audienceLabel =
                audienceScope === "All"
                  ? "All residents"
                  : audienceScope === "Blocks"
                    ? `Blocks: ${(audienceValue as string[]).join(", ") || "—"}`
                    : `Flats: ${(audienceValue as string[]).join(", ") || "—"}`;
              return (
                <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
                  <div className="flex flex-col gap-2 p-4">
                    <h4 className="text-sm font-semibold text-foreground">
                      {(title as string) || "Untitled election"}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {(seats as number) || 1} seat{(seats as number) === 1 ? "" : "s"} ·{" "}
                      {(candidates as unknown[]).length} candidates
                    </p>
                    <p className="text-[11px] text-muted-foreground">{audienceLabel}</p>
                    <div className="flex flex-col gap-1">
                      {(candidates as { name: string; flat: string }[]).slice(0, 3).map((c, i) => (
                        <div
                          key={i}
                          className="rounded-md border border-border px-2 py-1 text-xs text-foreground"
                        >
                          {c.name || `Candidate ${i + 1}`} {c.flat ? `· ${c.flat}` : ""}
                        </div>
                      ))}
                      {(candidates as unknown[]).length > 3 && (
                        <p className="text-[11px] text-muted-foreground">
                          +{(candidates as unknown[]).length - 3} more
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-[10px]">
                        Preview
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            }}
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
              {isSubmitting ? "Saving…" : "Create election"}
            </Button>
          </div>
        )}
      </form.Subscribe>
    </form>
  );
}
