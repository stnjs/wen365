interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
}

/**
 * Retries a function with exponential backoff
 * @param fn - Function to retry
 * @param options - Retry configuration
 * @returns Result of the function
 */
export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const { maxRetries = 3, baseDelay = 1000 } = options;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      return await fn();
    } catch (error: unknown) {
      if (retries === maxRetries - 1) throw error;

      const delay = baseDelay * Math.pow(2, retries);
      await new Promise(resolve => setTimeout(resolve, delay));
      retries++;
    }
  }

  throw new Error("Failed after retries");
}

/**
 * Fetches with retry and timeout
 * @param url - URL to fetch
 * @param fetchOptions - Fetch options (method, body, etc.)
 * @param retryOptions - Retry configuration
 * @returns Response data
 */
export async function fetchWithRetry<T>(
  url: string,
  fetchOptions: {
    method?:
      | "GET"
      | "HEAD"
      | "PATCH"
      | "POST"
      | "PUT"
      | "DELETE"
      | "CONNECT"
      | "OPTIONS"
      | "TRACE"
      | "get"
      | "head"
      | "patch"
      | "post"
      | "put"
      | "delete"
      | "connect"
      | "options"
      | "trace";
    body?: Record<string, unknown> | unknown[];
    timeout?: number;
    [key: string]: unknown;
  } = {},
  retryOptions: RetryOptions = {},
): Promise<T> {
  const { timeout = 30000, ...restOptions } = fetchOptions;

  return withRetry(async () => {
    return (await $fetch<T>(url, { ...restOptions, timeout })) as T;
  }, retryOptions);
}
