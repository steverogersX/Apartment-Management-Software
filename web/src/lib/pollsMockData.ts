import { z } from "zod";

import { residents } from "./residentsMockData";

export type PollOption = {
  id: string;
  label: string;
  votes: string[];
};

export type PollAudience =
  { scope: "All" } | { scope: "Blocks"; blocks: string[] } | { scope: "Flats"; flats: string[] };

export type OpinionPoll = {
  id: string;
  question: string;
  description?: string;
  options: PollOption[];
  pollType: "single" | "multiple";
  audience: PollAudience;
  postedBy: string;
  postedAt: string;
  closesAt: string;
  authorName: string;
  authorFlat: string;
};

function flatFor(name: string): string {
  const r = residents.find((x) => x.name === name);
  return r ? `${r.tower}-${r.flatNumber}` : "A-301";
}

export function isPollClosed(poll: OpinionPoll): boolean {
  return new Date(poll.closesAt).getTime() < Date.now();
}

export const pollFormSchema = z.object({
  question: z.string().min(10, "Question must be at least 10 characters"),
  description: z.string().optional(),
  options: z
    .array(z.string().min(1, "Option cannot be empty"))
    .min(2, "At least 2 options required")
    .max(6, "At most 6 options allowed"),
  pollType: z.enum(["single", "multiple"]),
  audienceScope: z.enum(["All", "Blocks", "Flats"]),
  audienceValue: z.array(z.string()).optional(),
  closesAt: z.string().min(1, "Closing time is required"),
});

export type PollFormInput = z.infer<typeof pollFormSchema>;

