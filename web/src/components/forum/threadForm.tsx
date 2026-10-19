"use client";

import { useForm } from "@tanstack/react-form";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TagInput } from "@/components/tagInput";
import { AttachmentDropzone } from "@/components/fileDropzone";
import {
  FORUM_CATEGORIES,
  SUGGESTED_FORUM_TAGS,
  forumThreadFormSchema,
  type ForumThread,
  type ForumThreadFormInput,
} from "@/lib/forumMockData";
import { fieldError } from "@/lib/fieldError";

function formatPreviewDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function ThreadForm({
  thread,
  onSave,
  onCancel,
}: {
  thread?: ForumThread | null;
  onSave: (values: ForumThreadFormInput) => void;
  onCancel: () => void;
}) {
  const form = useForm({
    defaultValues: {
      title: thread?.title ?? "",
      body: thread?.body ?? "",
      category: thread?.category ?? "General",
      tags: thread?.tags ?? [],
      attachments: thread?.attachments ?? [],
    } as ForumThreadFormInput,
    validators: { onChange: forumThreadFormSchema },
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
                    id="thread-title"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Untitled thread"
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
                  suggestions={SUGGESTED_FORUM_TAGS}
                />
              )}
            </form.Field>

            <form.Field name="body">
              {(field) => (
                <div className="flex flex-col gap-1.5">
                  <Textarea
                    id="thread-body"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    rows={8}
                    placeholder="Write the thread details…"
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
            <div className="grid grid-cols-1 items-start gap-1.5 py-3 sm:grid-cols-[140px_1fr] sm:items-center sm:gap-4">
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                Category
              </span>
              <form.Field name="category">
                {(field) => (
                  <Select
                    value={field.state.value}
                    onValueChange={(v) => field.handleChange(v as ForumThreadFormInput["category"])}
                  >
                    <SelectTrigger className="w-full sm:w-56">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FORUM_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                s.values.title,
                s.values.body,
                s.values.category,
                s.values.tags,
                s.values.attachments,
              ] as const
            }
          >
            {([title, body, category, tags, attachments]) => (
              <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
                <div className="flex flex-col gap-2 p-4">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant="outline">{category as string}</Badge>
                  </div>
                  <h4 className="text-sm font-semibold text-foreground">
                    {(title as string) || "Untitled thread"}
                  </h4>
                  <p className="line-clamp-4 text-xs leading-relaxed text-muted-foreground">
                    {(body as string) || "Thread body will appear here…"}
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
              {isSubmitting ? "Saving…" : thread ? "Save changes" : "Create thread"}
            </Button>
          </div>
        )}
      </form.Subscribe>
    </form>
  );
}
