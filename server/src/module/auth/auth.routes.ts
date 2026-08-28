import { Router } from 'express';
import { validate } from '@/middlewares/validate';
import { authenticate } from '@/middlewares/authenticate';
import { registerSchema, loginSchema } from './auth.schema';
import { register, login, logout, me } from './auth.controller';

export const authRouter = Router();

authRouter.post('/register', validate(registerSchema), register);
authRouter.post('/login', validate(loginSchema), login);
authRouter.post('/logout', authenticate, logout);
authRouter.get('/me', authenticate, me);
