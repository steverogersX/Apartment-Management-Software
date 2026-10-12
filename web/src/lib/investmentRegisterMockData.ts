import { z } from "zod";

export type InvestmentType = "Fixed Deposit" | "Bond" | "Mutual Fund" | "Other";

export type Investment = {
  id: string;
  type: InvestmentType;
  institution: string;
  investedAmount: number;
  investmentDate: string;
  maturityDate: string | null;
  interestRate: number;
  linkedLedgerAccountId: string | null;
};

export const addInvestmentSchema = z.object({
  type: z.enum(["Fixed Deposit", "Bond", "Mutual Fund", "Other"]),
  institution: z.string().min(2, "Institution is required"),
  investedAmount: z.coerce.number().min(1, "Amount must be at least ₹1"),
  investmentDate: z.string().min(1, "Investment date is required"),
  maturityDate: z.string().nullable().optional(),
  interestRate: z.coerce
    .number()
    .min(0, "Interest rate cannot be negative")
    .max(100, "Interest rate looks too high"),
  linkedLedgerAccountId: z.string().nullable().optional(),
});

export type AddInvestmentInput = z.infer<typeof addInvestmentSchema>;

export const investments: Investment[] = [
  {
    id: "invst-1",
    type: "Fixed Deposit",
    institution: "HDFC Bank",
    investedAmount: 500000,
    investmentDate: "2024-06-01T00:00:00+05:30",
    maturityDate: "2026-06-01T00:00:00+05:30",
    interestRate: 7.1,
    linkedLedgerAccountId: "la-bank",
  },
  {
    id: "invst-2",
    type: "Fixed Deposit",
    institution: "State Bank of India",
    investedAmount: 300000,
    investmentDate: "2025-01-15T00:00:00+05:30",
    maturityDate: "2027-01-15T00:00:00+05:30",
    interestRate: 7.4,
    linkedLedgerAccountId: "la-bank",
  },
  {
    id: "invst-3",
    type: "Fixed Deposit",
    institution: "ICICI Bank",
    investedAmount: 200000,
    investmentDate: "2025-08-10T00:00:00+05:30",
    maturityDate: "2026-08-10T00:00:00+05:30",
    interestRate: 6.9,
    linkedLedgerAccountId: null,
  },
  {
    id: "invst-4",
    type: "Bond",
    institution: "NHAI Tax-Free Bonds",
    investedAmount: 150000,
    investmentDate: "2023-11-20T00:00:00+05:30",
    maturityDate: "2033-11-20T00:00:00+05:30",
    interestRate: 7.5,
    linkedLedgerAccountId: null,
  },
];
