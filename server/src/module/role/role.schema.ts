import { z } from 'zod';

const permissionsField = z
  .array(z.string().min(1).max(80))
  .min(1, 'At least one permission is required');

export const roleParamSchema = z.object({
  params: z.object({
    societyId: z.string().uuid('Invalid society ID'),
  }),
});

export const roleIdParamSchema = z.object({
  params: z.object({
    societyId: z.string().uuid('Invalid society ID'),
    roleId: z.string().uuid('Invalid role ID'),
  }),
});

export const createRoleSchema = z.object({
  params: z.object({
    societyId: z.string().uuid('Invalid society ID'),
  }),
  body: z.object({
    name: z.string().min(1).max(80).trim(),
    description: z.string().max(255).trim().optional(),
    permissions: permissionsField,
  }),
});

export const updateRoleSchema = z.object({
  params: z.object({
    societyId: z.string().uuid('Invalid society ID'),
    roleId: z.string().uuid('Invalid role ID'),
  }),
  body: z.object({
    name: z.string().min(1).max(80).trim(),
    description: z.string().max(255).trim().optional(),
    permissions: permissionsField,
  }),
});
