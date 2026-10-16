"use client";

import { useForm } from "@tanstack/react-form";
import { CalendarClock, MapPin, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { DateTimePicker } from "@/components/dateTimePicker";
import { meetingFormSchema, type MeetingFormInput } from "@/lib/meetingsMockData";
import { fieldError } from "@/lib/fieldError";
import { AudiencePicker } from "@/components/audiencePicker";

function formatPreviewDate(iso: string) {
  return iso
    ? new Date(iso).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
      })
    : "Pick a date and time";
}

export function MeetingForm({
  onSave,
  onCancel,
}: {
  onSave: (values: MeetingFormInput) => void;
  onCancel: () => void;
}) {
  const form = useForm({
    defaultValues: {
      title: "",
      agenda: "",
      location: "",
      scheduledAt: "",
      audienceScope: "All" as const,
      audienceValue: [] as string[],
    } as MeetingFormInput,
    validators: { onChange: meetingFormSchema },
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
            <form.Field name="title">
              {(field) => (
                <div className="flex flex-col gap-1">
                  <input
                    id="meeting-title"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Untitled meeting"
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

            <form.Field name="agenda">
              {(field) => (
                <div className="flex flex-col gap-1.5">
                  <Textarea
                    id="meeting-agenda"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    rows={5}
                    placeholder="Write the agenda…"
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

            <form.Field name="location">
              {(field) => (
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">Location</label>
                  <Input
                    id="meeting-location"
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Clubhouse, Conference Room or https://meet.link"
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
          </div>

          <div className="flex flex-col divide-y divide-border rounded-lg border border-border bg-card px-4 sm:px-5">
            <div className="grid grid-cols-1 items-start gap-1.5 py-3 sm:grid-cols-[140px_1fr] sm:items-center sm:gap-4">
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <CalendarClock className="size-3.5" />
                Scheduled
              </span>
              <form.Field name="scheduledAt">
                {(field) => (
                  <div className="flex flex-col gap-1">
                    <DateTimePicker
                      value={field.state.value ?? ""}
                      onChange={(v) => field.handleChange(v)}
                      placeholder="Pick a date and time"
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
          </div>
        </div>

        <aside className="h-fit lg:sticky lg:top-6">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Preview</p>
          <form.Subscribe
            selector={(s) =>
              [
                s.values.title,
                s.values.agenda,
                s.values.location,
                s.values.scheduledAt,
                s.values.audienceScope,
                s.values.audienceValue,
              ] as const
            }
          >
            {([title, agenda, location, scheduledAt, audienceScope, audienceValue]) => {
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
                      {(title as string) || "Untitled meeting"}
                    </h4>
                    <p className="line-clamp-4 text-xs leading-relaxed text-muted-foreground">
                      {(agenda as string) || "Agenda will appear here…"}
                    </p>
                    {(location as string) && (
                      <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="size-3" />
                        {location as string}
                      </p>
                    )}
                    <p className="text-[11px] text-muted-foreground">
                      {formatPreviewDate(scheduledAt as string)}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{audienceLabel}</p>
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
              {isSubmitting ? "Saving…" : "Create meeting"}
            </Button>
          </div>
        )}
      </form.Subscribe>
    </form>
  );
}
