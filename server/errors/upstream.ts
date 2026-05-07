import { DomainError, rateLimited, upstreamFailed } from "./domainError";

interface HttpishError {
  statusCode: number;
  statusMessage?: string;
}

function isHttpish(err: unknown): err is HttpishError {
  return (
    typeof err === "object" &&
    err !== null &&
    "statusCode" in err &&
    typeof (err as { statusCode: unknown }).statusCode === "number"
  );
}

/**
 * Convert any thrown value from an upstream call into a DomainError.
 *  - DomainError passes through unchanged (it's already normalized).
 *  - HTTP 429 → DomainError("rateLimited").
 *  - Everything else → DomainError("upstreamFailed", source).
 */
export function normalizeUpstreamError(source: string, err: unknown): DomainError {
  if (DomainError.is(err)) return err;
  if (isHttpish(err) && err.statusCode === 429) {
    return rateLimited(`${source} rate limited`, {
      details: { source },
      cause: err,
    });
  }
  return upstreamFailed(source, { cause: err });
}

/**
 * Wrap an async call to an upstream dependency so any failure surfaces as a
 * DomainError. Use at the adapter boundary to keep services and handlers free
 * of upstream-specific error shapes.
 */
export async function wrapUpstream<T>(source: string, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    throw normalizeUpstreamError(source, err);
  }
}
