import { z } from 'zod';
import { createUserBodySchema, editUserBodySchema } from '@shared/index';

export const createUserSchema = z.object({
  params: z.object({
    societyId: z.string().uuid('Invalid society ID'),
  }),
  body: createUserBodySchema,
});

export const editUserSchema = z.object({
  params: z.object({
    societyId: z.string().uuid('Invalid society ID'),
    userId: z.string().uuid('Invalid user ID'),
  }),
  body: editUserBodySchema,
});
