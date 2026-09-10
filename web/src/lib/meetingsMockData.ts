import { z } from "zod";

import { residents } from "./residentsMockData";
import type { Attachment } from "./attachmentTypes";

export type MeetingAudience =
  { scope: "All" } | { scope: "Blocks"; blocks: string[] } | { scope: "Flats"; flats: string[] };

export type MeetingRSVP = {
  name: string;
  response: "yes" | "no" | "maybe";
};

export type Meeting = {
  id: string;
  title: string;
  agenda: string;
  location?: string;
  organizerName: string;
  organizerFlat: string;
  audience: MeetingAudience;
  scheduledAt: string;
  postedAt: string;
  rsvps: MeetingRSVP[];
  minutes?: Attachment[];
  cancelled: boolean;
};

function flatFor(name: string): string {
  const r = residents.find((x) => x.name === name);
  return r ? `${r.tower}-${r.flatNumber}` : "A-301";
}

export function isMeetingCancelled(meeting: Meeting): boolean {
  return meeting.cancelled;
}

export function isMeetingUpcoming(meeting: Meeting): boolean {
  return !meeting.cancelled && new Date(meeting.scheduledAt).getTime() >= Date.now();
}

export function isMeetingPast(meeting: Meeting): boolean {
  return !meeting.cancelled && new Date(meeting.scheduledAt).getTime() < Date.now();
}

export function getMeetingStatus(meeting: Meeting): "upcoming" | "past" | "cancelled" {
  if (meeting.cancelled) return "cancelled";
  return isMeetingPast(meeting) ? "past" : "upcoming";
}

export const meetingFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  agenda: z.string().min(10, "Agenda must be at least 10 characters"),
  location: z.string().optional(),
  scheduledAt: z.string().min(1, "Scheduled time is required"),
  audienceScope: z.enum(["All", "Blocks", "Flats"]),
  audienceValue: z.array(z.string()).optional(),
});

export type MeetingFormInput = z.infer<typeof meetingFormSchema>;

