import { Router } from 'express';
import { validate } from '@/middlewares/validate';
import { authenticate } from '@/middlewares/authenticate';
import { requirePermission } from '@/middlewares/requirePermission';
import { Permission } from '@shared/index';
import {
  roleParamSchema,
  roleIdParamSchema,
  createRoleSchema,
  updateRoleSchema,
} from './role.schema';
import { listRoles, getRole, createRole, updateRole, deleteRole } from './role.controller';

export const roleRouter = Router();

roleRouter.get(
  '/:societyId/getRoles',
  authenticate,
  requirePermission(Permission.RolesView),
  validate(roleParamSchema),
  listRoles,
);
roleRouter.get(
  '/:societyId/getRole/:roleId',
  authenticate,
  requirePermission(Permission.RolesView),
  validate(roleIdParamSchema),
  getRole,
);
roleRouter.post(
  '/:societyId/createRole',
  authenticate,
  requirePermission(Permission.RolesCreate),
  validate(createRoleSchema),
  createRole,
);
roleRouter.put(
  '/:societyId/editRole/:roleId',
  authenticate,
  requirePermission(Permission.RolesUpdate),
  validate(updateRoleSchema),
  updateRole,
);
roleRouter.delete(
  '/:societyId/deleteRole/:roleId',
  authenticate,
  requirePermission(Permission.RolesDelete),
  validate(roleIdParamSchema),
  deleteRole,
);
