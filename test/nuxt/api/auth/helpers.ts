import type { H3Event } from "h3";
import { vi } from "vitest";

/**
 * Creates a mock H3Event for testing API endpoints
 */
export function createMockEvent(overrides?: {
  headers?: Record<string, string>;
  body?: unknown;
  method?: string;
}): H3Event {
  const event = {
    node: {
      req: {
        headers: {
          host: "localhost:3000",
          "x-forwarded-proto": "http",
          ...overrides?.headers,
        },
        method: overrides?.method ?? "GET",
      },
      res: {
        setHeader: vi.fn(),
        getHeader: vi.fn((name: string) => {
          const headers: Record<string, string> = {
            host: "localhost:3000",
            "x-forwarded-proto": "http",
            ...overrides?.headers,
          };
          return headers[name];
        }),
      },
    },
    context: {},
  } as unknown as H3Event;

  return event;
}

/**
 * Creates a mock session object
 */
export function createMockSession(overrides?: {
  nonce?: string;
  nonceExpiresAt?: number;
  user?: {
    address?: string;
    chainId?: number;
  };
}) {
  return {
    nonce: overrides?.nonce,
    nonceExpiresAt: overrides?.nonceExpiresAt,
    user: overrides?.user,
  };
}

/**
 * Creates a valid SIWE message string for testing
 * Note: This creates a minimal valid format - in production, messages come from clients
 */
export function createSiweMessageString(options: {
  domain: string;
  uri: string;
  address: string;
  nonce: string;
  chainId?: number;
  expirationTime?: string;
  notBefore?: string;
}): string {
  const chainId = options.chainId ?? 1;
  const expiration = options.expirationTime ? `\nExpiration Time: ${options.expirationTime}` : "";
  const notBefore = options.notBefore ? `\nNot Before: ${options.notBefore}` : "";

  return `${options.domain} wants you to sign in with your Ethereum account:
${options.address}

Please sign in with your Ethereum account to access your portfolio.

URI: ${options.uri}
Version: 1
Chain ID: ${chainId}
Nonce: ${options.nonce}${expiration}${notBefore}
Issued At: ${new Date().toISOString()}`;
}

/**
 * Creates a valid signature format (for testing signature format validation)
 */
export function createMockSignature(): string {
  return "0x" + "a".repeat(130);
}
