/**
 * Handles and categorizes errors from services
 * Sanitizes error messages to prevent information leakage
 */
export function handleServiceError(error: unknown): never {
  const httpError = error as { statusCode?: number; message?: string };

  if (httpError.statusCode === 429) {
    throw createError({
      statusCode: 503,
      statusMessage: "Service temporarily unavailable",
    });
  }

  if (httpError.statusCode && httpError.statusCode >= 400 && httpError.statusCode < 500) {
    throw createError({
      statusCode: httpError.statusCode,
      statusMessage: "Invalid request",
    });
  }

  throw createError({
    statusCode: 500,
    statusMessage: "Internal server error",
  });
}
