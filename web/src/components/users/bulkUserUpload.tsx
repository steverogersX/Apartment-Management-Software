"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Download, UploadCloud } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { parseCsv } from "@/lib/parseCsv";
import { roleOptions } from "@/lib/usersMockData";
import { FileDropzone } from "@/components/users/fileDropzone";

type PreviewRow = {
  name: string;
  email: string;
  phone: string;
  role: string;
  flatNumber: string;
  occupancyType: string;
  vehicleNumber: string;
  error: string | null;
};

const TEMPLATE_HEADERS = [
  "name",
  "email",
  "phone",
  "role",
  "flat number",
  "occupancy type",
  "vehicle number",
];

function buildPreviewRows(headers: string[], rows: Record<string, string>[]): PreviewRow[] {
  const nameKey = headers.find((h) => h.includes("name")) ?? "name";
  const emailKey = headers.find((h) => h.includes("email")) ?? "email";
  const phoneKey = headers.find((h) => h.includes("phone")) ?? "phone";
  const roleKey = headers.find((h) => h.includes("role")) ?? "role";
  const flatKey = headers.find((h) => h.includes("flat")) ?? "flat number";
  const occupancyKey = headers.find((h) => h.includes("occupancy")) ?? "occupancy type";
  const vehicleKey = headers.find((h) => h.includes("vehicle")) ?? "vehicle number";

  return rows.map((row) => {
    const name = row[nameKey] ?? "";
    const email = row[emailKey] ?? "";
    const phone = row[phoneKey] ?? "";
    const roleInput = row[roleKey] ?? "";
    const flatNumber = row[flatKey] ?? "";
    const occupancyType = row[occupancyKey] ?? "";
    const vehicleNumber = row[vehicleKey] ?? "";
    const role =
      roleOptions.find((r) => r.toLowerCase() === roleInput.toLowerCase()) ?? roleOptions[0];

    let error: string | null = null;
    if (!name.trim()) error = "Missing name";
    else if (!email.trim()) error = "Missing email";
    else if (!/^\S+@\S+\.\S+$/.test(email)) error = "Invalid email";

    return { name, email, phone, role, flatNumber, occupancyType, vehicleNumber, error };
  });
}

function downloadTemplate() {
  const csv = [
    TEMPLATE_HEADERS.join(","),
    "Priya Sharma,priya@society.com,+91 98765 43210,Resident,304,Tenant,TS09 AB 1234",
    "Anil Reddy,anil@society.com,+91 98765 11122,Committee Member,101,Owner,",
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "users-template.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export function BulkUserUpload() {
  const router = useRouter();
  const [file, setFile] = React.useState<File | null>(null);
  const [rows, setRows] = React.useState<PreviewRow[] | null>(null);
  const [importing, setImporting] = React.useState(false);

  const isCsv = file?.name.toLowerCase().endsWith(".csv");
  const validCount = rows?.filter((r) => !r.error).length ?? 0;
  const errorCount = rows?.filter((r) => r.error).length ?? 0;

  function handleFileSelected(selected: File) {
    setFile(selected);
    setRows(null);

    if (!selected.name.toLowerCase().endsWith(".csv")) return;

    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const { headers, rows: parsedRows } = parseCsv(text);
      setRows(buildPreviewRows(headers, parsedRows));
    };
    reader.readAsText(selected);
  }

  function handleClear() {
    setFile(null);
    setRows(null);
  }

  async function handleImport() {
    setImporting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setImporting(false);
    router.push("/dashboard/users");
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-muted/30 px-4 py-3">
        <p className="text-xs text-muted-foreground">
          Use our template to make sure columns line up correctly.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={downloadTemplate}
        >
          <Download className="size-3.5" />
          Download template
        </Button>
      </div>

      <FileDropzone
        accept=".csv,.xlsx,.xls"
        file={file}
        onFileSelected={handleFileSelected}
        onClear={handleClear}
      />

      {file && !isCsv && (
        <div className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-xs text-amber-700 dark:text-amber-400">
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
          <span>
            Row preview is only available for CSV files right now. Your Excel file will still be
            uploaded — export to CSV first if you'd like to review rows before importing.
          </span>
        </div>
      )}

      {rows && rows.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              {rows.length} rows
            </Badge>
            <Badge variant="outline" className="gap-1 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-3" />
              {validCount} valid
            </Badge>
            {errorCount > 0 && (
              <Badge variant="destructive" className="gap-1">
                <AlertCircle className="size-3" />
                {errorCount} need attention
              </Badge>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto rounded-md border border-border">
            <Table>
              <TableHeader className="sticky top-0 bg-card">
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Flat</TableHead>
                  <TableHead>Occupancy</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium text-foreground">{row.name || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{row.email || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{row.phone || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{row.role}</TableCell>
                    <TableCell className="text-muted-foreground">{row.flatNumber || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {row.occupancyType || "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {row.vehicleNumber || "—"}
                    </TableCell>
                    <TableCell>
                      {row.error ? (
                        <span className="inline-flex items-center gap-1 text-xs text-destructive">
                          <AlertCircle className="size-3" />
                          {row.error}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="size-3" />
                          Ready
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
        <Button type="button" variant="outline" onClick={() => router.push("/dashboard/users")}>
          Cancel
        </Button>
        <Button
          type="button"
          disabled={!file || importing || (rows !== null && validCount === 0)}
          className="gap-1.5"
          onClick={handleImport}
        >
          <UploadCloud className="size-3.5" />
          {importing ? "Importing…" : rows ? `Import ${validCount} users` : "Import users"}
        </Button>
      </div>
    </div>
  );
}
