export type BillingMethod = "Equal Split" | "Per Sqft" | "Hybrid";
export type BillingCycle = "Monthly" | "Quarterly" | "Half-Yearly" | "Annually";
export type LateFeeType = "Fixed" | "Percentage";

export type BillingRateSettings = {
  method: BillingMethod;
  equalSplitAmount: number;
  ratePerSqft: number;
  billingCycle: BillingCycle;
  dueDayOfMonth: number;
  lastUpdatedBy: string | null;
  lastUpdatedAt: string | null;
};

export type GstSettings = {
  gstApplicable: boolean;
  gstRate: number;
  gstin: string;
  lastUpdatedBy: string | null;
  lastUpdatedAt: string | null;
};

export type LateFeeSettings = {
  enabled: boolean;
  type: LateFeeType;
  value: number;
  gracePeriodDays: number;
  lastUpdatedBy: string | null;
  lastUpdatedAt: string | null;
};

export type AdditionalCharge = {
  id: string;
  name: string;
  defaultAmount: number;
  applicableTo: "All Flats" | "Owners Only" | "Tenants Only";
};

export type PaymentDetails = {
  bankName: string;
  accountNumber: string;
  ifsc: string;
  upiId: string;
  lastUpdatedBy: string | null;
  lastUpdatedAt: string | null;
};

export const billingRateSettings: BillingRateSettings = {
  method: "Per Sqft",
  equalSplitAmount: 3000,
  ratePerSqft: 3.5,
  billingCycle: "Monthly",
  dueDayOfMonth: 10,
  lastUpdatedBy: "Suresh Iyer",
  lastUpdatedAt: "2025-06-18T10:00:00+05:30",
};

export const gstSettings: GstSettings = {
  gstApplicable: true,
  gstRate: 0.18,
  gstin: "22AAAAA0000A1Z5",
  lastUpdatedBy: "Suresh Iyer",
  lastUpdatedAt: "2025-06-20T15:00:00+05:30",
};

export const lateFeeSettings: LateFeeSettings = {
  enabled: true,
  type: "Fixed",
  value: 200,
  gracePeriodDays: 5,
  lastUpdatedBy: "Anjali Desai",
  lastUpdatedAt: "2025-06-21T09:30:00+05:30",
};

export const additionalCharges: AdditionalCharge[] = [
  { id: "ac-1", name: "Sinking Fund", defaultAmount: 500, applicableTo: "All Flats" },
  { id: "ac-2", name: "Parking", defaultAmount: 800, applicableTo: "All Flats" },
];

export const paymentDetails: PaymentDetails = {
  bankName: "HDFC Bank",
  accountNumber: "50100234567890",
  ifsc: "HDFC0001234",
  upiId: "greenvalley@hdfcbank",
  lastUpdatedBy: "Suresh Iyer",
  lastUpdatedAt: "2025-06-18T10:00:00+05:30",
};
