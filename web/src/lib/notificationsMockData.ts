import type { ComponentType } from "react";
import { AlertTriangle, Bell, MessageSquare, Receipt, ShieldCheck, UserCheck } from "lucide-react";

export type NotificationCategory =
  "visitor" | "billing" | "complaint" | "notice" | "security" | "system";

export type NotificationRecord = {
  id: string;
  category: NotificationCategory;
  title: string;
  description: string;
  isRead: boolean;
  createdAt: string;
};

export const CATEGORY_ICON: Record<NotificationCategory, ComponentType<{ className?: string }>> = {
  visitor: UserCheck,
  billing: Receipt,
  complaint: AlertTriangle,
  notice: MessageSquare,
  security: ShieldCheck,
  system: Bell,
};

/**
 * UI-only mock data for the notifications bell — no backing table or API yet.
 * Ordered newest first.
 */
export const initialNotifications: NotificationRecord[] = [
  {
    id: "1",
    category: "visitor",
    title: "New visitor request",
    description: "Rahul Verma is requesting entry for a delivery at Gate 2.",
    isRead: false,
    createdAt: "2026-08-29T09:42:00+05:30",
  },
  {
    id: "2",
    category: "complaint",
    title: "Complaint escalated",
    description: '"Lift not working in Tower A" was escalated by Suresh Iyer.',
    isRead: false,
    createdAt: "2026-08-29T08:15:00+05:30",
  },
  {
    id: "3",
    category: "billing",
    title: "Maintenance bill generated",
    description: "August maintenance bills were generated for 42 flats.",
    isRead: false,
    createdAt: "2026-08-28T18:30:00+05:30",
  },
  {
    id: "4",
    category: "security",
    title: "Overstay alert",
    description: "A visitor at Flat B-204 has overstayed their approved window.",
    isRead: true,
    createdAt: "2026-08-28T14:05:00+05:30",
  },
  {
    id: "5",
    category: "notice",
    title: "New notice posted",
    description: '"Water supply maintenance on Sunday" was posted to all residents.',
    isRead: true,
    createdAt: "2026-08-27T11:00:00+05:30",
  },
  {
    id: "6",
    category: "system",
    title: "New role created",
    description: 'The role "Committee Member" was created for Green Valley Apartments.',
    isRead: true,
    createdAt: "2026-08-26T16:20:00+05:30",
  },
  {
    id: "7",
    category: "visitor",
    title: "Visitor approved",
    description: "Priya Sharma approved a visitor for Flat A-301.",
    isRead: true,
    createdAt: "2026-08-25T10:10:00+05:30",
  },
];
