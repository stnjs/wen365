import type { H3Event } from "h3";
import { DomainError, type DomainErrorKind } from "./domainError";
import { logError, logWarn } from "@server/utils/logger";

/**
 * Maps a DomainError kind to its HTTP status code.
 */
const STATUS_BY_KIND: Record<DomainErrorKind, number> = {
  notFound: 404,
  unauthorized: 401,
  forbidden: 403,
  validation: 400,
  preconditionFailed: 400,
  rateLimited: 503,
  upstreamFailed: 502,
  internal: 500,
};

/**
 * Client-safe status message per kind. Internal detail from `err.message` and
 * `err.cause` is NEVER sent to the client.
 */
const SAFE_MESSAGE_BY_KIND: Record<DomainErrorKind, string> = {
  notFound: "Not found",
  unauthorized: "Unauthorized",
  forbidden: "Forbidden",
  validation: "Invalid request",
  preconditionFailed: "Precondition failed",
  rateLimited: "Service temporarily unavailable",
  upstreamFailed: "Upstream service failed",
  internal: "Internal server error",
};

/**
 * Kinds logged at ERROR level (unexpected / high-severity).
 * Everything else logs at WARN.
 */
const ERROR_LEVEL_KINDS: ReadonlySet<DomainErrorKind> = new Set(["internal", "upstreamFailed"]);

function causeSummary(cause: unknown): unknown {
  if (cause instanceof Error) return { name: cause.name, message: cause.message };
  return cause;
}

function isH3Error(
  err: unknown,
): err is { statusCode: number; statusMessage?: string; data?: unknown } {
  return (
    typeof err === "object" &&
    err !== null &&
    "statusCode" in err &&
    typeof (err as { statusCode: unknown }).statusCode === "number"
  );
}

/**
 * Translate any thrown value into the HTTP response. Always throws.
 *
 *  - DomainError → mapped by `kind` to status + sanitized message + safe `data`
 *  - H3Error (already shaped by `createError` or framework) → rethrown as-is
 *  - Anything else → logged at ERROR, generic 500 returned to client
 */
export function toHttp(err: unknown, event: H3Event): never {
  if (DomainError.is(err)) {
    const logContext = {
      path: event.path,
      kind: err.kind,
      message: err.message,
      details: err.details,
      cause: causeSummary(err.cause),
    };

    if (ERROR_LEVEL_KINDS.has(err.kind)) {
      logError(`[${err.kind}] ${err.message}`, logContext);
    } else {
      logWarn(`[${err.kind}] ${err.message}`, logContext);
    }

    throw createError({
      statusCode: STATUS_BY_KIND[err.kind],
      statusMessage: SAFE_MESSAGE_BY_KIND[err.kind],
      data: err.details,
    });
  }

  if (isH3Error(err)) {
    throw err;
  }

  logError("Unhandled error", {
    path: event.path,
    cause: causeSummary(err),
  });

  throw createError({
    statusCode: 500,
    statusMessage: "Internal server error",
  });
}
