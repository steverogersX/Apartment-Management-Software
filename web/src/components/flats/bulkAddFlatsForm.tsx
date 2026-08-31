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
import { FileDropzone } from "@/components/users/fileDropzone";
import { parseCsv } from "@/lib/parseCsv";
import { flats, type FlatType } from "@/lib/flatsMockData";

const FLAT_TYPES: FlatType[] = ["1BHK", "2BHK", "3BHK", "4BHK"];

type PreviewRow = {
  flatNumber: string;
  tower: string;
  floor: string;
  type: string;
  areaSqft: string;
  error: string | null;
};

const TEMPLATE_HEADERS = ["flat number", "tower", "floor", "type", "area sqft"];

function buildPreviewRows(headers: string[], rows: Record<string, string>[]): PreviewRow[] {
  const flatKey = headers.find((h) => h.includes("flat")) ?? "flat number";
  const towerKey = headers.find((h) => h.includes("tower")) ?? "tower";
  const floorKey = headers.find((h) => h.includes("floor")) ?? "floor";
  const typeKey = headers.find((h) => h.includes("type")) ?? "type";
  const areaKey = headers.find((h) => h.includes("area")) ?? "area sqft";

  return rows.map((row) => {
    const flatNumber = row[flatKey] ?? "";
    const tower = row[towerKey] ?? "";
    const floor = row[floorKey] ?? "";
    const typeInput = row[typeKey] ?? "";
    const areaSqft = row[areaKey] ?? "";
    const type = FLAT_TYPES.find((t) => t.toLowerCase() === typeInput.toLowerCase()) ?? typeInput;

    let error: string | null = null;
    if (!flatNumber.trim()) error = "Missing flat number";
    else if (!tower.trim()) error = "Missing tower";
    else if (!floor.trim() || !Number.isFinite(Number(floor))) error = "Invalid floor";
    else if (!FLAT_TYPES.includes(type as FlatType)) error = "Invalid type";
    else if (!areaSqft.trim() || !Number.isFinite(Number(areaSqft)) || Number(areaSqft) <= 0)
      error = "Invalid area";

    return { flatNumber, tower, floor, type, areaSqft, error };
  });
}

function downloadTemplate() {
  const csv = [TEMPLATE_HEADERS.join(","), "301,A,3,3BHK,1450", "302,A,3,2BHK,1100"].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "flats-template.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export function BulkAddFlatsForm() {
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
    if (rows) {
      for (const row of rows) {
        if (row.error) continue;
        flats.push({
          id: crypto.randomUUID(),
          flatNumber: row.flatNumber.trim(),
          tower: row.tower.trim().toUpperCase(),
          floor: Number(row.floor),
          type: row.type as FlatType,
          areaSqft: Number(row.areaSqft),
          occupancyStatus: "vacant",
          maintenanceStatus: "due",
          currentResidentIds: [],
        });
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 400));
    setImporting(false);
    router.push("/dashboard/people-hub/flats");
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
            Row preview is only available for CSV files right now. Export your Excel file to CSV
            first if you&apos;d like to review rows before importing.
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
                  <TableHead>Flat</TableHead>
                  <TableHead>Tower</TableHead>
                  <TableHead>Floor</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Area</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium text-foreground">
                      {row.flatNumber || "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{row.tower || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{row.floor || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{row.type || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {row.areaSqft ? `${row.areaSqft} sq ft` : "—"}
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
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard/people-hub/flats")}
        >
          Cancel
        </Button>
        <Button
          type="button"
          disabled={!file || importing || (rows !== null && validCount === 0)}
          className="gap-1.5"
          onClick={handleImport}
        >
          <UploadCloud className="size-3.5" />
          {importing ? "Importing…" : rows ? `Import ${validCount} flats` : "Import flats"}
        </Button>
      </div>
    </div>
  );
}
