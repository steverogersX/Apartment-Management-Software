"use client";

import * as React from "react";
import { File, FileText, Image as ImageIcon, Table, Upload, X } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Attachment } from "@/lib/attachmentTypes";

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getAttachmentType(file: File): Attachment["type"] {
  if (file.type.startsWith("image/")) return "image";
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf")) return "pdf";
  if (name.endsWith(".doc") || name.endsWith(".docx")) return "doc";
  if (name.endsWith(".xls") || name.endsWith(".xlsx") || name.endsWith(".csv")) return "sheet";
  if (file.type === "application/pdf") return "pdf";
  if (file.type.includes("word") || file.type.includes("document")) return "doc";
  if (file.type.includes("sheet") || file.type.includes("excel") || file.type === "text/csv")
    return "sheet";
  return "other";
}

function iconForType(type: Attachment["type"]) {
  switch (type) {
    case "image":
      return ImageIcon;
    case "pdf":
      return FileText;
    case "doc":
      return FileText;
    case "sheet":
      return Table;
    case "other":
    default:
      return File;
  }
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function AttachmentDropzone({
  value,
  onChange,
}: {
  value: Attachment[];
  onChange: (attachments: Attachment[]) => void;
  compact?: boolean;
}) {
  const [isDragging, setIsDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const next: Attachment[] = [...value];
    for (const file of Array.from(files)) {
      const dataUrl = await readFileAsDataUrl(file);
      next.push({
        name: file.name,
        url: dataUrl,
        type: getAttachmentType(file),
        size: formatSize(file.size),
      });
    }
    onChange(next);
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          void handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-md border border-dashed border-border bg-muted/20 px-4 py-6 text-center transition-colors hover:border-foreground/40 hover:bg-muted/40",
          isDragging && "border-foreground bg-muted/50",
        )}
      >
        <Upload className="size-4 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Click to upload</span> or drag and drop
        </p>
        <p className="text-[11px] text-muted-foreground/70">
          PDF, doc, sheet, or image, up to a few MB each
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.csv"
          className="hidden"
          onChange={(e) => {
            void handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {value.map((att, i) => {
            const Icon = iconForType(att.type);
            return (
              <div
                key={`${att.name}-${i}`}
                className="group relative flex items-center gap-2 overflow-hidden rounded-md border border-border bg-background p-2"
              >
                {att.type === "image" ? (
                  <img
                    src={att.url}
                    alt={att.name}
                    className="size-8 shrink-0 rounded object-cover"
                  />
                ) : (
                  <span className="flex size-8 shrink-0 items-center justify-center rounded bg-muted">
                    <Icon className="size-4 text-muted-foreground" />
                  </span>
                )}
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-xs font-medium text-foreground">{att.name}</span>
                  <span className="text-[11px] text-muted-foreground">{att.size}</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeAt(i);
                  }}
                  className="absolute top-1 right-1 flex size-5 cursor-pointer items-center justify-center rounded-full bg-background/90 text-muted-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100 hover:text-foreground"
                  aria-label={`Remove ${att.name}`}
                >
                  <X className="size-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function CoverImageDropzone({
  value,
  onChange,
}: {
  value?: string;
  onChange: (dataUrl: string | undefined) => void;
}) {
  const [isDragging, setIsDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    onChange(await readFileAsDataUrl(file));
  }

  if (value) {
    return (
      <div className="group relative h-32 w-full overflow-hidden rounded-lg border border-border sm:h-40">
        <img src={value} alt="Cover" className="h-full w-full object-cover" />
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="cursor-pointer rounded-md bg-background/90 px-2.5 py-1.5 text-xs font-medium shadow-sm hover:bg-background"
          >
            Replace
          </button>
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="cursor-pointer rounded-md bg-background/90 px-2.5 py-1.5 text-xs font-medium text-destructive shadow-sm hover:bg-background"
          >
            Remove
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            void handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        void handleFiles(e.dataTransfer.files);
      }}
      onClick={() => inputRef.current?.click()}
      className={cn(
        "flex h-24 w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border bg-muted/20 text-center transition-colors hover:border-foreground/40 hover:bg-muted/40 sm:h-28",
        isDragging && "border-foreground bg-muted/50",
      )}
    >
      <ImageIcon className="size-4 text-muted-foreground" />
      <p className="text-xs text-muted-foreground">Add a cover image (optional)</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          void handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}

export function imageFilesFromClipboard(e: React.ClipboardEvent): File[] {
  const files: File[] = [];
  for (const item of Array.from(e.clipboardData?.items ?? [])) {
    if (item.kind === "file" && item.type.startsWith("image/")) {
      const file = item.getAsFile();
      if (file) files.push(file);
    }
  }
  return files;
}

export async function filesToAttachments(files: File[]): Promise<Attachment[]> {
  const out: Attachment[] = [];
  for (const file of files) {
    const dataUrl = await readFileAsDataUrl(file);
    out.push({
      name: file.name || "pasted-image.png",
      url: dataUrl,
      type: getAttachmentType(file),
      size: formatSize(file.size),
    });
  }
  return out;
}

/** Reddit-style compact attach control: a small "Add image or file" trigger plus inline
 * thumbnail chips, for spots like a reply composer where a full dropzone reads as too heavy. */
export function InlineAttachments({
  value,
  onChange,
}: {
  value: Attachment[];
  onChange: (attachments: Attachment[]) => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const added = await filesToAttachments(Array.from(files));
    onChange([...value, ...added]);
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-2">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((att, i) => {
            const Icon = iconForType(att.type);
            return (
              <div
                key={`${att.name}-${i}`}
                className="group relative size-12 shrink-0 overflow-hidden rounded-md border border-border"
                title={att.name}
              >
                {att.type === "image" ? (
                  <img src={att.url} alt={att.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center bg-muted">
                    <Icon className="size-4 text-muted-foreground" />
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label={`Remove ${att.name}`}
                >
                  <X className="size-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-md px-1.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <ImageIcon className="size-3.5" />
        Add image or file
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.csv"
        className="hidden"
        onChange={(e) => {
          void handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
