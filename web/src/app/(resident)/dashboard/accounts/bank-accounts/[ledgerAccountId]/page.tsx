"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { useBreadcrumbTitle } from "@/components/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  bankAccountDetails,
  bankStatementEntries,
  computeLedgerBalance,
  type BankStatementEntry,
} from "@/lib/bankAccountsMockData";
import { vouchers, type Voucher } from "@/lib/vouchersMockData";
import { accountName } from "@/lib/chartOfAccountsMockData";
import { useAuth } from "@/hooks/useAuth";
import { recordAudit } from "@/lib/auditLog";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function maskedAccountNumber(accountNumber: string) {
  const digits = accountNumber.replace(/\D/g, "");
  if (digits.length <= 4) return accountNumber;
  return `••••${digits.slice(-4)}`;
}

function touchesAccount(voucher: Voucher, ledgerAccountId: string) {
  return voucher.debitAccountId === ledgerAccountId || voucher.creditAccountId === ledgerAccountId;
}

function isDirectionCompatible(
  entry: BankStatementEntry,
  voucher: Voucher,
  ledgerAccountId: string,
) {
  if (entry.direction === "Credit") return voucher.debitAccountId === ledgerAccountId;
  return voucher.creditAccountId === ledgerAccountId;
}

export default function BankAccountDetailPage() {
  const params = useParams<{ ledgerAccountId: string }>();
  const { user, has } = useAuth();
  const actor = user?.displayName ?? "Unknown";
  const canManage = has("BankAccountsManage");
  const [version, setVersion] = React.useState(0);
  const [matchTarget, setMatchTarget] = React.useState<BankStatementEntry | null>(null);
  const [matchVoucherId, setMatchVoucherId] = React.useState("");

  const ledgerAccountId = params.ledgerAccountId;
  const details = bankAccountDetails.find((b) => b.ledgerAccountId === ledgerAccountId) ?? null;
  const ledgerName = accountName(ledgerAccountId);

  useBreadcrumbTitle(details ? ledgerName : null);

  if (!has("BankAccountsView")) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm text-muted-foreground">
          You do not have permission to view bank accounts.
        </p>
        <Link href="/dashboard" className="text-sm font-medium text-foreground underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const balance = React.useMemo(
    () => computeLedgerBalance(ledgerAccountId),
    [ledgerAccountId, version],
  );

  const ledgerRows = React.useMemo(() => {
    const posted = vouchers
      .filter((v) => v.status === "Posted" && touchesAccount(v, ledgerAccountId))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let running = details?.openingBalance ?? 0;
    return posted.map((v) => {
      running += v.debitAccountId === ledgerAccountId ? v.amount : -v.amount;
      return { voucher: v, balance: running };
    });
  }, [ledgerAccountId, details, version]);

  const unreconciledEntries = React.useMemo(
    () =>
      bankStatementEntries
        .filter((e) => e.ledgerAccountId === ledgerAccountId && !e.reconciled)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ledgerAccountId, version],
  );

  const unreconciledVouchers = React.useMemo(
    () =>
      vouchers.filter(
        (v) => v.status === "Posted" && !v.reconciled && touchesAccount(v, ledgerAccountId),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ledgerAccountId, version],
  );

  if (!details) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <p className="text-sm text-muted-foreground">Bank account not found.</p>
        <Link
          href="/dashboard/accounts/bank-accounts"
          className="text-sm font-medium text-foreground underline"
        >
          Back to Bank Accounts
        </Link>
      </div>
    );
  }

  function applyMatch(entryId: string, voucherId: string) {
    const entry = bankStatementEntries.find((e) => e.id === entryId);
    const voucher = vouchers.find((v) => v.id === voucherId);
    if (!entry || !voucher) return;
    entry.reconciled = true;
    entry.matchedVoucherId = voucher.id;
    voucher.reconciled = true;
    recordAudit({
      module: "Bank Accounts",
      entityType: "Reconciliation",
      entityId: entry.id,
      entityLabel: `${entry.description} · ${formatCurrency(entry.amount)}`,
      action: "Update",
      performedBy: actor,
      details: `Matched with ${voucher.voucherNumber}`,
    });
    setVersion((v) => v + 1);
  }

  function openMatch(entry: BankStatementEntry) {
    const candidates = unreconciledVouchers.filter(
      (v) => v.amount === entry.amount && isDirectionCompatible(entry, v, ledgerAccountId),
    );
    setMatchTarget(entry);
    setMatchVoucherId(candidates[0]?.id ?? "");
  }

  function handleAutoReconcile() {
    const used = new Set<string>();
    const pairs: { entry: BankStatementEntry; voucher: Voucher }[] = [];
    for (const entry of unreconciledEntries) {
      const match = unreconciledVouchers.find(
        (v) =>
          !used.has(v.id) &&
          v.amount === entry.amount &&
          isDirectionCompatible(entry, v, ledgerAccountId),
      );
      if (match) {
        used.add(match.id);
        pairs.push({ entry, voucher: match });
      }
    }
    pairs.forEach(({ entry, voucher }) => {
      entry.reconciled = true;
      entry.matchedVoucherId = voucher.id;
      voucher.reconciled = true;
    });
    if (pairs.length > 0) {
      recordAudit({
        module: "Bank Accounts",
        entityType: "Reconciliation",
        entityId: ledgerAccountId,
        entityLabel: ledgerName,
        action: "Update",
        performedBy: actor,
        details: `Auto-reconciled ${pairs.length} matching pair${pairs.length === 1 ? "" : "s"}: ${pairs.map((p) => `${p.voucher.voucherNumber}`).join(", ")}`,
      });
      setVersion((v) => v + 1);
    }
  }

  const matchCandidates = matchTarget
    ? unreconciledVouchers.filter((v) => isDirectionCompatible(matchTarget, v, ledgerAccountId))
    : [];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <Link
        href="/dashboard/accounts/bank-accounts"
        className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Back to Bank Accounts
      </Link>

      <Card>
        <CardContent className="flex flex-wrap items-center gap-6 p-6">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              {details.bankName}
            </h1>
            <p className="font-mono text-sm text-muted-foreground">
              {maskedAccountNumber(details.accountNumber)} · {details.ifsc} · {details.branch}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-xs text-muted-foreground">Current Balance</span>
            <span className="text-2xl font-semibold tabular-nums text-foreground">
              {formatCurrency(balance)}
            </span>
            {unreconciledEntries.length > 0 ? (
              <Badge variant="destructive">{unreconciledEntries.length} unreconciled</Badge>
            ) : (
              <Badge variant="secondary">All reconciled</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="ledger">
        <TabsList>
          <TabsTrigger value="ledger">Ledger Transactions</TabsTrigger>
          <TabsTrigger value="recon">Reconciliation</TabsTrigger>
        </TabsList>

        <TabsContent value="ledger" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Ledger Transactions</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {ledgerRows.length === 0 ? (
                <p className="p-6 text-center text-sm text-muted-foreground">
                  No posted entries for this account.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Voucher #</TableHead>
                      <TableHead>Narration</TableHead>
                      <TableHead className="text-right">Debit</TableHead>
                      <TableHead className="text-right">Credit</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="hover:bg-transparent">
                      <TableCell className="text-sm text-muted-foreground">
                        {details.openingBalanceDate ? formatDate(details.openingBalanceDate) : "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">—</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        Opening balance
                      </TableCell>
                      <TableCell />
                      <TableCell />
                      <TableCell className="text-right text-sm font-medium tabular-nums text-foreground">
                        {formatCurrency(details.openingBalance)}
                      </TableCell>
                    </TableRow>
                    {ledgerRows.map(({ voucher, balance: running }) => (
                      <TableRow key={voucher.id}>
                        <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                          {formatDate(voucher.date)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm font-medium text-foreground">
                          {voucher.voucherNumber}
                        </TableCell>
                        <TableCell
                          className="max-w-[240px] truncate text-sm text-muted-foreground"
                          title={voucher.narration}
                        >
                          {voucher.narration}
                        </TableCell>
                        <TableCell className="text-right text-sm tabular-nums text-foreground">
                          {voucher.debitAccountId === ledgerAccountId
                            ? formatCurrency(voucher.amount)
                            : "—"}
                        </TableCell>
                        <TableCell className="text-right text-sm tabular-nums text-foreground">
                          {voucher.creditAccountId === ledgerAccountId
                            ? formatCurrency(voucher.amount)
                            : "—"}
                        </TableCell>
                        <TableCell className="text-right text-sm font-medium tabular-nums text-foreground">
                          {formatCurrency(running)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recon" className="mt-4 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Match bank statement entries against posted vouchers by exact amount.
            </p>
            {canManage && (
              <Button
                size="sm"
                variant="outline"
                disabled={unreconciledEntries.length === 0 || unreconciledVouchers.length === 0}
                onClick={handleAutoReconcile}
              >
                Auto-Reconcile Matching Amounts
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Bank Statement — Unreconciled</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {unreconciledEntries.length === 0 ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    All statement entries reconciled.
                  </p>
                ) : (
                  unreconciledEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center gap-3 rounded-md border border-border p-3"
                    >
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-sm font-medium text-foreground">
                          {entry.description}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(entry.date)}
                        </span>
                      </div>
                      <span
                        className={`whitespace-nowrap text-sm font-medium tabular-nums ${entry.direction === "Credit" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}
                      >
                        {entry.direction === "Credit" ? "+" : "−"}
                        {formatCurrency(entry.amount)}
                      </span>
                      {canManage && (
                        <Button variant="outline" size="sm" onClick={() => openMatch(entry)}>
                          Match
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vouchers — Unreconciled</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {unreconciledVouchers.length === 0 ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    All vouchers reconciled.
                  </p>
                ) : (
                  unreconciledVouchers.map((voucher) => (
                    <div
                      key={voucher.id}
                      className="flex items-center gap-3 rounded-md border border-border p-3"
                    >
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-sm font-medium text-foreground">
                          {voucher.voucherNumber}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                          {voucher.narration}
                        </span>
                      </div>
                      <span className="whitespace-nowrap text-sm font-medium tabular-nums text-foreground">
                        {formatCurrency(voucher.amount)}
                      </span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={!!matchTarget} onOpenChange={(o) => !o && setMatchTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Match statement entry</DialogTitle>
            <DialogDescription>
              {matchTarget?.description} · {matchTarget ? formatCurrency(matchTarget.amount) : ""} ·{" "}
              {matchTarget?.direction}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-1.5">
            <Label>Voucher</Label>
            <Select value={matchVoucherId} onValueChange={(v) => setMatchVoucherId(v ?? "")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a voucher" />
              </SelectTrigger>
              <SelectContent>
                {matchCandidates.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.voucherNumber} · {formatCurrency(v.amount)}
                    {matchTarget && v.amount === matchTarget.amount ? " · Suggested" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {matchCandidates.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No compatible unreconciled vouchers for this account.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMatchTarget(null)}>
              Cancel
            </Button>
            <Button
              disabled={!matchVoucherId}
              onClick={() => {
                if (matchTarget && matchVoucherId) applyMatch(matchTarget.id, matchVoucherId);
                setMatchTarget(null);
                setMatchVoucherId("");
              }}
            >
              Confirm match
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
