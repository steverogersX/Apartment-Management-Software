import { Router } from 'express';
import { validate } from '@/middlewares/validate';
import { authenticate } from '@/middlewares/authenticate';
import { requireSuperAdmin } from '@/middlewares/requireSuperAdmin';
import { requirePermission } from '@/middlewares/requirePermission';
import { Permission } from '@shared/index';
import {
  createSocietySchema,
  societyParamSchema,
  assignMemberSchema,
  removeMemberSchema,
} from './society.schema';
import {
  createSociety,
  getSocieties,
  getSociety,
  getMembers,
  assignMember,
  removeMember,
} from './society.controller';

export const societyRouter = Router();

// Platform-level — software vendor operator only. Super admin creates a society and steps back.
societyRouter.post(
  '/createSociety',
  authenticate,
  requireSuperAdmin,
  validate(createSocietySchema),
  createSociety,
);
societyRouter.get('/getSocieties', authenticate, requireSuperAdmin, getSocieties);

// Society-internal — managed by the society's own committee via RBAC permissions.
// Super admin is intentionally excluded: they must not access individual society data.
societyRouter.get(
  '/:societyId/getSociety',
  authenticate,
  requirePermission(Permission.SocietySettingsView),
  validate(societyParamSchema),
  getSociety,
);
societyRouter.get(
  '/:societyId/getMembers',
  authenticate,
  requirePermission(Permission.ResidentsView),
  validate(societyParamSchema),
  getMembers,
);
societyRouter.post(
  '/:societyId/assignMember',
  authenticate,
  requirePermission(Permission.RolesAssign),
  validate(assignMemberSchema),
  assignMember,
);
societyRouter.delete(
  '/:societyId/removeMember/:userId',
  authenticate,
  requirePermission(Permission.RolesRevoke),
  validate(removeMemberSchema),
  removeMember,
);
