/**
 * Universal logging utility for server endpoints
 * Provides structured logging with consistent format
 */

interface LogContext {
  requestId?: string;
  [key: string]: unknown;
}

/**
 * Log error with structured context
 * @param message - Error message
 * @param context - Additional context (requestId, address, statusCode, etc.)
 */
export function logError(message: string, context: LogContext = {}): void {
  console.error(`[Error] ${message}`, {
    ...context,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Log warning with structured context
 * @param message - Warning message
 * @param context - Additional context
 */
export function logWarn(message: string, context: LogContext = {}): void {
  console.warn(`[Warn] ${message}`, {
    ...context,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Log info with structured context
 * @param message - Info message
 * @param context - Additional context
 */
export function logInfo(message: string, context: LogContext = {}): void {
  console.info(`[Info] ${message}`, {
    ...context,
    timestamp: new Date().toISOString(),
  });
}
