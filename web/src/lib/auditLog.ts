export type AuditAction =
  | "Create"
  | "Update"
  | "Approve"
  | "Reject"
  | "Cancel"
  | "Delete"
  | "Status Change"
  | "Payment Recorded"
  | "Goods Received";

export type AuditLogEntry = {
  id: string;
  module: string;
  entityType: string;
  entityId: string;
  entityLabel: string;
  action: AuditAction;
  performedBy: string;
  performedAt: string;
  details?: string;
};

export const auditLog: AuditLogEntry[] = [
  {
    id: "aud-1",
    module: "Purchasing",
    entityType: "Purchase Request",
    entityId: "pr-5",
    entityLabel: "PR-2025-005",
    action: "Reject",
    performedBy: "Suresh Iyer",
    performedAt: "2025-08-03T11:00:00+05:30",
    details: "Budget exceeded for this quarter",
  },
  {
    id: "aud-2",
    module: "Purchasing",
    entityType: "Purchase Order",
    entityId: "po-2",
    entityLabel: "PO-2025-002",
    action: "Goods Received",
    performedBy: "Neha Kulkarni",
    performedAt: "2025-07-29T11:00:00+05:30",
    details: "5 × Gardening Tools Set received",
  },
  {
    id: "aud-3",
    module: "Invoicing",
    entityType: "Invoice",
    entityId: "inv-001",
    entityLabel: "INV-2026-04-001",
    action: "Payment Recorded",
    performedBy: "Arvind Deshmukh",
    performedAt: "2026-04-08T10:00:00+05:30",
    details: "₹4,630 via NEFT/RTGS",
  },
  {
    id: "aud-4",
    module: "Assets",
    entityType: "Service Log",
    entityId: "asl-2",
    entityLabel: "AMC Renewal — Diesel Generator - Tower A",
    action: "Create",
    performedBy: "Suresh Iyer",
    performedAt: "2025-06-12T11:30:00+05:30",
    details: "Annual AMC renewed for next year",
  },
  {
    id: "aud-5",
    module: "Inventory",
    entityType: "Stock Transaction",
    entityId: "st-17",
    entityLabel: "Stock In — Cement Bags",
    action: "Create",
    performedBy: "Anjali Desai",
    performedAt: "2025-01-25T10:00:00+05:30",
    details: "200 Kg received — repair work procurement",
  },
  {
    id: "aud-6",
    module: "Accounts",
    entityType: "Billing Settings",
    entityId: "gst",
    entityLabel: "GST Settings",
    action: "Update",
    performedBy: "Suresh Iyer",
    performedAt: "2025-06-20T15:00:00+05:30",
    details: "GST rate set to 18%",
  },
];

export function recordAudit(entry: Omit<AuditLogEntry, "id" | "performedAt">): void {
  auditLog.unshift({ ...entry, id: crypto.randomUUID(), performedAt: new Date().toISOString() });
}
