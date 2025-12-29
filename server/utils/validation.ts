import type { H3Event } from "h3";
import type { z } from "zod";

/**
 * Formats Zod validation errors into a user-friendly object
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
 * Validates request body against a Zod schema
 * @throws createError with 400 status on validation failure
 */
export async function validateBody<T extends z.ZodSchema>(
  event: H3Event,
  schema: T,
): Promise<z.infer<T>> {
  const body = await readBody(event);

  const result = schema.safeParse(body);

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid request body",
      data: {
        errors: formatZodErrors(result.error),
      },
    });
  }

  return result.data;
}

/**
 * Validates query parameters against a Zod schema
 * @throws createError with 400 status on validation failure
 */
export function validateQuery<T extends z.ZodSchema>(event: H3Event, schema: T): z.infer<T> {
  const query = getQuery(event);

  const result = schema.safeParse(query);

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid query parameters",
      data: {
        errors: formatZodErrors(result.error),
      },
    });
  }

  return result.data;
}

/**
 * Validates route parameters against a Zod schema
 * @throws createError with 400 status on validation failure
 */
export function validateParams<T extends z.ZodSchema>(event: H3Event, schema: T): z.infer<T> {
  const params = getRouterParams(event);

  const result = schema.safeParse(params);

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid route parameters",
      data: {
        errors: formatZodErrors(result.error),
      },
    });
  }

  return result.data;
}
