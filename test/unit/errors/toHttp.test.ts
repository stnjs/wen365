import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// toHttp uses the global auto-imported `createError`; stub it before import.
const mockCreateError = vi.fn(
  (opts: { statusCode: number; statusMessage: string; data?: unknown }) => {
    const err = new Error(opts.statusMessage) as Error & {
      statusCode: number;
      statusMessage: string;
      data?: unknown;
    };
    err.statusCode = opts.statusCode;
    err.statusMessage = opts.statusMessage;
    err.data = opts.data;
    return err;
  },
);
vi.stubGlobal("createError", mockCreateError);

const {
  DomainError,
  forbidden,
  internal,
  notFound,
  preconditionFailed,
  rateLimited,
  toHttp,
  unauthorized,
  upstreamFailed,
  validation,
} = await import("@server/errors");
type DomainError = InstanceType<typeof DomainError>;

function fakeEvent(path = "/api/test"): Parameters<typeof toHttp>[1] {
  return { path } as Parameters<typeof toHttp>[1];
}

function captureHttp(err: unknown): {
  statusCode: number;
  statusMessage: string;
  data?: unknown;
} {
  try {
    toHttp(err, fakeEvent());
  } catch (thrown) {
    return thrown as {
      statusCode: number;
      statusMessage: string;
      data?: unknown;
    };
  }
  throw new Error("toHttp should always throw");
}

describe("toHttp", () => {
  // Silence the logger so the test output stays clean.
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    [notFound("Wallet"), 404, "Not found"],
    [unauthorized(), 401, "Unauthorized"],
    [forbidden(), 403, "Forbidden"],
    [validation("Invalid body"), 400, "Invalid request"],
    [preconditionFailed("Nonce expired"), 400, "Precondition failed"],
    [rateLimited(), 503, "Service temporarily unavailable"],
    [upstreamFailed("alchemy"), 502, "Upstream service failed"],
    [internal(), 500, "Internal server error"],
  ])(
    "maps DomainError to the right status + sanitized message",
    (err: DomainError, status: number, message: string) => {
      const thrown = captureHttp(err);
      expect(thrown.statusCode).toBe(status);
      expect(thrown.statusMessage).toBe(message);
    },
  );

  it("surfaces DomainError.details as data (safe for clients)", () => {
    const thrown = captureHttp(
      validation("Invalid body", {
        details: { errors: { address: "required" } },
      }),
    );
    expect(thrown.data).toEqual({ errors: { address: "required" } });
  });

  it("never leaks err.message to the client", () => {
    const thrown = captureHttp(
      upstreamFailed("supabase", {
        cause: new Error("secret internal detail"),
      }),
    );
    expect(thrown.statusMessage).toBe("Upstream service failed");
    expect(JSON.stringify(thrown)).not.toContain("secret internal detail");
  });

  it("passes H3-shaped errors through unchanged", () => {
    const existing = { statusCode: 418, statusMessage: "I'm a teapot" };
    const thrown = captureHttp(existing);
    expect(thrown).toBe(existing);
  });

  it("converts unknown errors to generic 500", () => {
    const thrown = captureHttp(new Error("something exploded"));
    expect(thrown.statusCode).toBe(500);
    expect(thrown.statusMessage).toBe("Internal server error");
    expect(JSON.stringify(thrown)).not.toContain("something exploded");
  });

  it("logs upstreamFailed and internal at error level", () => {
    const errorSpy = vi.spyOn(console, "error");
    captureHttp(upstreamFailed("alchemy"));
    captureHttp(internal());
    expect(errorSpy).toHaveBeenCalledTimes(2);
  });

  it("logs validation/notFound/etc. at warn level", () => {
    const warnSpy = vi.spyOn(console, "warn");
    captureHttp(notFound("Wallet"));
    captureHttp(validation("Bad"));
    expect(warnSpy).toHaveBeenCalledTimes(2);
  });
});
