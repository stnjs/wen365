import type { H3Event } from "h3";
import type { z } from "zod";
import { validation } from "@server/errors";

/**
 * Converts Zod issues to a field → message map suitable for client display.
 */
function formatZodErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join(".") || "value";
    errors[path] = issue.message;
  }
  return errors;
}

/**
 * Runs a Zod parser and converts ZodError into a DomainError of kind
 * "validation" so everything downstream only has to reason about DomainError.
 * Non-Zod throws (should not happen on `safeParse`) are re-raised.
 */
function parseOrThrow<T extends z.ZodSchema>(
  schema: T,
  raw: unknown,
  scope: "body" | "query" | "params",
): z.infer<T> {
  const result = schema.safeParse(raw);
  if (result.success) return result.data;
  throw validation(`Invalid ${scope}`, {
    details: { scope, errors: formatZodErrors(result.error) },
  });
}

/**
 * Validates request body against a Zod schema.
 * @throws DomainError("validation") when parsing fails.
 */
export async function validateBody<T extends z.ZodSchema>(
  event: H3Event,
  schema: T,
): Promise<z.infer<T>> {
  const body = await readBody(event);
  return parseOrThrow(schema, body, "body");
}

/**
 * Validates query parameters against a Zod schema.
 * @throws DomainError("validation") when parsing fails.
 */
export function validateQuery<T extends z.ZodSchema>(event: H3Event, schema: T): z.infer<T> {
  return parseOrThrow(schema, getQuery(event), "query");
}

/**
 * Validates route parameters against a Zod schema.
 * @throws DomainError("validation") when parsing fails.
 */
export function validateParams<T extends z.ZodSchema>(event: H3Event, schema: T): z.infer<T> {
  return parseOrThrow(schema, getRouterParams(event), "params");
}
