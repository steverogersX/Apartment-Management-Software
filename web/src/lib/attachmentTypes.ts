import { z } from "zod";

export type Attachment = {
  name: string;
  url: string;
  type: "pdf" | "image" | "doc" | "sheet" | "other";
  size: string;
};

export const attachmentSchema = z.object({
  name: z.string(),
  url: z.string(),
  type: z.enum(["pdf", "image", "doc", "sheet", "other"]),
  size: z.string(),
});
