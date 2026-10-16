"use client";

import * as React from "react";
import { Download, File, FileText, Image as ImageIcon, Table, Upload } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DataTable, type DataTableFilterConfig } from "@/components/dataTable";
import { DataTableColumnHeader } from "@/components/dataTableColumnHeader";
import { AttachmentDropzone } from "@/components/fileDropzone";
import {
  DOCUMENT_CATEGORIES,
  societyDocuments,
  type SocietyDocument,
} from "@/lib/documentsMockData";
import { useAuth } from "@/hooks/useAuth";
import type { ColumnDef } from "@tanstack/react-table";
import type { Attachment } from "@/lib/attachmentTypes";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { PageIcon } from "@/components/pageIcon";
import { AudiencePicker } from "@/components/audiencePicker";
import { recordAudit } from "@/lib/auditLog";

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

const CATEGORY_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  Legal: "secondary",
  Financial: "outline",
  Minutes: "default",
  Insurance: "secondary",
  Bylaws: "default",
  General: "outline",
};

function handleDownload(doc: SocietyDocument) {
  // No detail page — clicking a row triggers download/open directly, same as notices detail download button
  const a = document.createElement("a");
  a.href = doc.file.url;
  a.download = doc.file.name;
  // For data URLs or cross-origin, download attribute may be ignored — fallback to open
  a.target = "_blank";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export default function DocumentsPage() {
  const { user: auditUser } = useAuth();
  const { toast } = useToast();
  const { has } = useAuth();
  const canUpload = has("DocumentsUpload");
  const [docs, setDocs] = React.useState<SocietyDocument[]>(() =>
    [...societyDocuments].sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
    ),
  );
  const [open, setOpen] = React.useState(false);

  // upload form state
  const [title, setTitle] = React.useState("");
  const [category, setCategory] = React.useState<SocietyDocument["category"]>("General");
  const [audienceScope, setAudienceScope] = React.useState<"All" | "Blocks" | "Flats">("All");
  const [audienceValue, setAudienceValue] = React.useState<string[]>([]);
  const [file, setFile] = React.useState<Attachment[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  function resetForm() {
    setTitle("");
    setCategory("General");
    setAudienceScope("All");
    setAudienceValue([]);
    setFile([]);
    setError(null);
  }

  function handleUpload() {
    if (!title.trim() || title.trim().length < 3) {
      setError("Title must be at least 3 characters");
      return;
    }
    if (file.length === 0) {
      setError("Please attach a file");
      return;
    }
    // Single file per document: if multiple files are dropped, only the first is used — one SocietyDocument per file would also be valid, but taking the first is less code and matches the single-file form intent
    const attachment = file[0];
    const audience =
      audienceScope === "All"
        ? { scope: "All" as const }
        : audienceScope === "Blocks"
          ? { scope: "Blocks" as const, blocks: audienceValue }
          : { scope: "Flats" as const, flats: audienceValue };

    const newDoc: SocietyDocument = {
      id: `doc-${Date.now()}`,
      title: title.trim(),
      category,
      file: attachment,
      uploadedByName: "Arvind Deshmukh",
      uploadedByFlat: "A-301",
      uploadedAt: new Date().toISOString(),
      audience,
    };
    societyDocuments.unshift(newDoc);
    setDocs((prev) => [newDoc, ...prev]);
    setOpen(false);
    resetForm();
    recordAudit({
      module: "Communication",
      entityType: "Document",
      entityId: newDoc.id,
      entityLabel: newDoc.title,
      action: "Create",
      performedBy: auditUser?.displayName ?? "Unknown",
    });
    toast({ title: "Document uploaded" });
  }

  const columns = React.useMemo<ColumnDef<SocietyDocument>[]>(
    () => [
      {
        id: "title",
        accessorKey: "title",
        size: 320,
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Name"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => {
          const doc = row.original;
          const Icon = iconForType(doc.file.type);
          return (
            <div className="flex items-center gap-2.5">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted">
                <Icon className="size-3.5 text-muted-foreground" />
              </span>
              <span className="truncate text-sm font-medium text-foreground">{doc.title}</span>
            </div>
          );
        },
      },
      {
        id: "category",
        accessorKey: "category",
        meta: { label: "Category" },
        size: 130,
        header: () => <DataTableColumnHeader label="Category" />,
        cell: ({ row }) => (
          <Badge variant={CATEGORY_VARIANT[row.original.category] ?? "outline"}>
            {row.original.category}
          </Badge>
        ),
      },
      {
        id: "uploadedBy",
        accessorKey: "uploadedByName",
        meta: { label: "Uploaded by" },
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Uploaded by"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            {row.original.uploadedByName}
          </span>
        ),
      },
      {
        id: "date",
        accessorKey: "uploadedAt",
        meta: { label: "Date" },
        size: 130,
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Date"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            {formatDate(row.original.uploadedAt)}
          </span>
        ),
      },
      {
        id: "size",
        accessorKey: "size",
        accessorFn: (row) => row.file.size,
        meta: { label: "Size" },
        size: 90,
        header: () => <DataTableColumnHeader label="Size" />,
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            {row.original.file.size}
          </span>
        ),
      },
      {
        id: "actions",
        enableHiding: false,
        size: 100,
        header: () => null,
        cell: ({ row }) => {
          const doc = row.original;
          return (
            <div onClick={(e) => e.stopPropagation()}>
              <Button
                size="sm"
                variant="outline"
                className="h-7 gap-1.5 px-2.5 text-xs"
                onClick={() => handleDownload(doc)}
              >
                <Download className="size-3.5" />
                Download
              </Button>
            </div>
          );
        },
      },
    ],
    [],
  );

  const filters = React.useMemo<DataTableFilterConfig<SocietyDocument>[]>(
    () => [
      {
        id: "search",
        label: "Search",
        type: "search",
        placeholder: "Search documents…",
        predicate: (row, q) => row.title.toLowerCase().includes(q.toLowerCase()),
      },
      {
        id: "category",
        label: "Category",
        type: "select",
        options: DOCUMENT_CATEGORIES.map((c) => ({ label: c, value: c })),
        predicate: (row, v) => row.category === v,
      },
    ],
    [],
  );

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <div>
        <h1 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground">
          <PageIcon />
          Documents
        </h1>
        <p className="text-sm text-muted-foreground">
          Society files — bylaws, budgets, minutes, and more.
        </p>
      </div>

      <DataTable
        data={docs}
        columns={columns}
        getRowId={(r) => r.id}
        title="All documents"
        filters={filters}
        enableColumnVisibility
        enableColumnReorder
        enableFilterCustomization
        showPageSize
        pageSize={10}
        itemLabel="document"
        emptyMessage="No documents found."
        onRowClick={(row) => handleDownload(row)}
        toolbarActions={
          canUpload ? (
            <Dialog
              open={open}
              onOpenChange={(o) => {
                setOpen(o);
                if (!o) resetForm();
              }}
            >
              <DialogTrigger
                render={
                  <Button size="sm" className="gap-1.5">
                    <Upload className="size-3.5" />
                    Upload document
                  </Button>
                }
              />
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Upload document</DialogTitle>
                  <DialogDescription>
                    Add a file with title, category, and audience.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-2">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="doc-title">Title</Label>
                    <Input
                      id="doc-title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Society Bylaws 2024"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label>Category</Label>
                    <Select
                      value={category}
                      onValueChange={(v) => setCategory(v as SocietyDocument["category"])}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DOCUMENT_CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label>Audience</Label>
                    <div className="flex flex-col gap-2">
                      <AudiencePicker
                        scope={audienceScope}
                        value={audienceValue}
                        onScopeChange={(scope) => {
                          setAudienceScope(scope);
                          setAudienceValue([]);
                        }}
                        onValueChange={setAudienceValue}
                        triggerClassName="sm:w-full"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label>File</Label>
                    <AttachmentDropzone
                      value={file}
                      onChange={(atts) => {
                        // Single file per document: take first and ignore rest
                        if (atts.length > 1) {
                          setFile([atts[0]]);
                        } else {
                          setFile(atts);
                        }
                      }}
                    />
                    {file.length > 1 && (
                      <p className="text-xs text-muted-foreground">
                        Only the first file will be used — one document per upload.
                      </p>
                    )}
                  </div>

                  {error && <p className="text-xs text-destructive">{error}</p>}
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setOpen(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleUpload} disabled={!title.trim() || file.length === 0}>
                    Upload
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          ) : null
        }
      />
    </div>
  );
}