export const meetings: Meeting[] = [
  {
    id: "meeting-1",
    title: "AGM Follow-up: Budget Review Session",
    agenda:
      "Follow-up session to discuss the annual budget approved at the AGM. We will review the maintenance cost breakdown, upcoming capital expenditures, and the reserve fund. Please come prepared with questions. Documents will be shared in the Documents section.",
    location: "Clubhouse, Conference Room",
    organizerName: "Vikram Singh Rathore",
    organizerFlat: flatFor("Vikram Singh Rathore"),
    audience: { scope: "All" },
    scheduledAt: "2026-09-10T18:00:00+05:30",
    postedAt: "2026-08-28T10:00:00+05:30",
    rsvps: [
      { name: "Arvind Deshmukh", response: "yes" },
      { name: "Sunita Patil", response: "yes" },
      { name: "Rohan Mehta", response: "maybe" },
      { name: "Kavya Nair", response: "yes" },
      { name: "Divya Reddy", response: "no" },
      { name: "Suresh Iyer", response: "yes" },
      { name: "Ananya Gupta", response: "yes" },
    ],
    cancelled: false,
  },
  {
    id: "meeting-2",
    title: "Block B Water Pipeline Maintenance Meeting",
    agenda:
      "Meeting to discuss the upcoming water pipeline maintenance in Block B. The plumbing team will explain the schedule, water shutdown timings, and alternative arrangements. Affected residents are strongly encouraged to attend.",
    location: "Block B, Ground Floor Lobby",
    organizerName: "Sunita Patil",
    organizerFlat: flatFor("Sunita Patil"),
    audience: { scope: "Blocks", blocks: ["B"] },
    scheduledAt: "2026-09-08T10:00:00+05:30",
    postedAt: "2026-08-27T14:00:00+05:30",
    rsvps: [
      { name: "Sunita Patil", response: "yes" },
      { name: "Mohammed Farhan", response: "yes" },
      { name: "Ananya Gupta", response: "no" },
      { name: "Divya Reddy", response: "maybe" },
      { name: "Arvind Deshmukh", response: "maybe" },
    ],
    cancelled: false,
  },
  {
    id: "meeting-3",
    title: "Monthly Society Committee Meeting – August",
    agenda:
      "Monthly review of complaints, finances, amenities bookings, and maintenance logs. Committee members will present updates and take questions from residents. Minutes will be published within 24 hours.",
    location: "Online – https://meet.example.com/committee-aug",
    organizerName: "Arvind Deshmukh",
    organizerFlat: flatFor("Arvind Deshmukh"),
    audience: { scope: "All" },
    scheduledAt: "2026-08-20T19:00:00+05:30",
    postedAt: "2026-08-12T09:00:00+05:30",
    rsvps: [
      { name: "Arvind Deshmukh", response: "yes" },
      { name: "Vikram Singh Rathore", response: "yes" },
      { name: "Sunita Patil", response: "yes" },
      { name: "Suresh Iyer", response: "yes" },
      { name: "Pooja Banerjee", response: "no" },
      { name: "Harish Krishnan", response: "maybe" },
      { name: "Kavya Nair", response: "yes" },
      { name: "Ananya Gupta", response: "yes" },
    ],
    minutes: [
      {
        name: "Minutes-Aug-Committee.pdf",
        url: "/mock/minutes-aug.pdf",
        type: "pdf" as const,
        size: "1.2 MB",
      },
    ],
    cancelled: false,
  },
  {
    id: "meeting-4",
    title: "Terrace Garden Planning – Volunteers Meet",
    agenda:
      "Planning session for the terrace garden in Block A. We will discuss layout, plant selection, budget, and volunteer responsibilities. If you signed up during the garden clean-up drive, please attend.",
    location: "Terrace, Block A",
    organizerName: "Ananya Gupta",
    organizerFlat: flatFor("Ananya Gupta"),
    audience: { scope: "Blocks", blocks: ["A"] },
    scheduledAt: "2026-09-15T07:30:00+05:30",
    postedAt: "2026-08-29T09:00:00+05:30",
    rsvps: [
      { name: "Ananya Gupta", response: "yes" },
      { name: "Suresh Iyer", response: "yes" },
      { name: "Rohan Mehta", response: "yes" },
      { name: "Pooja Banerjee", response: "maybe" },
    ],
    cancelled: false,
  },
  {
    id: "meeting-5",
    title: "Security System Demo – Cancelled",
    agenda:
      "Demo of the proposed CCTV and access control system for the parking lot. The vendor will present live footage quality and mobile app features. This meeting was intended to help residents decide before the poll closes.",
    location: "Clubhouse",
    organizerName: "Vikram Singh Rathore",
    organizerFlat: flatFor("Vikram Singh Rathore"),
    audience: { scope: "All" },
    scheduledAt: "2026-09-12T11:00:00+05:30",
    postedAt: "2026-08-26T10:00:00+05:30",
    rsvps: [
      { name: "Arvind Deshmukh", response: "yes" },
      { name: "Divya Reddy", response: "yes" },
    ],
    cancelled: true,
  },
  {
    id: "meeting-6",
    title: "Parking Allotment Review – Affected Flats",
    agenda:
      "Review meeting for the revised parking allotment affecting flats A-301, A-502, and B-204. We will walk through the new slot map and address concerns before the allotment goes live on Sep 1.",
    location: "Estate Office",
    organizerName: "Mohammed Farhan",
    organizerFlat: flatFor("Mohammed Farhan"),
    audience: { scope: "Flats", flats: ["A-301", "A-502", "B-204"] },
    scheduledAt: "2026-08-25T16:00:00+05:30",
    postedAt: "2026-08-22T11:00:00+05:30",
    rsvps: [
      { name: "Arvind Deshmukh", response: "yes" },
      { name: "Rohan Mehta", response: "yes" },
      { name: "Sunita Patil", response: "no" },
    ],
    minutes: [
      {
        name: "Parking-Review-Minutes.pdf",
        url: "/mock/parking-review-minutes.pdf",
        type: "pdf" as const,
        size: "890 KB",
      },
    ],
    cancelled: false,
  },
  {
    id: "meeting-7",
    title: "Yoga Classes Feedback Meeting",
    agenda:
      "Gather feedback on the proposed yoga class timings (6 AM vs 7 AM vs evening). The poll closed with a narrow preference for 7 AM, but we want to hear from those who couldn't vote. Please share your availability.",
    location: "Clubhouse, Yoga Room",
    organizerName: "Pooja Banerjee",
    organizerFlat: flatFor("Pooja Banerjee"),
    audience: { scope: "All" },
    scheduledAt: "2026-09-06T06:30:00+05:30",
    postedAt: "2026-08-30T09:00:00+05:30",
    rsvps: [
      { name: "Kavya Nair", response: "yes" },
      { name: "Pooja Banerjee", response: "yes" },
      { name: "Harish Krishnan", response: "maybe" },
      { name: "Neha Kulkarni", response: "yes" },
      { name: "Ananya Gupta", response: "no" },
    ],
    cancelled: false,
  },
  {
    id: "meeting-8",
    title: "Diwali Preparation Core Team Meeting",
    agenda:
      "Core team meeting to finalize Diwali decoration, potluck coordination, and cultural program. Only core volunteers need to attend, but all are welcome to observe. Agenda includes budget and volunteer assignments.",
    location: "Clubhouse",
    organizerName: "Divya Reddy",
    organizerFlat: flatFor("Divya Reddy"),
    audience: { scope: "All" },
    scheduledAt: "2026-08-15T18:30:00+05:30",
    postedAt: "2026-08-10T15:00:00+05:30",
    rsvps: [
      { name: "Divya Reddy", response: "yes" },
      { name: "Ananya Gupta", response: "yes" },
      { name: "Suresh Iyer", response: "yes" },
      { name: "Rohan Mehta", response: "no" },
      { name: "Kavya Nair", response: "maybe" },
    ],
    cancelled: false,
  },
];

export function getMeetingById(id: string) {
  return meetings.find((m) => m.id === id) ?? null;
}
