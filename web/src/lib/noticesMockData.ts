import { z } from "zod";

import { residents } from "./residentsMockData";
import { attachmentSchema, type Attachment } from "./attachmentTypes";

export type NoticeCategory =
  "Maintenance" | "Shutdown" | "Event" | "Security Alert" | "General" | "AGM" | "Billing";
export type NoticePriority = "normal" | "flash";
export type NoticeAudience =
  { scope: "All" } | { scope: "Blocks"; blocks: string[] } | { scope: "Flats"; flats: string[] };

export type NoticeAttachment = Attachment;

export type NoticeReadReceipt = {
  name: string;
  viewedAt: string;
};

export type BoardNotice = {
  id: string;
  title: string;
  category: NoticeCategory;
  description: string;
  excerpt: string;
  priority: NoticePriority;
  postedBy: string;
  postedAt: string;
  scheduleAt: string | null;
  expiryAt: string | null;
  audience: NoticeAudience;
  coverImage?: string;
  tags?: string[];
  attachments?: NoticeAttachment[];
  requiresAcknowledge: boolean;
  readBy: NoticeReadReceipt[];
  acknowledgedBy: string[];
  totalResidents: number;
};

export const NOTICE_CATEGORIES: NoticeCategory[] = [
  "Maintenance",
  "Shutdown",
  "Event",
  "Security Alert",
  "General",
  "AGM",
  "Billing",
];

export const SUGGESTED_NOTICE_TAGS = [
  "urgent",
  "action-required",
  "fyi",
  "recurring",
  "one-time",
  "committee",
];

export const noticeAttachmentSchema = attachmentSchema;

export const noticeFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.enum([
    "Maintenance",
    "Shutdown",
    "Event",
    "Security Alert",
    "General",
    "AGM",
    "Billing",
  ]),
  priority: z.enum(["normal", "flash"]),
  audienceScope: z.enum(["All", "Blocks", "Flats"]),
  audienceValue: z.array(z.string()).optional(),
  requiresAcknowledge: z.boolean(),
  scheduleAt: z.string().optional().nullable(),
  expiryAt: z.string().optional().nullable(),
  coverImage: z.string().optional(),
  tags: z.array(z.string()).optional(),
  attachments: z.array(noticeAttachmentSchema).optional(),
});

export type NoticeFormInput = z.infer<typeof noticeFormSchema>;

const residentsPool = residents.map((r) => r.name);

function pickReadBy(count: number, seed: number) {
  const shuffled = [...residentsPool].sort((a, b) => a.localeCompare(b) + seed * 0.1);
  return shuffled.slice(0, count);
}

function pickReadReceipts(count: number, seed: number, postedAt: string): NoticeReadReceipt[] {
  const names = pickReadBy(count, seed);
  const postedMs = new Date(postedAt).getTime();
  const nowMs = Date.now();
  const windowMs = Math.max(nowMs - postedMs, 60 * 60 * 1000);
  return names.map((name, i) => {
    // deterministic spread across the window since posting, most-recent-viewer last
    const fraction = names.length === 1 ? 0.5 : i / (names.length - 1);
    const jitter = ((i * 37 + seed * 13) % 47) / 47 / names.length;
    const viewedMs = postedMs + (fraction + jitter) * windowMs * 0.6;
    return { name, viewedAt: new Date(Math.min(viewedMs, nowMs)).toISOString() };
  });
}

