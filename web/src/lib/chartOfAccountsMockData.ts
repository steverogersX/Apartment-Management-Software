import { z } from "zod";

export type AccountGroupType =
  | "Capital Account"
  | "Current Assets"
  | "Current Liabilities"
  | "Fixed Assets"
  | "Direct Income"
  | "Indirect Income"
  | "Direct Expenses"
  | "Indirect Expenses";

export type AccountGroup = {
  id: string;
  name: string;
  type: AccountGroupType;
  parentGroupId: string | null;
};

export type LedgerAccountType = "Asset" | "Liability" | "Income" | "Expense" | "Bank" | "Cash";

export type LedgerAccount = {
  id: string;
  name: string;
  type: LedgerAccountType;
  groupId: string;
};

export const accountGroups: AccountGroup[] = [
  { id: "g-capital", name: "Capital Account", type: "Capital Account", parentGroupId: null },
  { id: "g-current-assets", name: "Current Assets", type: "Current Assets", parentGroupId: null },
  {
    id: "g-bank",
    name: "Bank Accounts",
    type: "Current Assets",
    parentGroupId: "g-current-assets",
  },
  { id: "g-cash", name: "Cash-in-Hand", type: "Current Assets", parentGroupId: "g-current-assets" },
  {
    id: "g-current-liab",
    name: "Current Liabilities",
    type: "Current Liabilities",
    parentGroupId: null,
  },
  { id: "g-fixed-assets", name: "Fixed Assets", type: "Fixed Assets", parentGroupId: null },
  { id: "g-direct-inc", name: "Direct Income", type: "Direct Income", parentGroupId: null },
  { id: "g-indirect-inc", name: "Indirect Income", type: "Indirect Income", parentGroupId: null },
  { id: "g-direct-exp", name: "Direct Expenses", type: "Direct Expenses", parentGroupId: null },
  {
    id: "g-indirect-exp",
    name: "Indirect Expenses",
    type: "Indirect Expenses",
    parentGroupId: null,
  },
];

export const ledgerAccounts: LedgerAccount[] = [
  { id: "la-bank", name: "Bank Account - HDFC", type: "Bank", groupId: "g-bank" },
  { id: "la-cash", name: "Cash in Hand", type: "Cash", groupId: "g-cash" },
  { id: "la-maint-inc", name: "Maintenance Income", type: "Income", groupId: "g-direct-inc" },
  { id: "la-sinking", name: "Sinking Fund", type: "Liability", groupId: "g-current-liab" },
  { id: "la-payables", name: "Vendor Payables", type: "Liability", groupId: "g-current-liab" },
  {
    id: "la-repairs",
    name: "Repairs & Maintenance Expense",
    type: "Expense",
    groupId: "g-direct-exp",
  },
  { id: "la-electricity", name: "Electricity Expense", type: "Expense", groupId: "g-direct-exp" },
  { id: "la-housekeeping", name: "Housekeeping Expense", type: "Expense", groupId: "g-direct-exp" },
  {
    id: "la-security",
    name: "Security Services Expense",
    type: "Expense",
    groupId: "g-direct-exp",
  },
  { id: "la-water", name: "Water Charges Expense", type: "Expense", groupId: "g-direct-exp" },
  { id: "la-insurance", name: "Insurance Expense", type: "Expense", groupId: "g-indirect-exp" },
  { id: "la-office", name: "Office Admin Expense", type: "Expense", groupId: "g-indirect-exp" },
];

export function accountName(id: string) {
  return ledgerAccounts.find((a) => a.id === id)?.name ?? id;
}

export function groupLedgerIds(groupId: string): string[] {
  const ids = new Set<string>([groupId]);
  accountGroups.forEach((g) => {
    if (g.parentGroupId === groupId) ids.add(g.id);
  });
  return ledgerAccounts.filter((a) => ids.has(a.groupId)).map((a) => a.id);
}

const GROUP_TYPES: AccountGroupType[] = [
  "Capital Account",
  "Current Assets",
  "Current Liabilities",
  "Fixed Assets",
  "Direct Income",
  "Indirect Income",
  "Direct Expenses",
  "Indirect Expenses",
];

export const addAccountGroupSchema = z.object({
  name: z.string().min(2, "Name is required"),
  type: z.enum(GROUP_TYPES as [AccountGroupType, ...AccountGroupType[]]),
  parentGroupId: z.string().nullable().optional(),
});

export type AddAccountGroupInput = z.infer<typeof addAccountGroupSchema>;

export const addLedgerAccountSchema = z.object({
  name: z.string().min(2, "Name is required"),
  type: z.enum(["Asset", "Liability", "Income", "Expense", "Bank", "Cash"]),
  groupId: z.string().min(1, "Group is required"),
});

export type AddLedgerAccountInput = z.infer<typeof addLedgerAccountSchema>;
