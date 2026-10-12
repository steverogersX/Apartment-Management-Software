import { z } from "zod";

export type Nomination = {
  id: string;
  flatId: string;
  memberName: string;
  nomineeName: string;
  nomineeRelation: string;
  nomineeAddress: string;
  dateOfNomination: string;
  witnessName: string | null;
};

export const addNominationSchema = z.object({
  flatId: z.string().min(1, "Flat is required"),
  memberName: z.string().min(2, "Member name is required"),
  nomineeName: z.string().min(2, "Nominee name is required"),
  nomineeRelation: z.string().min(2, "Relation is required"),
  nomineeAddress: z.string().min(5, "Nominee address is required"),
  dateOfNomination: z.string().min(1, "Date of nomination is required"),
  witnessName: z.string().optional(),
});

export type AddNominationInput = z.infer<typeof addNominationSchema>;

export const nominations: Nomination[] = [
  {
    id: "nom-1",
    flatId: "flat-a301",
    memberName: "Arvind Deshmukh",
    nomineeName: "Meena Deshmukh",
    nomineeRelation: "Spouse",
    nomineeAddress: "Flat 301, Tower A, Green Valley Residency, Vizag",
    dateOfNomination: "2022-04-10T00:00:00+05:30",
    witnessName: "Suresh Iyer",
  },
  {
    id: "nom-2",
    flatId: "flat-b204",
    memberName: "Sunita Patil",
    nomineeName: "Rahul Patil",
    nomineeRelation: "Son",
    nomineeAddress: "Flat 204, Tower B, Green Valley Residency, Vizag",
    dateOfNomination: "2022-05-22T00:00:00+05:30",
    witnessName: "Vikram Singh Rathore",
  },
  {
    id: "nom-3",
    flatId: "flat-a502",
    memberName: "Sanjay Mehta",
    nomineeName: "Rohan Mehta",
    nomineeRelation: "Son",
    nomineeAddress: "Flat 502, Tower A, Green Valley Residency, Vizag",
    dateOfNomination: "2023-01-15T00:00:00+05:30",
    witnessName: null,
  },
  {
    id: "nom-4",
    flatId: "flat-b405",
    memberName: "Mohammed Farhan",
    nomineeName: "Ayesha Farhan",
    nomineeRelation: "Spouse",
    nomineeAddress: "Flat 405, Tower B, Green Valley Residency, Vizag",
    dateOfNomination: "2022-08-30T00:00:00+05:30",
    witnessName: "Arvind Deshmukh",
  },
  {
    id: "nom-5",
    flatId: "flat-a601",
    memberName: "Vikram Singh Rathore",
    nomineeName: "Aditya Rathore",
    nomineeRelation: "Son",
    nomineeAddress: "Flat 601, Tower A, Green Valley Residency, Vizag",
    dateOfNomination: "2023-06-11T00:00:00+05:30",
    witnessName: "Suresh Iyer",
  },
  {
    id: "nom-6",
    flatId: "flat-c307",
    memberName: "Suresh Iyer",
    nomineeName: "Lakshmi Iyer",
    nomineeRelation: "Spouse",
    nomineeAddress: "Flat 307, Tower C, Green Valley Residency, Vizag",
    dateOfNomination: "2022-04-10T00:00:00+05:30",
    witnessName: null,
  },
  {
    id: "nom-7",
    flatId: "flat-b201",
    memberName: "Divya Reddy",
    nomineeName: "Kiran Reddy",
    nomineeRelation: "Brother",
    nomineeAddress: "Flat 201, Tower B, Green Valley Residency, Vizag",
    dateOfNomination: "2023-09-05T00:00:00+05:30",
    witnessName: "Sunita Patil",
  },
  {
    id: "nom-8",
    flatId: "flat-c506",
    memberName: "Harish Krishnan",
    nomineeName: "Lakshmi Krishnan",
    nomineeRelation: "Mother",
    nomineeAddress: "Flat 506, Tower C, Green Valley Residency, Vizag",
    dateOfNomination: "2022-11-19T00:00:00+05:30",
    witnessName: "Arvind Deshmukh",
  },
];