export const boardNotices: BoardNotice[] = [
  {
    id: "notice-7",
    title: "Urgent: Main gate security protocol update — effective tonight",
    category: "Security Alert" as NoticeCategory,
    excerpt: "New visitor verification steps start 8 PM today. Guards will call to confirm…",
    description:
      "Effective tonight 8 PM, all visitor entries will require OTP verification via the guard's device. Residents are requested to keep their phones reachable and pre-approve expected guests via the Visitors tab. Delivery partners without a pass will be held at the gate until the flat confirms. This change follows last week's unauthorized entry incident in Block B. Contact the security office for queries.",
    priority: "flash" as NoticePriority,
    postedBy: "Vikram Singh Rathore · President",
    postedAt: "2026-06-18T09:15:00+05:30",
    scheduleAt: null,
    expiryAt: "2026-06-25T23:59:00+05:30",
    audience: { scope: "All" as const },
    tags: ["urgent", "action-required"],
    attachments: [
      {
        name: "Security-Protocol-v2.pdf",
        url: "/mock/security-protocol.pdf",
        type: "pdf" as const,
        size: "1.2 MB",
      },
      {
        name: "Gate-Entry-Flowchart.jpg",
        url: "https://picsum.photos/seed/notice-7-flowchart/800/400",
        type: "image" as const,
        size: "1.8 MB",
      },
    ],
    requiresAcknowledge: true,
    readBy: pickReadReceipts(38, 7, "2026-06-18T09:15:00+05:30"),
    acknowledgedBy: pickReadBy(22, 7),
    totalResidents: 60,
  },
  {
    id: "notice-6",
    title: "Water supply shutdown — tank cleaning on Jun 20",
    category: "Shutdown" as NoticeCategory,
    excerpt: "Water will be suspended 10 AM–1 PM on Jun 20 for annual tank cleaning.",
    description:
      "Annual overhead tank cleaning is scheduled for June 20, 10 AM to 1 PM. Water supply will remain suspended in all blocks during this window. Please store water in advance. The maintenance team will flush lines at 1:30 PM and supply will normalize by 2 PM. Inconvenience regretted.",
    priority: "flash" as NoticePriority,
    postedBy: "Sunita Patil · Secretary",
    postedAt: "2026-06-16T10:00:00+05:30",
    scheduleAt: null,
    expiryAt: "2026-06-20T14:00:00+05:30",
    audience: { scope: "All" as const },
    tags: ["one-time"],
    requiresAcknowledge: false,
    readBy: pickReadReceipts(51, 6, "2026-06-16T10:00:00+05:30"),
    acknowledgedBy: [],
    totalResidents: 60,
  },
  {
    id: "notice-5",
    title: "AGM scheduled — July 5th, clubhouse 6:30 PM",
    category: "AGM" as NoticeCategory,
    excerpt: "Annual General Meeting at the clubhouse. Budget and audit reports to be presented.",
    description:
      "The Annual General Meeting for FY 2025–26 will be held on July 5th, 6:30 PM at the clubhouse. Agenda: approval of annual accounts, audit report, election of two committee seats, and open house. All flat owners are requested to attend. Tenants may attend as observers. Proxy forms available at the office until July 3rd.",
    priority: "normal" as NoticePriority,
    postedBy: "Arvind Deshmukh · Secretary",
    postedAt: "2026-06-14T17:30:00+05:30",
    scheduleAt: null,
    expiryAt: null,
    audience: { scope: "All" as const },
    coverImage: "https://picsum.photos/seed/notice-5/800/400",
    tags: ["committee", "action-required"],
    attachments: [
      {
        name: "AGM-Agenda-2026.pdf",
        url: "/mock/agm-agenda.pdf",
        type: "pdf" as const,
        size: "860 KB",
      },
    ],
    requiresAcknowledge: true,
    readBy: pickReadReceipts(42, 5, "2026-06-14T17:30:00+05:30"),
    acknowledgedBy: pickReadBy(18, 5),
    totalResidents: 60,
  },
  {
    id: "notice-4",
    title: "June maintenance dues — due by Jun 30",
    category: "Billing" as NoticeCategory,
    excerpt: "Monthly dues of ₹4,350 have been generated. Please pay via the Billing tab…",
    description:
      "June 2026 maintenance dues (₹4,350) have been generated for all flats. Due date is June 30. Late fee of ₹200 applies thereafter. UPI, net banking, and card payments are available under Billing → Dues and Receipts. Contact accounts@greenvalley.local for discrepancies.",
    priority: "normal" as NoticePriority,
    postedBy: "Suresh Iyer · Treasurer",
    postedAt: "2026-06-12T09:00:00+05:30",
    scheduleAt: null,
    expiryAt: "2026-06-30T23:59:00+05:30",
    audience: { scope: "All" as const },
    tags: ["action-required"],
    requiresAcknowledge: false,
    readBy: pickReadReceipts(45, 4, "2026-06-12T09:00:00+05:30"),
    acknowledgedBy: [],
    totalResidents: 60,
  },
  {
    id: "notice-3",
    title: "Block A lift — annual servicing on Jun 18",
    category: "Maintenance" as NoticeCategory,
    excerpt:
      "Lift in Block A will be under servicing 2–5 PM. Please use stairs during this window.",
    description:
      "The Block A lift is due for annual servicing on June 18, 2 PM to 5 PM. The lift will remain non-operational during this period. Residents on higher floors are advised to plan accordingly. Emergency contact for lift issues: +91 98765 43210.",
    priority: "normal" as NoticePriority,
    postedBy: "Sunita Patil · Secretary",
    postedAt: "2026-06-10T14:20:00+05:30",
    scheduleAt: null,
    expiryAt: null,
    audience: { scope: "Blocks" as const, blocks: ["A"] },
    tags: ["one-time"],
    requiresAcknowledge: false,
    readBy: pickReadReceipts(18, 3, "2026-06-10T14:20:00+05:30"),
    acknowledgedBy: [],
    totalResidents: 20,
  } as BoardNotice,
  {
    id: "notice-2",
    title: "Diwali decoration volunteers — join the planning team",
    category: "Event" as NoticeCategory,
    excerpt:
      "Sign up at the helpdesk to help plan this year's common-area decorations and cultural night.",
    description:
      "Diwali is around the corner and the cultural committee is inviting volunteers for decoration, rangoli, and the evening program. Interested residents can register at the helpdesk or reply to this notice. First planning meet is June 22, 11 AM at the clubhouse. Let's make this a memorable celebration for all blocks.",
    priority: "normal" as NoticePriority,
    postedBy: "Ananya Gupta · Cultural Lead",
    postedAt: "2026-06-05T12:00:00+05:30",
    scheduleAt: null,
    expiryAt: null,
    audience: { scope: "Blocks" as const, blocks: ["B", "C"] },
    coverImage: "https://picsum.photos/seed/notice-2/800/400",
    tags: ["fyi", "recurring"],
    attachments: [
      {
        name: "diwali-2025-moodboard.jpg",
        url: "https://picsum.photos/seed/notice-2-moodboard/800/400",
        type: "image" as const,
        size: "2.4 MB",
      },
    ],
    requiresAcknowledge: false,
    readBy: pickReadReceipts(28, 2, "2026-06-05T12:00:00+05:30"),
    acknowledgedBy: [],
    totalResidents: 40,
  },
  {
    id: "notice-1",
    title: "Revised parking slot allotment — effective July 1",
    category: "General" as NoticeCategory,
    excerpt:
      "New parking slots have been allotted per the lottery held on Jun 2. Check your assigned slot…",
    description:
      "Following the lottery held on June 2nd, revised parking slots are now allotted. Each flat's assigned slot is updated under Vehicles & Parking. Please use only your allotted slot from July 1st. Vehicles in unassigned slots after July 1 will be clamped. The allotment list is attached. Contact the estate office for clarifications.",
    priority: "normal" as NoticePriority,
    postedBy: "Mohammed Farhan · Estate Manager",
    postedAt: "2026-06-02T09:00:00+05:30",
    scheduleAt: null,
    expiryAt: null,
    audience: { scope: "Flats" as const, flats: ["A-301", "A-502", "B-204"] },
    tags: ["fyi"],
    attachments: [
      {
        name: "Parking-Allotment-July.pdf",
        url: "/mock/parking-allotment.pdf",
        type: "pdf" as const,
        size: "540 KB",
      },
    ],
    requiresAcknowledge: true,
    readBy: pickReadReceipts(12, 1, "2026-06-02T09:00:00+05:30"),
    acknowledgedBy: pickReadBy(5, 1),
    totalResidents: 60,
  },
  {
    id: "notice-8",
    title: "Scheduled power maintenance — Block B & C, Jun 22 2–4 PM",
    category: "Shutdown" as NoticeCategory,
    excerpt:
      "MSEDCL maintenance will cut power in Blocks B and C for two hours. DG backup for lifts only.",
    description:
      "MSEDCL has scheduled feeder maintenance for Blocks B and C on June 22, 2 PM to 4 PM. Power will be unavailable; DG will support lifts and common lighting only. Please charge devices in advance and avoid elevator use unless necessary.",
    priority: "flash" as NoticePriority,
    postedBy: "Sunita Patil · Secretary",
    postedAt: "2026-06-19T08:00:00+05:30",
    scheduleAt: "2026-06-20T08:00:00+05:30",
    expiryAt: "2026-06-22T16:00:00+05:30",
    audience: { scope: "Blocks" as const, blocks: ["B", "C"] },
    coverImage: "https://picsum.photos/seed/notice-8/800/400",
    tags: ["one-time"],
    requiresAcknowledge: false,
    readBy: pickReadReceipts(8, 8, "2026-06-19T08:00:00+05:30"),
    acknowledgedBy: [],
    totalResidents: 40,
  },
].sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());

export function getNoticeById(id: string) {
  return boardNotices.find((n) => n.id === id) ?? null;
}
