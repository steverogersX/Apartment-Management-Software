import { vouchers } from "./vouchersMockData";
import { groupLedgerIds } from "./chartOfAccountsMockData";

export type BankAccountDetails = {
  ledgerAccountId: string;
  accountNumber: string;
  ifsc: string;
  bankName: string;
  branch: string;
  openingBalance: number;
  openingBalanceDate: string;
};

export const bankAccountDetails: BankAccountDetails[] = [
  {
    ledgerAccountId: "la-bank",
    accountNumber: "50100234567890",
    ifsc: "HDFC0001234",
    bankName: "HDFC Bank",
    branch: "MVP Colony, Vizag",
    openingBalance: 250000,
    openingBalanceDate: "2025-01-01T00:00:00+05:30",
  },
  {
    ledgerAccountId: "la-cash",
    accountNumber: "N/A",
    ifsc: "N/A",
    bankName: "Cash in Hand",
    branch: "Society Office",
    openingBalance: 50000,
    openingBalanceDate: "2025-01-01T00:00:00+05:30",
  },
];

export function computeLedgerBalance(ledgerAccountId: string): number {
  const opening =
    bankAccountDetails.find((b) => b.ledgerAccountId === ledgerAccountId)?.openingBalance ?? 0;
  return vouchers
    .filter((v) => v.status === "Posted")
    .reduce((balance, v) => {
      if (v.debitAccountId === ledgerAccountId) return balance + v.amount;
      if (v.creditAccountId === ledgerAccountId) return balance - v.amount;
      return balance;
    }, opening);
}

/** Every ledger's balance in a single pass over the vouchers. */
export function computeAllLedgerBalances(): Map<string, number> {
  const balances = new Map<string, number>();
  for (const b of bankAccountDetails) balances.set(b.ledgerAccountId, b.openingBalance);
  for (const v of vouchers) {
    if (v.status !== "Posted") continue;
    balances.set(v.debitAccountId, (balances.get(v.debitAccountId) ?? 0) + v.amount);
    balances.set(v.creditAccountId, (balances.get(v.creditAccountId) ?? 0) - v.amount);
  }
  return balances;
}

export function computeGroupBalance(groupId: string): number {
  return groupLedgerIds(groupId).reduce((sum, id) => sum + computeLedgerBalance(id), 0);
}

export type BankStatementEntry = {
  id: string;
  ledgerAccountId: string;
  date: string;
  description: string;
  amount: number;
  direction: "Credit" | "Debit";
  reconciled: boolean;
  matchedVoucherId: string | null;
};

export const bankStatementEntries: BankStatementEntry[] = [
  {
    id: "bse-1",
    ledgerAccountId: "la-bank",
    date: "2026-04-08T10:00:00+05:30",
    description: "NEFT — maintenance collection",
    amount: 4630,
    direction: "Credit",
    reconciled: true,
    matchedVoucherId: "vch-1",
  },
  {
    id: "bse-2",
    ledgerAccountId: "la-bank",
    date: "2026-05-09T10:00:00+05:30",
    description: "UPI — maintenance collection",
    amount: 5192,
    direction: "Credit",
    reconciled: false,
    matchedVoucherId: null,
  },
  {
    id: "bse-3",
    ledgerAccountId: "la-bank",
    date: "2025-07-29T11:00:00+05:30",
    description: "NEFT — Garden Greens",
    amount: 7500,
    direction: "Debit",
    reconciled: true,
    matchedVoucherId: "vch-3",
  },
  {
    id: "bse-4",
    ledgerAccountId: "la-bank",
    date: "2026-04-15T11:00:00+05:30",
    description: "Cash deposit",
    amount: 25000,
    direction: "Credit",
    reconciled: false,
    matchedVoucherId: null,
  },
  {
    id: "bse-5",
    ledgerAccountId: "la-bank",
    date: "2026-05-18T16:00:00+05:30",
    description: "NEFT — housekeeping contract",
    amount: 45000,
    direction: "Debit",
    reconciled: false,
    matchedVoucherId: null,
  },
  {
    id: "bse-6",
    ledgerAccountId: "la-bank",
    date: "2026-05-20T14:00:00+05:30",
    description: "UPI — maintenance collection",
    amount: 12000,
    direction: "Credit",
    reconciled: false,
    matchedVoucherId: null,
  },
  {
    id: "bse-7",
    ledgerAccountId: "la-bank",
    date: "2026-06-02T09:30:00+05:30",
    description: "NEFT — maintenance collection",
    amount: 8200,
    direction: "Credit",
    reconciled: false,
    matchedVoucherId: null,
  },
  {
    id: "bse-8",
    ledgerAccountId: "la-bank",
    date: "2026-06-05T12:00:00+05:30",
    description: "Cheque — plumbing work",
    amount: 22000,
    direction: "Debit",
    reconciled: false,
    matchedVoucherId: null,
  },
  {
    id: "bse-9",
    ledgerAccountId: "la-bank",
    date: "2026-06-10T10:00:00+05:30",
    description: "Interest credit",
    amount: 1250,
    direction: "Credit",
    reconciled: false,
    matchedVoucherId: null,
  },
  {
    id: "bse-10",
    ledgerAccountId: "la-bank",
    date: "2026-04-10T11:00:00+05:30",
    description: "UPI — maintenance collection",
    amount: 4130,
    direction: "Credit",
    reconciled: false,
    matchedVoucherId: null,
  },
  {
    id: "bse-11",
    ledgerAccountId: "la-bank",
    date: "2026-05-02T10:00:00+05:30",
    description: "ATM withdrawal — petty cash",
    amount: 10000,
    direction: "Debit",
    reconciled: false,
    matchedVoucherId: null,
  },
  {
    id: "bse-12",
    ledgerAccountId: "la-bank",
    date: "2026-06-12T15:00:00+05:30",
    description: "NEFT — security contract",
    amount: 38000,
    direction: "Debit",
    reconciled: false,
    matchedVoucherId: null,
  },
  {
    id: "bse-13",
    ledgerAccountId: "la-cash",
    date: "2026-05-11T09:00:00+05:30",
    description: "Cash — maintenance collection",
    amount: 4248,
    direction: "Credit",
    reconciled: false,
    matchedVoucherId: null,
  },
  {
    id: "bse-14",
    ledgerAccountId: "la-cash",
    date: "2026-04-15T11:00:00+05:30",
    description: "Cash deposited to bank",
    amount: 25000,
    direction: "Debit",
    reconciled: false,
    matchedVoucherId: null,
  },
  {
    id: "bse-15",
    ledgerAccountId: "la-bank",
    date: "2026-06-15T09:00:00+05:30",
    description: "UPI — maintenance collection",
    amount: 4248,
    direction: "Credit",
    reconciled: false,
    matchedVoucherId: null,
  },
  {
    id: "bse-16",
    ledgerAccountId: "la-bank",
    date: "2026-06-18T13:00:00+05:30",
    description: "NEFT — water tanker",
    amount: 6500,
    direction: "Debit",
    reconciled: false,
    matchedVoucherId: null,
  },
];
