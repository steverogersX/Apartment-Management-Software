import { z } from "zod";

import { residents } from "./residentsMockData";
import { attachmentSchema, type Attachment } from "./attachmentTypes";

export type DocumentCategory =
  "Legal" | "Financial" | "Minutes" | "Insurance" | "Bylaws" | "General";

export const DOCUMENT_CATEGORIES: DocumentCategory[] = [
  "Legal",
  "Financial",
  "Minutes",
  "Insurance",
  "Bylaws",
  "General",
];

export type SocietyDocument = {
  id: string;
  title: string;
  description?: string;
  category: DocumentCategory;
  file: Attachment;
  uploadedByName: string;
  uploadedByFlat: string;
  uploadedAt: string;
  audience:
    { scope: "All" } | { scope: "Blocks"; blocks: string[] } | { scope: "Flats"; flats: string[] };
};

function flatFor(name: string): string {
  const r = residents.find((x) => x.name === name);
  return r ? `${r.tower}-${r.flatNumber}` : "A-301";
}

export const documentUploadSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  category: z.enum(["Legal", "Financial", "Minutes", "Insurance", "Bylaws", "General"]),
  audienceScope: z.enum(["All", "Blocks", "Flats"]),
  audienceValue: z.array(z.string()).optional(),
  file: attachmentSchema,
});

export type DocumentUploadInput = z.infer<typeof documentUploadSchema>;