export const opinionPolls: OpinionPoll[] = [
  {
    id: "poll-1",
    question: "Should we install CCTV in the parking lot?",
    description:
      "Following recent incidents, the committee proposes installing 4 CCTV cameras in the B and C parking areas (₹45k, 30-day backup). Please vote to help decide at the next AGM.",
    options: [
      {
        id: "poll-1-opt-1",
        label: "Yes, install as proposed",
        votes: [
          "Arvind Deshmukh",
          "Vikram Singh Rathore",
          "Suresh Iyer",
          "Pooja Banerjee",
          "Ananya Gupta",
          "Divya Reddy",
          "Mohammed Farhan",
        ],
      },
      { id: "poll-1-opt-2", label: "No, not needed", votes: ["Rohan Mehta", "Sunita Patil"] },
      {
        id: "poll-1-opt-3",
        label: "Need more information",
        votes: ["Kavya Nair", "Harish Krishnan"],
      },
    ],
    pollType: "single",
    audience: { scope: "All" },
    postedBy: "Vikram Singh Rathore · President",
    postedAt: "2026-08-28T10:00:00+05:30",
    closesAt: "2026-09-10T18:00:00+05:30",
    authorName: "Vikram Singh Rathore",
    authorFlat: flatFor("Vikram Singh Rathore"),
  },
  {
    id: "poll-2",
    question: "Which day works best for the community clean-up drive?",
    description:
      "We need to pick a weekend day for the garden clean-up. The estate team is available both days.",
    options: [
      {
        id: "poll-2-opt-1",
        label: "Saturday 7 AM",
        votes: ["Ananya Gupta", "Suresh Iyer", "Divya Reddy", "Kavya Nair"],
      },
      {
        id: "poll-2-opt-2",
        label: "Sunday 7 AM",
        votes: ["Pooja Banerjee", "Rohan Mehta", "Arvind Deshmukh"],
      },
      { id: "poll-2-opt-3", label: "Either is fine", votes: ["Mohammed Farhan", "Sunita Patil"] },
    ],
    pollType: "single",
    audience: { scope: "Blocks", blocks: ["B", "C"] },
    postedBy: "Ananya Gupta · Cultural Lead",
    postedAt: "2026-08-27T09:30:00+05:30",
    closesAt: "2026-09-08T18:00:00+05:30",
    authorName: "Ananya Gupta",
    authorFlat: flatFor("Ananya Gupta"),
  },
  {
    id: "poll-3",
    question: "Which gym equipment should we prioritize for replacement?",
    description: "The gym fund allows one major purchase this quarter. Choose up to two options.",
    options: [
      {
        id: "poll-3-opt-1",
        label: "Cross-trainer",
        votes: [
          "Mohammed Farhan",
          "Sunita Patil",
          "Harish Krishnan",
          "Suresh Iyer",
          "Ananya Gupta",
        ],
      },
      {
        id: "poll-3-opt-2",
        label: "Treadmill belt",
        votes: ["Rohan Mehta", "Arvind Deshmukh", "Divya Reddy"],
      },
      { id: "poll-3-opt-3", label: "Dumbbell set", votes: ["Pooja Banerjee", "Kavya Nair"] },
      { id: "poll-3-opt-4", label: "Rowing machine", votes: ["Vikram Singh Rathore"] },
    ],
    pollType: "multiple",
    audience: { scope: "All" },
    postedBy: "Mohammed Farhan · Estate Manager",
    postedAt: "2026-08-10T10:15:00+05:30",
    closesAt: "2026-08-20T18:00:00+05:30",
    authorName: "Mohammed Farhan",
    authorFlat: flatFor("Mohammed Farhan"),
  },
  {
    id: "poll-4",
    question: "Do you approve the revised parking slot allotment?",
    description:
      "The allotment lottery was held on Aug 25. This poll seeks formal approval from affected flat owners before implementation on Sep 1.",
    options: [
      { id: "poll-4-opt-1", label: "Approve", votes: ["Rohan Mehta"] },
      { id: "poll-4-opt-2", label: "Reject", votes: [] },
      { id: "poll-4-opt-3", label: "Abstain", votes: ["Sunita Patil"] },
    ],
    pollType: "single",
    audience: { scope: "Flats", flats: ["A-301", "A-502", "B-204"] },
    postedBy: "Arvind Deshmukh · Secretary",
    postedAt: "2026-08-26T15:00:00+05:30",
    closesAt: "2026-09-12T18:00:00+05:30",
    authorName: "Arvind Deshmukh",
    authorFlat: flatFor("Arvind Deshmukh"),
  },
  {
    id: "poll-5",
    question: "What should we do with the unused terrace space in Block A?",
    description:
      "The terrace above A-601 has been unused. Committee invites ideas – you may select up to 2.",
    options: [
      {
        id: "poll-5-opt-1",
        label: "Community garden",
        votes: ["Vikram Singh Rathore", "Suresh Iyer", "Ananya Gupta", "Divya Reddy"],
      },
      {
        id: "poll-5-opt-2",
        label: "Solar panels",
        votes: ["Arvind Deshmukh", "Mohammed Farhan", "Harish Krishnan"],
      },
      {
        id: "poll-5-opt-3",
        label: "Children's play area",
        votes: ["Pooja Banerjee", "Kavya Nair", "Sunita Patil"],
      },
      { id: "poll-5-opt-4", label: "Leave as is", votes: ["Rohan Mehta"] },
    ],
    pollType: "multiple",
    audience: { scope: "Blocks", blocks: ["A"] },
    postedBy: "Suresh Iyer · Treasurer",
    postedAt: "2026-08-25T11:30:00+05:30",
    closesAt: "2026-09-15T18:00:00+05:30",
    authorName: "Suresh Iyer",
    authorFlat: flatFor("Suresh Iyer"),
  },
  {
    id: "poll-6",
    question: "How would you rate the recent maintenance work in Block C?",
    options: [
      { id: "poll-6-opt-1", label: "Excellent", votes: ["Harish Krishnan"] },
      { id: "poll-6-opt-2", label: "Good", votes: ["Kavya Nair", "Suresh Iyer", "Neha Kulkarni"] },
      { id: "poll-6-opt-3", label: "Average", votes: ["Divya Reddy", "Mohammed Farhan"] },
      { id: "poll-6-opt-4", label: "Poor", votes: ["Ananya Gupta"] },
    ],
    pollType: "single",
    audience: { scope: "All" },
    postedBy: "Sunita Patil · Secretary",
    postedAt: "2026-07-15T09:00:00+05:30",
    closesAt: "2026-08-25T18:00:00+05:30",
    authorName: "Sunita Patil",
    authorFlat: flatFor("Sunita Patil"),
  },
  {
    id: "poll-7",
    question: "Should we organize a monthly food festival in the society?",
    description:
      "A few residents suggested a monthly food festival on the last Sunday. It would need volunteer cooks and a small budget for stalls. What do you think?",
    options: [
      { id: "poll-7-opt-1", label: "Yes, great idea", votes: [] },
      { id: "poll-7-opt-2", label: "Maybe, need details", votes: [] },
      { id: "poll-7-opt-3", label: "No, not interested", votes: [] },
    ],
    pollType: "single",
    audience: { scope: "All" },
    postedBy: "Divya Reddy · B-201",
    postedAt: "2026-08-29T16:00:00+05:30",
    closesAt: "2026-09-18T18:00:00+05:30",
    authorName: "Divya Reddy",
    authorFlat: flatFor("Divya Reddy"),
  },
  {
    id: "poll-8",
    question: "Preferred time for yoga classes in the clubhouse?",
    description: "We are finalizing slots for weekly yoga. You can pick multiple preferences.",
    options: [
      {
        id: "poll-8-opt-1",
        label: "6 AM – 7 AM",
        votes: ["Kavya Nair", "Pooja Banerjee", "Harish Krishnan", "Neha Kulkarni"],
      },
      {
        id: "poll-8-opt-2",
        label: "7 AM – 8 AM",
        votes: ["Arvind Deshmukh", "Rohan Mehta", "Sunita Patil", "Divya Reddy", "Suresh Iyer"],
      },
      {
        id: "poll-8-opt-3",
        label: "6 PM – 7 PM",
        votes: ["Ananya Gupta", "Mohammed Farhan", "Vikram Singh Rathore"],
      },
    ],
    pollType: "multiple",
    audience: { scope: "All" },
    postedBy: "Pooja Banerjee · A-402",
    postedAt: "2026-08-26T08:30:00+05:30",
    closesAt: "2026-09-09T18:00:00+05:30",
    authorName: "Pooja Banerjee",
    authorFlat: flatFor("Pooja Banerjee"),
  },
];

export function getPollById(id: string) {
  return opinionPolls.find((p) => p.id === id) ?? null;
}
