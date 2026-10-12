"use client";

import * as React from "react";
import { useForm } from "@tanstack/react-form";
import { CalendarClock, Megaphone, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  NOTICE_CATEGORIES,
  SUGGESTED_NOTICE_TAGS,
  noticeFormSchema,
  type BoardNotice,
  type NoticeFormInput,
} from "@/lib/noticesMockData";
import { flats } from "@/lib/flatsMockData";
import { TagInput } from "@/components/tagInput";
import { AttachmentDropzone, CoverImageDropzone } from "@/components/fileDropzone";
import { MultiSelectDropdown } from "@/components/notices/multiSelectDropdown";
import { DateTimePicker } from "@/components/dateTimePicker";

function fieldError(errors: unknown[]): string | undefined {
  if (errors.length === 0) return undefined;
  const issue = errors[0];
  if (typeof issue === "string") return issue;
  if (issue && typeof issue === "object" && "message" in issue)
    return String((issue as { message: unknown }).message);
  return String(issue);
}

function PropertyRow({
  icon: Icon,
  label,
  children,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 items-start gap-1.5 py-3 sm:grid-cols-[140px_1fr] sm:items-center sm:gap-4">
      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
        {Icon && <Icon className="size-3.5" />}
        {label}
      </span>
      <div>{children}</div>
    </div>
  );
}

function formatPreviewDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function NoticeForm({
  notice,
  onSave,
  onCancel,
}: {
  notice?: BoardNotice | null;
  onSave: (values: NoticeFormInput) => void;
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
      title: notice?.title ?? "",
      description: notice?.description ?? "",
      category: notice?.category ?? "General",
      priority: notice?.priority ?? "normal",
      audienceScope: notice ? notice.audience.scope : "All",
      audienceValue:
        notice?.audience.scope === "Blocks"
          ? notice.audience.blocks
          : notice?.audience.scope === "Flats"
            ? notice.audience.flats
            : [],
      requiresAcknowledge: notice?.requiresAcknowledge ?? false,
      scheduleAt: notice?.scheduleAt ? notice.scheduleAt.slice(0, 16) : "",
      expiryAt: notice?.expiryAt ? notice.expiryAt.slice(0, 16) : "",
      coverImage: notice?.coverImage,
      tags: notice?.tags ?? [],
      attachments: notice?.attachments ?? [],
    } as NoticeFormInput,
    validators: { onChange: noticeFormSchema },
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
            <form.Field name="coverImage">
              {(field) => (
                <CoverImageDropzone
                  value={field.state.value}
                  onChange={(v) => field.handleChange(v)}
                />
              )}
            </form.Field>

            <form.Field name="title">
              {(field) => (
                <div className="flex flex-col gap-1">
                  <input
                    id="notice-title"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Untitled notice"
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

            <form.Field name="tags">
              {(field) => (
                <TagInput
                  value={field.state.value ?? []}
                  onChange={(v) => field.handleChange(v)}
                  suggestions={SUGGESTED_NOTICE_TAGS}
                />
              )}
            </form.Field>

            <form.Field name="description">
              {(field) => (
                <div className="flex flex-col gap-1.5">
                  <Textarea
                    id="notice-description"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    rows={6}
                    placeholder="Write the notice details…"
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

            <form.Field name="attachments">
              {(field) => (
                <div className="flex flex-col gap-1.5">
                  <Label>Attachments</Label>
                  <AttachmentDropzone
                    value={field.state.value ?? []}
                    onChange={(v) => field.handleChange(v)}
                  />
                </div>
              )}
            </form.Field>
          </div>

          <div className="flex flex-col divide-y divide-border rounded-lg border border-border bg-card px-4 sm:px-5">
            <PropertyRow label="Category">
              <form.Field name="category">
                {(field) => (
                  <Select
                    value={field.state.value}
                    onValueChange={(v) => field.handleChange(v as NoticeFormInput["category"])}
                  >
                    <SelectTrigger className="w-full sm:w-56">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {NOTICE_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </form.Field>
            </PropertyRow>

            <PropertyRow label="Priority" icon={Megaphone}>
              <form.Field name="priority">
                {(field) => (
                  <div className="inline-flex w-fit justify-self-start rounded-md border border-border bg-muted/30 p-0.5">
                    {(["normal", "flash"] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => field.handleChange(p)}
                        className={cn(
                          "cursor-pointer rounded-[5px] px-3 py-1 text-xs font-medium capitalize transition-colors",
                          field.state.value === p
                            ? p === "flash"
                              ? "bg-destructive text-white"
                              : "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {p === "flash" ? "Flash alert" : "Normal"}
                      </button>
                    ))}
                  </div>
                )}
              </form.Field>
            </PropertyRow>

            <PropertyRow label="Audience" icon={Users}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
                <form.Field name="audienceScope">
                  {(field) => (
                    <Select
                      value={field.state.value}
                      onValueChange={(v) => {
                        field.handleChange(v as NoticeFormInput["audienceScope"]);
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
            </PropertyRow>

            <PropertyRow label="Schedule" icon={CalendarClock}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <form.Field name="scheduleAt">
                  {(field) => (
                    <DateTimePicker
                      value={field.state.value ?? ""}
                      onChange={(v) => field.handleChange(v)}
                      placeholder="Not scheduled"
                      clearable
                      className="sm:w-52"
                    />
                  )}
                </form.Field>
                <span className="text-xs text-muted-foreground">until</span>
                <form.Field name="expiryAt">
                  {(field) => (
                    <DateTimePicker
                      value={field.state.value ?? ""}
                      onChange={(v) => field.handleChange(v)}
                      placeholder="No expiry"
                      clearable
                      className="sm:w-52"
                    />
                  )}
                </form.Field>
              </div>
            </PropertyRow>

            <PropertyRow label="Acknowledgement">
              <form.Field name="requiresAcknowledge">
                {(field) => (
                  <label className="flex items-center gap-2 text-sm text-foreground">
                    <Checkbox
                      checked={field.state.value}
                      onCheckedChange={(v) => field.handleChange(v === true)}
                    />
                    Require residents to acknowledge
                  </label>
                )}
              </form.Field>
            </PropertyRow>
          </div>
        </div>

        <aside className="h-fit lg:sticky lg:top-6">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Preview</p>
          <form.Subscribe
            selector={(s) =>
              [
                s.values.title,
                s.values.description,
                s.values.category,
                s.values.priority,
                s.values.tags,
                s.values.coverImage,
                s.values.attachments,
              ] as const
            }
          >
            {([title, description, category, priority, tags, coverImage, attachments]) => (
              <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
                {coverImage && (
                  <div className="h-28 w-full overflow-hidden">
                    <img src={coverImage as string} alt="" className="h-full w-full object-cover" />
                  </div>
                )}
                <div className="flex flex-col gap-2 p-4">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant="outline">{category as string}</Badge>
                    <Badge
                      variant={priority === "flash" ? "destructive" : "outline"}
                      className="capitalize"
                    >
                      {priority === "flash" ? "Flash alert" : "Normal"}
                    </Badge>
                  </div>
                  <h4 className="text-sm font-semibold text-foreground">
                    {(title as string) || "Untitled notice"}
                  </h4>
                  <p className="line-clamp-4 text-xs leading-relaxed text-muted-foreground">
                    {(description as string) || "Notice description will appear here…"}
                  </p>
                  {(tags as string[])?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {(tags as string[]).map((t) => (
                        <Badge key={t} variant="secondary" className="text-[10px]">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {(attachments as { name: string }[])?.length > 0 && (
                    <p className="text-[11px] text-muted-foreground">
                      {(attachments as { name: string }[]).length} attachment
                      {(attachments as { name: string }[]).length > 1 ? "s" : ""}
                    </p>
                  )}
                  <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <span>You</span>
                    <span className="size-1 rounded-full bg-muted-foreground/40" />
                    <span>{formatPreviewDate(new Date().toISOString())}</span>
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
              {isSubmitting ? "Saving…" : notice ? "Save changes" : "Create notice"}
            </Button>
          </div>
        )}
      </form.Subscribe>
    </form>
  );
}
