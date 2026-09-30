import { ArgumentsHost, Catch, ExceptionFilter, HttpException, UnprocessableEntityException, ValidationPipe } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import type { Response } from 'express';

export const validation = () => new ValidationPipe({
  transform: true, whitelist: true, forbidNonWhitelisted: true,
  exceptionFactory: (errors) => new UnprocessableEntityException({
    code: 'VALIDATION', message: 'Check the highlighted fields.',
    fieldErrors: Object.fromEntries(errors.map(error => [error.property, Object.values(error.constraints ?? {}).join(' ')])),
  }),
});

@Catch()
export class Errors implements ExceptionFilter {
  catch(error: unknown, host: ArgumentsHost) {
    let status = error instanceof HttpException ? error.getStatus() : 500;
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      status = error.code === 'P2002' ? 409 : error.code === 'P2025' ? 404 : error.code === 'P2003' ? 422 : 500;
    }
    const details = error instanceof HttpException ? error.getResponse() : {};
    const safe = typeof details === 'object' ? details as Record<string, unknown> : {};
    const requestId = randomUUID();
    if (status >= 500) console.error(JSON.stringify({ requestId, code: 'SERVICE_UNAVAILABLE', status,
      databaseCode: error instanceof Prisma.PrismaClientKnownRequestError ? error.code : undefined,
      errorType: error instanceof Error ? error.name : 'unknown',
    }));
    host.switchToHttp().getResponse<Response>().status(status).json({
      code: safe.code ?? `HTTP_${status}`, message: status >= 500 && status !== 503 ? 'Service unavailable. Please retry.' : safe.message ?? 'Request could not be completed.',
      ...(safe.fieldErrors ? { fieldErrors: safe.fieldErrors } : {}), requestId,
    });
  }
}