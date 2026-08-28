import { Router } from 'express';
import { authRouter } from '@/module/auth/auth.routes';
import { societyRouter } from '@/module/society/society.routes';
import { roleRouter } from '@/module/role/role.routes';
import { userRouter } from '@/module/user/user.routes';

const router = Router();

router.use('/auth', authRouter);
router.use('/societies', societyRouter);
router.use('/societies', roleRouter);
router.use('/societies', userRouter);

export { router as apiRoutes };
