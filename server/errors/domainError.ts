/**
 * Domain error taxonomy.
 *
 * Every throw site below the HTTP edge should construct a DomainError via one
 * of the factory functions below. Handlers translate DomainError into HTTP
 * responses via `toHttp()` — see @server/errors/toHttp.
 *
 * Guarantees:
 *  - `message` is a developer-facing string. It is NEVER sent to clients.
 *  - `details` are safe to surface to clients (used as `data:` on the HTTP error).
 *  - `cause` is the raw underlying error. Logs only; never leaked to clients.
 *
 * See ADR-0004 for rationale and the mapping to HTTP status codes.
 */
export type DomainErrorKind =
  | "notFound"
  | "unauthorized"
  | "forbidden"
  | "validation"
  | "preconditionFailed"
  | "rateLimited"
  | "upstreamFailed"
  | "internal";

export interface DomainErrorOptions {
  details?: Record<string, unknown>;
  cause?: unknown;
}

export class DomainError extends Error {
  override readonly name = "DomainError";

  constructor(
    readonly kind: DomainErrorKind,
    message: string,
    readonly details?: Record<string, unknown>,
    options?: { cause?: unknown },
  ) {
    super(message, options);
  }

  static is(err: unknown): err is DomainError {
    return err instanceof DomainError;
  }
}

export const notFound = (
  resource: string,
  options?: DomainErrorOptions,
): DomainError =>
  new DomainError("notFound", `${resource} not found`, options?.details, {
    cause: options?.cause,
  });

export const unauthorized = (
  message: string = "Unauthorized",
  options?: DomainErrorOptions,
): DomainError =>
  new DomainError("unauthorized", message, options?.details, {
    cause: options?.cause,
  });

export const forbidden = (
  message: string = "Forbidden",
  options?: DomainErrorOptions,
): DomainError =>
  new DomainError("forbidden", message, options?.details, {
    cause: options?.cause,
  });

export const validation = (
  message: string,
  options?: DomainErrorOptions,
): DomainError =>
  new DomainError("validation", message, options?.details, {
    cause: options?.cause,
  });

export const preconditionFailed = (
  message: string,
  options?: DomainErrorOptions,
): DomainError =>
  new DomainError("preconditionFailed", message, options?.details, {
    cause: options?.cause,
  });

export const rateLimited = (
  message: string = "Rate limited",
  options?: DomainErrorOptions,
): DomainError =>
  new DomainError("rateLimited", message, options?.details, {
    cause: options?.cause,
  });

export const upstreamFailed = (
  upstream: string,
  options?: DomainErrorOptions,
): DomainError =>
  new DomainError(
    "upstreamFailed",
    `${upstream} request failed`,
    options?.details,
    { cause: options?.cause },
  );

export const internal = (
  message: string = "Internal error",
  options?: DomainErrorOptions,
): DomainError =>
  new DomainError("internal", message, options?.details, {
    cause: options?.cause,
  });
