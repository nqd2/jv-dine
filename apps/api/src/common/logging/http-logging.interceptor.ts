import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

const SENSITIVE_KEYS = new Set(
  [
    'password',
    'currentpassword',
    'newpassword',
    'oldpassword',
    'refreshtoken',
    'accesstoken',
    'token',
    'authorization',
    'cookie',
  ].map((k) => k.toLowerCase()),
);

function redact(value: unknown, depth = 0): unknown {
  if (depth > 8) {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => redact(item, depth + 1));
  }
  if (value !== null && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).map(
      ([key, v]) => {
        const keyLower = key.toLowerCase();
        if (SENSITIVE_KEYS.has(keyLower)) {
          return [key, '[REDACTED]'];
        }
        return [key, redact(v, depth + 1)];
      },
    );
    return Object.fromEntries(entries);
  }
  return value;
}

function prettifyJson(value: unknown): string {
  if (value === undefined) {
    return '(undefined)';
  }
  if (value === null) {
    return 'null';
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (
      (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
      (trimmed.startsWith('[') && trimmed.endsWith(']'))
    ) {
      try {
        return JSON.stringify(JSON.parse(trimmed), null, 2);
      } catch {
        return value;
      }
    }
    return value;
  }
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    if (typeof value === 'string') {
      return value;
    }
    if (typeof value === 'number' || typeof value === 'bigint') {
      return `${value}`;
    }
    if (typeof value === 'boolean') {
      return value ? 'true' : 'false';
    }
    return '[Unable to stringify]';
  }
}

function isStreamLike(data: unknown): boolean {
  if (!data || typeof data !== 'object') {
    return false;
  }
  return typeof (data as { pipe?: unknown }).pipe === 'function';
}

/** Full request/response bodies only when `VERBOSE_HTTP_LOGS=1` or `true` (see `.env.example`). */
function verboseHttpLogs(): boolean {
  const v = process.env.VERBOSE_HTTP_LOGS?.trim().toLowerCase();
  return v === '1' || v === 'true' || v === 'yes';
}

function summarizeRequest(req: Request): string {
  const query = req.query;
  const hasQuery =
    query && typeof query === 'object' && Object.keys(query).length > 0;
  const q =
    hasQuery &&
    query !== null &&
    typeof query === 'object' &&
    !Array.isArray(query)
      ? ` ${JSON.stringify(query)}`
      : '';

  const body = req.body as Record<string, unknown> | undefined;
  const hasBody =
    body !== undefined &&
    body !== null &&
    !(
      typeof body === 'object' &&
      !Array.isArray(body) &&
      Object.keys(body).length === 0
    );
  const bodyHint = hasBody ? ' [body]' : '';

  return `${req.method} ${req.originalUrl}${q}${bodyHint}`;
}

function summarizePayload(data: unknown): unknown {
  if (Buffer.isBuffer(data)) {
    return { type: 'Buffer', length: data.length };
  }
  if (data instanceof Uint8Array) {
    return { type: 'Uint8Array', length: data.byteLength };
  }
  if (isStreamLike(data)) {
    return { type: 'Stream', note: 'body not captured' };
  }
  return data;
}

function requestPayload(req: Request): unknown {
  const body: unknown = req.body;
  const hasBody =
    body !== undefined &&
    body !== null &&
    !(
      typeof body === 'object' &&
      !Array.isArray(body) &&
      Object.keys(body).length === 0
    );

  const query: unknown = req.query;
  const hasQuery =
    query && typeof query === 'object' && Object.keys(query).length > 0;

  if (hasBody && hasQuery) {
    return { body, query };
  }
  if (hasBody) {
    return body;
  }
  if (hasQuery) {
    return { query };
  }
  return {};
}

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();
    const { method, originalUrl } = req;

    const verbose = verboseHttpLogs();
    if (verbose) {
      const incoming = prettifyJson(redact(requestPayload(req)));
      this.logger.log(
        `${method} ${originalUrl} — incoming\n${incoming}\n${'─'.repeat(72)}`,
      );
    } else {
      this.logger.log(`→ ${summarizeRequest(req)}`);
    }

    const started = Date.now();

    return next.handle().pipe(
      tap({
        next: (data: unknown) => {
          const ms = Date.now() - started;
          const status = res.statusCode;
          if (verbose) {
            const outgoing = prettifyJson(redact(summarizePayload(data)));
            this.logger.log(
              `${method} ${originalUrl} — ${status} ${ms}ms — outgoing\n${outgoing}\n${'═'.repeat(72)}`,
            );
          } else {
            this.logger.log(`← ${method} ${originalUrl} ${status} ${ms}ms`);
          }
        },
        error: (err: unknown) => {
          const ms = Date.now() - started;
          const message = err instanceof Error ? err.message : String(err);
          this.logger.error(
            `${method} ${originalUrl} — error ${ms}ms — ${message}\n${'═'.repeat(72)}`,
          );
        },
      }),
    );
  }
}
