import type { RequestContext } from '@/module/auth/auth.types';

declare global {
  namespace Express {
    interface Request {
      context?: RequestContext;
    }
  }
}
