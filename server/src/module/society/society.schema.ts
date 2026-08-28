import { z } from 'zod';

export const createSocietySchema = z.object({
  body: z.object({
    name: z.string().min(1).max(160).trim(),
    adminUserId: z.string().uuid('Invalid user ID'),
  }),
});

export const societyParamSchema = z.object({
  params: z.object({
    societyId: z.string().uuid('Invalid society ID'),
  }),
});

export const assignMemberSchema = z.object({
  params: z.object({
    societyId: z.string().uuid('Invalid society ID'),
  }),
  body: z.object({
    userId: z.string().uuid('Invalid user ID'),
    roleId: z.string().uuid('Invalid role ID'),
  }),
});

export const removeMemberSchema = z.object({
  params: z.object({
    societyId: z.string().uuid('Invalid society ID'),
    userId: z.string().uuid('Invalid user ID'),
  }),
});