export const societyDocuments: SocietyDocument[] = [
  {
    id: "doc-1",
    title: "Society Bylaws 2024 – Approved Version",
    description:
      "Final approved bylaws including recent amendments on subletting and renovation guidelines.",
    category: "Bylaws",
    file: { name: "Bylaws-2024.pdf", url: "/mock/bylaws-2024.pdf", type: "pdf", size: "2.4 MB" },
    uploadedByName: "Sunita Patil",
    uploadedByFlat: flatFor("Sunita Patil"),
    uploadedAt: "2026-08-10T10:00:00+05:30",
    audience: { scope: "All" },
  },
  {
    id: "doc-2",
    title: "Annual Budget 2025-26",
    description: "Detailed income/expenditure budget for FY 2025-26, approved in AGM.",
    category: "Financial",
    file: {
      name: "Budget-2025-26.xlsx",
      url: "/mock/budget-2025.xlsx",
      type: "sheet",
      size: "890 KB",
    },
    uploadedByName: "Suresh Iyer",
    uploadedByFlat: flatFor("Suresh Iyer"),
    uploadedAt: "2026-08-12T11:30:00+05:30",
    audience: { scope: "All" },
  },
  {
    id: "doc-3",
    title: "AGM Minutes – July 2024",
    category: "Minutes",
    file: {
      name: "AGM-Minutes-July-2024.pdf",
      url: "/mock/agm-minutes-july.pdf",
      type: "pdf",
      size: "1.1 MB",
    },
    uploadedByName: "Arvind Deshmukh",
    uploadedByFlat: flatFor("Arvind Deshmukh"),
    uploadedAt: "2026-07-15T16:00:00+05:30",
    audience: { scope: "All" },
  },
  {
    id: "doc-4",
    title: "Building Insurance Policy – ICICI Lombard 2024-25",
    description: "Comprehensive building and common area insurance policy document.",
    category: "Insurance",
    file: {
      name: "Insurance-Policy-2024.pdf",
      url: "/mock/insurance-policy.pdf",
      type: "pdf",
      size: "3.2 MB",
    },
    uploadedByName: "Vikram Singh Rathore",
    uploadedByFlat: flatFor("Vikram Singh Rathore"),
    uploadedAt: "2026-08-01T09:15:00+05:30",
    audience: { scope: "All" },
  },
  {
    id: "doc-5",
    title: "Block C Common Area Insurance – Addendum",
    category: "Insurance",
    file: {
      name: "Block-C-Insurance.pdf",
      url: "/mock/block-c-insurance.pdf",
      type: "pdf",
      size: "780 KB",
    },
    uploadedByName: "Harish Krishnan",
    uploadedByFlat: flatFor("Harish Krishnan"),
    uploadedAt: "2026-08-18T14:20:00+05:30",
    audience: { scope: "Blocks", blocks: ["C"] },
  },
  {
    id: "doc-6",
    title: "Maintenance Due Receipts – June 2024",
    category: "Financial",
    file: {
      name: "Receipts-June-2024.xlsx",
      url: "/mock/receipts-june.xlsx",
      type: "sheet",
      size: "420 KB",
    },
    uploadedByName: "Mohammed Farhan",
    uploadedByFlat: flatFor("Mohammed Farhan"),
    uploadedAt: "2026-07-02T10:30:00+05:30",
    audience: { scope: "All" },
  },
  {
    id: "doc-7",
    title: "Fire Safety Compliance Certificate",
    description: "Issued by local fire authority, valid till Dec 2025.",
    category: "Legal",
    file: {
      name: "Fire-Safety-Certificate.pdf",
      url: "/mock/fire-safety.pdf",
      type: "pdf",
      size: "1.8 MB",
    },
    uploadedByName: "Suresh Iyer",
    uploadedByFlat: flatFor("Suresh Iyer"),
    uploadedAt: "2026-06-20T11:00:00+05:30",
    audience: { scope: "All" },
  },
  {
    id: "doc-8",
    title: "Swimming Pool Maintenance Log – Q2 2024",
    category: "General",
    file: {
      name: "Pool-Maintenance-Log.docx",
      url: "/mock/pool-log.docx",
      type: "doc",
      size: "540 KB",
    },
    uploadedByName: "Rohan Mehta",
    uploadedByFlat: flatFor("Rohan Mehta"),
    uploadedAt: "2026-07-10T09:45:00+05:30",
    audience: { scope: "All" },
  },
  {
    id: "doc-9",
    title: "Society Registration Certificate",
    category: "Legal",
    file: {
      name: "Registration-Certificate.pdf",
      url: "/mock/registration.pdf",
      type: "pdf",
      size: "980 KB",
    },
    uploadedByName: "Arvind Deshmukh",
    uploadedByFlat: flatFor("Arvind Deshmukh"),
    uploadedAt: "2026-05-15T10:15:00+05:30",
    audience: { scope: "All" },
  },
  {
    id: "doc-10",
    title: "Water Tank Cleaning Photos – Before/After",
    description: "Photos from the annual tank cleaning on June 20.",
    category: "General",
    file: {
      name: "Water-Tank-Cleaning.jpg",
      url: "https://picsum.photos/seed/doc-water-tank/800/500",
      type: "image",
      size: "2.1 MB",
    },
    uploadedByName: "Sunita Patil",
    uploadedByFlat: flatFor("Sunita Patil"),
    uploadedAt: "2026-06-21T08:30:00+05:30",
    audience: { scope: "All" },
  },
  {
    id: "doc-11",
    title: "Flat A-301 Sale Deed – Reference Copy",
    category: "General",
    file: {
      name: "Sale-Deed-A301.pdf",
      url: "/mock/sale-deed-a301.pdf",
      type: "pdf",
      size: "1.5 MB",
    },
    uploadedByName: "Kavya Nair",
    uploadedByFlat: flatFor("Kavya Nair"),
    uploadedAt: "2026-08-22T13:00:00+05:30",
    audience: { scope: "Flats", flats: ["A-301"] },
  },
  {
    id: "doc-12",
    title: "Election Nomination Form 2024",
    description: "Blank nomination form for society committee elections.",
    category: "Bylaws",
    file: {
      name: "Nomination-Form-2024.docx",
      url: "/mock/nomination-form.docx",
      type: "doc",
      size: "320 KB",
    },
    uploadedByName: "Pooja Banerjee",
    uploadedByFlat: flatFor("Pooja Banerjee"),
    uploadedAt: "2026-08-05T11:20:00+05:30",
    audience: { scope: "All" },
  },
];

export function getDocumentById(id: string) {
  return societyDocuments.find((d) => d.id === id) ?? null;
}
