import { z } from "zod";

import { residents } from "./residentsMockData";

export type Candidate = {
  id: string;
  name: string;
  flat: string;
  statement: string;
  photo?: string;
};

export type Election = {
  id: string;
  title: string;
  description: string;
  seats: number;
  candidates: Candidate[];
  audience:
    { scope: "All" } | { scope: "Blocks"; blocks: string[] } | { scope: "Flats"; flats: string[] };
  votedFlats: string[];
  ballots: Record<string, number>;
  opensAt: string;
  closesAt: string;
  resultsPublished: boolean;
};

function flatFor(name: string): string {
  const r = residents.find((x) => x.name === name);
  return r ? `${r.tower}-${r.flatNumber}` : "A-301";
}

export function isElectionOpen(election: Election): boolean {
  const now = Date.now();
  return (
    !election.resultsPublished &&
    new Date(election.opensAt).getTime() <= now &&
    now < new Date(election.closesAt).getTime()
  );
}

export function isElectionClosed(election: Election): boolean {
  return new Date(election.closesAt).getTime() < Date.now();
}

export function getElectionStatus(election: Election): "open" | "closed" {
  return isElectionClosed(election) ? "closed" : "open";
}

export const electionBallotSchema = z.object({
  candidateIds: z
    .array(z.string())
    .min(1, "Select at least one candidate")
    .max(5, "Too many selections"),
});

export type ElectionBallotInput = z.infer<typeof electionBallotSchema>;

export const electionFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  seats: z.number().min(1, "At least 1 seat required").int().positive(),
  candidates: z
    .array(
      z.object({
        name: z.string().min(1, "Name required"),
        flat: z.string().min(1, "Flat required"),
        statement: z.string().min(10, "Statement must be at least 10 characters"),
        photo: z.string().optional(),
      }),
    )
    .min(2, "At least 2 candidates required"),
  audienceScope: z.enum(["All", "Blocks", "Flats"]),
  audienceValue: z.array(z.string()).optional(),
  opensAt: z.string().min(1, "Opening time is required"),
  closesAt: z.string().min(1, "Closing time is required"),
});

export type ElectionFormInput = z.infer<typeof electionFormSchema>;

export const elections: Election[] = [
  {
    id: "election-1",
    title: "Committee Election 2026",
    description:
      "Election for 2 open seats on the Managing Committee (term 2026-2028). Each flat may cast one ballot selecting up to 2 candidates. Results will remain hidden until the election closes and results are published.",
    seats: 2,
    candidates: [
      {
        id: "cand-1",
        name: "Vikram Singh Rathore",
        flat: flatFor("Vikram Singh Rathore"),
        statement:
          "Current president, focused on security upgrades and transparent budgeting. I will ensure timely maintenance and community engagement.",
        photo: "https://picsum.photos/seed/cand-vikram/200/200",
      },
      {
        id: "cand-2",
        name: "Suresh Iyer",
        flat: flatFor("Suresh Iyer"),
        statement:
          "Treasurer with 3 years of experience, committed to financial discipline and timely audits. Let's keep our finances strong.",
        photo: "https://picsum.photos/seed/cand-suresh/200/200",
      },
      {
        id: "cand-3",
        name: "Ananya Gupta",
        flat: flatFor("Ananya Gupta"),
        statement:
          "Cultural lead passionate about community events and inclusivity. I will make our society more vibrant and connected.",
        photo: "https://picsum.photos/seed/cand-ananya/200/200",
      },
      {
        id: "cand-4",
        name: "Mohammed Farhan",
        flat: flatFor("Mohammed Farhan"),
        statement:
          "Estate manager background, will streamline vendor management and improve common area upkeep.",
        photo: "https://picsum.photos/seed/cand-farhan/200/200",
      },
      {
        id: "cand-5",
        name: "Pooja Banerjee",
        flat: flatFor("Pooja Banerjee"),
        statement:
          "Advocate for sustainable living and green initiatives. I will push for solar and waste management improvements.",
        photo: "https://picsum.photos/seed/cand-pooja/200/200",
      },
    ],
    audience: { scope: "All" },
    // 22 flats have voted so far, not including current user's flat A-301 so they can still vote
    votedFlats: [
      "B-204",
      "A-502",
      "C-103",
      "B-405",
      "C-208",
      "A-601",
      "B-110",
      "C-307",
      "A-402",
      "C-506",
      "B-201",
      "A-303",
      "B-305",
      "C-410",
      "A-202",
      "B-202",
      "C-104",
      "A-101",
      "B-102",
      "C-201",
      "A-201",
      "B-103",
    ],
    // Aggregate tallies only – never mapped to a voter. Sum 34 ≤ 22*2=44, valid for 2-seat election
    ballots: {
      "cand-1": 10,
      "cand-2": 8,
      "cand-3": 9,
      "cand-4": 4,
      "cand-5": 3,
    },
    opensAt: "2026-08-25T09:00:00+05:30",
    closesAt: "2026-09-10T18:00:00+05:30",
    resultsPublished: false,
  },
  {
    id: "election-2",
    title: "Treasurer Election 2025 – Results Published",
    description:
      "Election for the Treasurer position (term 2025-2027). Single seat, 3 candidates contested. Voting was open from July 1 to August 10, 2025. Results are now final and published.",
    seats: 1,
    candidates: [
      {
        id: "cand-2-1",
        name: "Sunita Patil",
        flat: flatFor("Sunita Patil"),
        statement:
          "Secretary with proven administrative skills, committed to transparent communication and timely issue resolution.",
        photo: "https://picsum.photos/seed/cand-sunita/200/200",
      },
      {
        id: "cand-2-2",
        name: "Harish Krishnan",
        flat: flatFor("Harish Krishnan"),
        statement: "Long-time resident, will bring fresh ideas for amenities and resident welfare.",
        photo: "https://picsum.photos/seed/cand-harish/200/200",
      },
      {
        id: "cand-2-3",
        name: "Divya Reddy",
        flat: flatFor("Divya Reddy"),
        statement:
          "Active volunteer in society events, will ensure inclusive decision-making and community bonding.",
        photo: "https://picsum.photos/seed/cand-divya/200/200",
      },
    ],
    audience: { scope: "All" },
    votedFlats: [
      "A-301",
      "B-204",
      "A-502",
      "C-103",
      "B-405",
      "C-208",
      "A-601",
      "B-110",
      "C-307",
      "A-402",
      "C-506",
      "B-201",
      "A-303",
      "B-305",
      "C-410",
      "A-202",
      "B-102",
      "C-104",
      "A-101",
      "B-103",
      "C-201",
      "A-201",
      "B-202",
      "C-302",
      "A-304",
      "B-306",
      "C-408",
      "A-105",
      "B-107",
      "C-109",
      "A-106",
      "B-108",
      "C-110",
      "A-107",
      "B-109",
      "C-111",
      "A-108",
      "C-112",
    ],
    // Single seat – sum equals turnout (38 flats voted, 38 votes total)
    ballots: {
      "cand-2-1": 18,
      "cand-2-2": 11,
      "cand-2-3": 9,
    },
    opensAt: "2026-07-01T09:00:00+05:30",
    closesAt: "2026-08-10T18:00:00+05:30",
    resultsPublished: true,
  },
];

export function getElectionById(id: string) {
  return elections.find((e) => e.id === id) ?? null;
}
