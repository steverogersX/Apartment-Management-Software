import type { ComplaintPriority } from "./mockData";

export type HelpdeskCategory = {
  id: string;
  name: string;
};

export type SlaRule = {
  priority: ComplaintPriority;
  resolveWithinHours: number;
  autoEscalateIfOverdue: boolean;
};

export type HelpdeskNotificationSettings = {
  notifyCommitteeOnNew: boolean;
  notifyResidentOnStatusChange: boolean;
  notifyOnEscalation: boolean;
};

export const helpdeskCategories: HelpdeskCategory[] = [
  { id: "cat-plumbing", name: "Plumbing" },
  { id: "cat-common-area", name: "Common Area" },
  { id: "cat-electrical", name: "Electrical" },
  { id: "cat-maintenance", name: "Maintenance" },
  { id: "cat-housekeeping", name: "Housekeeping" },
  { id: "cat-security", name: "Security" },
  { id: "cat-parking", name: "Parking" },
  { id: "cat-noise", name: "Noise" },
];

export const slaRules: SlaRule[] = [
  { priority: "high", resolveWithinHours: 24, autoEscalateIfOverdue: true },
  { priority: "medium", resolveWithinHours: 72, autoEscalateIfOverdue: true },
  { priority: "low", resolveWithinHours: 168, autoEscalateIfOverdue: false },
];

export const helpdeskNotificationSettings: HelpdeskNotificationSettings = {
  notifyCommitteeOnNew: true,
  notifyResidentOnStatusChange: true,
  notifyOnEscalation: true,
};
