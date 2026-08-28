import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { StatusCodes } from 'http-status-codes';
import { fromZodError } from 'zod-validation-error';
import { ApiError } from '@/utils/ApiError';
import { sendError } from '@/utils/ApiResponse';
import { logger } from '@/utils/logger';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  let statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR;
  let message = 'Internal Server Error';
  let details: unknown;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
  } else if (err instanceof ZodError) {
    statusCode = StatusCodes.BAD_REQUEST;
    message = fromZodError(err).toString();
    details = err.flatten().fieldErrors;
  } else if (err instanceof Error) {
    message = err.message;
  }

  if (statusCode >= StatusCodes.INTERNAL_SERVER_ERROR) {
    logger.error({ err }, 'Unhandled error');
  }

  sendError(res, message, {
    statusCode,
    details,
  });
}
