import { residents } from "./residentsMockData";

export type CommitteePosition =
  "President" | "Secretary" | "Treasurer" | "Joint Secretary" | "Committee Member";

export type CommitteeMember = {
  id: string;
  name: string;
  position: CommitteePosition;
  phone: string;
  email: string;
  residentId: string | null;
  termStart: string;
  termEnd: string;
};

export const POSITIONS: CommitteePosition[] = [
  "President",
  "Secretary",
  "Treasurer",
  "Joint Secretary",
  "Committee Member",
];

function residentById(id: string) {
  const r = residents.find((x) => x.id === id);
  if (!r) throw new Error(`Resident ${id} not found`);
  return r;
}

export const committeeMembers: CommitteeMember[] = [
  {
    id: "cm-1",
    name: residentById("7").name,
    position: "President",
    phone: residentById("7").phone,
    email: residentById("7").email,
    residentId: "7",
    termStart: "2024-04-01T00:00:00+05:30",
    termEnd: "2027-03-31T00:00:00+05:30",
  },
  {
    id: "cm-2",
    name: residentById("2").name,
    position: "Secretary",
    phone: residentById("2").phone,
    email: residentById("2").email,
    residentId: "2",
    termStart: "2024-04-01T00:00:00+05:30",
    termEnd: "2027-03-31T00:00:00+05:30",
  },
  {
    id: "cm-3",
    name: residentById("9").name,
    position: "Treasurer",
    phone: residentById("9").phone,
    email: residentById("9").email,
    residentId: "9",
    termStart: "2024-04-01T00:00:00+05:30",
    termEnd: "2027-03-31T00:00:00+05:30",
  },
  {
    id: "cm-4",
    name: residentById("12").name,
    position: "Joint Secretary",
    phone: residentById("12").phone,
    email: residentById("12").email,
    residentId: "12",
    termStart: "2024-04-01T00:00:00+05:30",
    termEnd: "2027-03-31T00:00:00+05:30",
  },
  {
    id: "cm-5",
    name: residentById("1").name,
    position: "Committee Member",
    phone: residentById("1").phone,
    email: residentById("1").email,
    residentId: "1",
    termStart: "2024-04-01T00:00:00+05:30",
    termEnd: "2027-03-31T00:00:00+05:30",
  },
  {
    id: "cm-6",
    name: residentById("8").name,
    position: "Committee Member",
    phone: residentById("8").phone,
    email: residentById("8").email,
    residentId: "8",
    termStart: "2024-04-01T00:00:00+05:30",
    termEnd: "2027-03-31T00:00:00+05:30",
  },
];
