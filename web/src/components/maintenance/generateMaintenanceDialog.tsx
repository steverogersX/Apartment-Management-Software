"use client";

import * as React from "react";
import { format } from "date-fns";
import {
  Building2,
  CalendarIcon,
  Pencil,
  Plus,
  Trash2,
  Waves,
  Zap,
  PiggyBank,
  Wrench,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type ChargeRow = {
  id: string;
  name: string;
  amount: number;
  type: "Fixed" | "Per Sqft";
  icon: React.ComponentType<{ className?: string }>;
};

const INITIAL_CHARGES: ChargeRow[] = [
  { id: "c1", name: "Maintenance Fund", amount: 1800, type: "Fixed", icon: Wrench },
  { id: "c2", name: "Water Charges", amount: 400, type: "Fixed", icon: Waves },
  { id: "c3", name: "Lift Maintenance", amount: 300, type: "Fixed", icon: Zap },
  { id: "c4", name: "Sinking Fund", amount: 500, type: "Fixed", icon: PiggyBank },
];

type TowerId = "all" | "A" | "B" | "C" | "D";

const TOWERS: { id: TowerId; label: string; short: string }[] = [
  { id: "all", label: "All Towers", short: "All" },
  { id: "A", label: "Tower A", short: "A" },
  { id: "B", label: "Tower B", short: "B" },
  { id: "C", label: "Tower C", short: "C" },
  { id: "D", label: "Tower D", short: "D" },
];

const FLATS_PER_TOWER = 48;

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function GenerateMaintenanceDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [maintenanceMonth, setMaintenanceMonth] = React.useState<Date | undefined>(
    new Date(2026, 8, 1),
  );
  const [dueDate, setDueDate] = React.useState<Date | undefined>(new Date(2026, 8, 10));
  const [maintenanceType, setMaintenanceType] = React.useState("Monthly");
  const [notes, setNotes] = React.useState("");
  const [selectedTowers, setSelectedTowers] = React.useState<TowerId[]>(["A", "B"]);
  const [charges, setCharges] = React.useState<ChargeRow[]>(INITIAL_CHARGES);
  const [monthOpen, setMonthOpen] = React.useState(false);
  const [dueOpen, setDueOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);

  function toggleTower(id: TowerId) {
    setSelectedTowers((prev) => {
      if (id === "all") {
        return prev.includes("all") ? [] : ["all"];
      }
      if (prev.includes("all")) {
        return [id];
      }
      if (prev.includes(id)) {
        const next = prev.filter((t) => t !== id);
        return next.length === 0 ? [] : next;
      }
      return [...prev, id];
    });
  }

  const flatsCovered = React.useMemo(() => {
    if (selectedTowers.includes("all")) return FLATS_PER_TOWER * 4;
    if (selectedTowers.length === 0) return 0;
    return selectedTowers.length * FLATS_PER_TOWER;
  }, [selectedTowers]);

  const totalPerFlat = React.useMemo(() => charges.reduce((s, c) => s + c.amount, 0), [charges]);

  const totalExpected = flatsCovered * totalPerFlat;

  function addCharge() {
    const id = `c${Date.now()}`;
    setCharges((prev) => [
      ...prev,
      { id, name: "New Charge", amount: 0, type: "Fixed", icon: Wrench },
    ]);
    setEditingId(id);
  }

  function removeCharge(id: string) {
    setCharges((prev) => prev.filter((c) => c.id !== id));
  }

  function updateCharge(id: string, patch: Partial<ChargeRow>) {
    setCharges((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  const selectedLabel =
    selectedTowers.includes("all") || selectedTowers.length === 0
      ? selectedTowers.includes("all")
        ? "All Towers"
        : "—"
      : selectedTowers.join(", ");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-[800px]">
        <DialogHeader className="shrink-0 border-b px-6 py-5 text-left">
          <DialogTitle className="text-base font-semibold">Generate Maintenance</DialogTitle>
          <DialogDescription>
            Create monthly maintenance charges for society flats.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="flex flex-col gap-8">
            <section className="flex flex-col gap-4">
              <h3 className="text-sm font-semibold text-foreground">Maintenance Details</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="maintenance-month">Maintenance Month</Label>
                  <Popover open={monthOpen} onOpenChange={setMonthOpen}>
                    <PopoverTrigger
                      render={
                        <Button
                          variant="outline"
                          className={cn(
                            "justify-start gap-2 font-normal",
                            !maintenanceMonth && "text-muted-foreground",
                          )}
                        />
                      }
                    >
                      <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
                      <span className="flex-1 truncate text-left">
                        {maintenanceMonth ? format(maintenanceMonth, "MMMM yyyy") : "Pick a month"}
                      </span>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={maintenanceMonth}
                        defaultMonth={maintenanceMonth}
                        onSelect={(d) => {
                          setMaintenanceMonth(d);
                          setMonthOpen(false);
                        }}
                        captionLayout="dropdown"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="due-date">Due Date</Label>
                  <Popover open={dueOpen} onOpenChange={setDueOpen}>
                    <PopoverTrigger
                      render={
                        <Button
                          variant="outline"
                          className={cn(
                            "justify-start gap-2 font-normal",
                            !dueDate && "text-muted-foreground",
                          )}
                        />
                      }
                    >
                      <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
                      <span className="flex-1 truncate text-left">
                        {dueDate ? format(dueDate, "d MMM yyyy") : "Pick a due date"}
                      </span>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dueDate}
                        defaultMonth={dueDate}
                        onSelect={(d) => {
                          setDueDate(d);
                          setDueOpen(false);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label>Maintenance Type</Label>
                  <Select
                    value={maintenanceType}
                    onValueChange={(v) => setMaintenanceType(v ?? "Monthly")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Monthly">Monthly</SelectItem>
                      <SelectItem value="Quarterly">Quarterly</SelectItem>
                      <SelectItem value="Special">Special</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-1.5 sm:col-span-1">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any remarks for this cycle…"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={1}
                    className="min-h-9 resize-none"
                  />
                </div>
              </div>
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-foreground">Select Towers</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {TOWERS.map((t) => {
                  const selected = selectedTowers.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => toggleTower(t.id)}
                      className={cn(
                        "flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-colors",
                        selected
                          ? "border-foreground bg-foreground text-background shadow-sm"
                          : "border-border bg-card text-foreground hover:bg-muted",
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-9 items-center justify-center rounded-full border",
                          selected
                            ? "border-background/20 bg-background/10 text-background"
                            : "border-border bg-muted text-muted-foreground",
                        )}
                      >
                        <Building2 className="size-4" />
                      </span>
                      <span className="text-sm font-medium leading-none">{t.label}</span>
                      <span
                        className={cn(
                          "text-xs",
                          selected ? "text-background/70" : "text-muted-foreground",
                        )}
                      >
                        {t.id === "all" ? "All flats" : `${FLATS_PER_TOWER} flats`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-foreground">Charge Breakdown</h3>
                <Button variant="outline" size="sm" className="gap-1.5" onClick={addCharge}>
                  <Plus className="size-3.5" />
                  Add Charge
                </Button>
              </div>

              <div className="overflow-hidden rounded-xl border bg-card">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="h-9 text-xs font-medium text-muted-foreground">
                        Charge Name
                      </TableHead>
                      <TableHead className="h-9 w-32 text-xs font-medium text-muted-foreground">
                        Amount
                      </TableHead>
                      <TableHead className="h-9 w-36 text-xs font-medium text-muted-foreground">
                        Type
                      </TableHead>
                      <TableHead className="h-9 w-20 text-right text-xs font-medium text-muted-foreground">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {charges.map((row) => {
                      const Icon = row.icon;
                      const isEditing = editingId === row.id;
                      return (
                        <TableRow key={row.id} className="hover:bg-muted/40">
                          <TableCell className="py-2">
                            {isEditing ? (
                              <Input
                                value={row.name}
                                onChange={(e) => updateCharge(row.id, { name: e.target.value })}
                                onBlur={() => setEditingId(null)}
                                autoFocus
                                className="h-7 text-sm"
                              />
                            ) : (
                              <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                                <span className="flex size-7 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                  <Icon className="size-3.5" />
                                </span>
                                {row.name}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="py-2">
                            {isEditing ? (
                              <Input
                                type="number"
                                value={String(row.amount)}
                                onChange={(e) =>
                                  updateCharge(row.id, {
                                    amount: Number(e.target.value) || 0,
                                  })
                                }
                                onBlur={() => setEditingId(null)}
                                className="h-7 text-sm"
                              />
                            ) : (
                              <span className="text-sm font-medium text-foreground">
                                {formatCurrency(row.amount)}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="py-2">
                            <Select
                              value={row.type}
                              onValueChange={(v) =>
                                updateCharge(row.id, {
                                  type: (v as ChargeRow["type"]) ?? "Fixed",
                                })
                              }
                            >
                              <SelectTrigger size="sm" className="h-7 w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Fixed">Fixed</SelectItem>
                                <SelectItem value="Per Sqft">Per Sqft</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="py-2">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                aria-label="Edit"
                                onClick={() => setEditingId(isEditing ? null : row.id)}
                              >
                                <Pencil className="size-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                className="text-muted-foreground hover:text-destructive"
                                aria-label="Delete"
                                onClick={() => removeCharge(row.id)}
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {charges.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="h-24 text-center text-sm text-muted-foreground"
                        >
                          No charges. Add one to get started.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                <div className="flex items-center justify-between border-t bg-muted/30 px-4 py-2.5 text-sm">
                  <span className="font-medium text-muted-foreground">Total per flat</span>
                  <span className="font-semibold text-foreground">
                    {formatCurrency(totalPerFlat)}
                  </span>
                </div>
              </div>
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-foreground">Summary</h3>
              <Card className="rounded-xl bg-muted/30">
                <CardContent className="flex flex-col gap-3 p-4">
                  <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                    <div className="flex items-center justify-between gap-2 rounded-lg bg-card px-3 py-2.5 ring-1 ring-border">
                      <span className="text-muted-foreground">Selected Towers</span>
                      <span className="font-medium text-foreground">{selectedLabel}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 rounded-lg bg-card px-3 py-2.5 ring-1 ring-border">
                      <span className="text-muted-foreground">Flats Covered</span>
                      <span className="font-medium text-foreground">{flatsCovered}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 rounded-lg bg-card px-3 py-2.5 ring-1 ring-border">
                      <span className="text-muted-foreground">Due Date</span>
                      <span className="font-medium text-foreground">
                        {dueDate ? format(dueDate, "d MMM yyyy") : "—"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 rounded-lg bg-foreground px-3 py-2.5 text-background">
                      <span className="text-background/80">Total Expected Collection</span>
                      <span className="font-semibold">{formatCurrency(totalExpected)}</span>
                    </div>
                  </div>
                  <Separator />
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {flatsCovered} flats × {formatCurrency(totalPerFlat)} per flat ={" "}
                    <span className="font-medium text-foreground">
                      {formatCurrency(totalExpected)}
                    </span>{" "}
                    · Due {dueDate ? format(dueDate, "d MMM yyyy") : "—"} · {selectedLabel}
                  </p>
                </CardContent>
              </Card>
            </section>
          </div>
        </div>

        <div className="sticky bottom-0 z-10 flex shrink-0 items-center justify-between gap-2 border-t bg-popover px-6 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Save as Draft
            </Button>
            <Button onClick={() => onOpenChange(false)}>Generate Maintenance</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
