import { Router } from 'express';
import { validate } from '@/middlewares/validate';
import { authenticate } from '@/middlewares/authenticate';
import { requirePermission } from '@/middlewares/requirePermission';
import { Permission } from '@shared/index';
import { createUserSchema, editUserSchema } from './user.schema';
import { createUser, editUser } from './user.controller';

export const userRouter = Router();

userRouter.post(
  '/:societyId/createUser',
  authenticate,
  requirePermission(Permission.ResidentsAdd),
  validate(createUserSchema),
  createUser,
);
userRouter.put(
  '/:societyId/editUser/:userId',
  authenticate,
  requirePermission(Permission.ResidentsUpdate),
  validate(editUserSchema),
  editUser,
);
