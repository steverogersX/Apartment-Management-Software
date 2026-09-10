import { z } from "zod";

export type ShareCertificate = {
  id: string;
  flatId: string;
  certificateNumber: string;
  shareNumbers: string;
  numberOfShares: number;
  faceValue: number;
  issueDate: string;
  holderName: string;
};

export const addShareCertificateSchema = z.object({
  flatId: z.string().min(1, "Flat is required"),
  certificateNumber: z.string().min(2, "Certificate number is required"),
  shareNumbers: z.string().min(1, "Share numbers are required"),
  numberOfShares: z.coerce.number().int().min(1, "Must issue at least 1 share"),
  faceValue: z.coerce.number().min(1, "Face value must be at least ₹1"),
  issueDate: z.string().min(1, "Issue date is required"),
  holderName: z.string().min(2, "Holder name is required"),
});

export type AddShareCertificateInput = z.infer<typeof addShareCertificateSchema>;

export const shareCertificates: ShareCertificate[] = [
  {
    id: "sc-1",
    flatId: "flat-a301",
    certificateNumber: "SC-001",
    shareNumbers: "1-5",
    numberOfShares: 5,
    faceValue: 50,
    issueDate: "2021-06-15T00:00:00+05:30",
    holderName: "Arvind Deshmukh",
  },
  {
    id: "sc-2",
    flatId: "flat-b204",
    certificateNumber: "SC-002",
    shareNumbers: "6-10",
    numberOfShares: 5,
    faceValue: 50,
    issueDate: "2021-06-15T00:00:00+05:30",
    holderName: "Sunita Patil",
  },
  {
    id: "sc-3",
    flatId: "flat-a502",
    certificateNumber: "SC-003",
    shareNumbers: "11-15",
    numberOfShares: 5,
    faceValue: 50,
    issueDate: "2021-06-15T00:00:00+05:30",
    holderName: "Sanjay Mehta",
  },
  {
    id: "sc-4",
    flatId: "flat-c103",
    certificateNumber: "SC-004",
    shareNumbers: "16-20",
    numberOfShares: 5,
    faceValue: 50,
    issueDate: "2021-07-02T00:00:00+05:30",
    holderName: "Mohan Nair",
  },
  {
    id: "sc-5",
    flatId: "flat-b405",
    certificateNumber: "SC-005",
    shareNumbers: "21-25",
    numberOfShares: 5,
    faceValue: 50,
    issueDate: "2021-06-15T00:00:00+05:30",
    holderName: "Mohammed Farhan",
  },
  {
    id: "sc-6",
    flatId: "flat-c208",
    certificateNumber: "SC-006",
    shareNumbers: "26-30",
    numberOfShares: 5,
    faceValue: 50,
    issueDate: "2021-07-02T00:00:00+05:30",
    holderName: "Neha Kulkarni",
  },
  {
    id: "sc-7",
    flatId: "flat-a601",
    certificateNumber: "SC-007",
    shareNumbers: "31-35",
    numberOfShares: 5,
    faceValue: 50,
    issueDate: "2022-01-20T00:00:00+05:30",
    holderName: "Vikram Singh Rathore",
  },
  {
    id: "sc-8",
    flatId: "flat-b110",
    certificateNumber: "SC-008",
    shareNumbers: "36-40",
    numberOfShares: 5,
    faceValue: 50,
    issueDate: "2022-01-20T00:00:00+05:30",
    holderName: "Rajesh Gupta",
  },
  {
    id: "sc-9",
    flatId: "flat-c307",
    certificateNumber: "SC-009",
    shareNumbers: "41-45",
    numberOfShares: 5,
    faceValue: 50,
    issueDate: "2021-06-15T00:00:00+05:30",
    holderName: "Suresh Iyer",
  },
  {
    id: "sc-10",
    flatId: "flat-a402",
    certificateNumber: "SC-010",
    shareNumbers: "46-50",
    numberOfShares: 5,
    faceValue: 50,
    issueDate: "2022-03-11T00:00:00+05:30",
    holderName: "Anil Banerjee",
  },
  {
    id: "sc-11",
    flatId: "flat-c506",
    certificateNumber: "SC-011",
    shareNumbers: "51-55",
    numberOfShares: 5,
    faceValue: 50,
    issueDate: "2021-07-02T00:00:00+05:30",
    holderName: "Harish Krishnan",
  },
  {
    id: "sc-12",
    flatId: "flat-b201",
    certificateNumber: "SC-012",
    shareNumbers: "56-60",
    numberOfShares: 5,
    faceValue: 50,
    issueDate: "2022-01-20T00:00:00+05:30",
    holderName: "Divya Reddy",
  },
  {
    id: "sc-13",
    flatId: "flat-a202",
    certificateNumber: "SC-013",
    shareNumbers: "61-65",
    numberOfShares: 5,
    faceValue: 50,
    issueDate: "2022-06-30T00:00:00+05:30",
    holderName: "Kiran Rao",
  },
  {
    id: "sc-14",
    flatId: "flat-b305",
    certificateNumber: "SC-014",
    shareNumbers: "66-70",
    numberOfShares: 5,
    faceValue: 50,
    issueDate: "2022-06-30T00:00:00+05:30",
    holderName: "Farah Khan",
  },
  {
    id: "sc-15",
    flatId: "flat-c410",
    certificateNumber: "SC-015",
    shareNumbers: "71-75",
    numberOfShares: 5,
    faceValue: 50,
    issueDate: "2023-02-14T00:00:00+05:30",
    holderName: "Vijay Menon",
  },
];
