import { describe, it, expect } from "vitest";
import {
  DomainError,
  forbidden,
  internal,
  notFound,
  preconditionFailed,
  rateLimited,
  unauthorized,
  upstreamFailed,
  validation,
} from "@server/errors";

describe("DomainError factories", () => {
  it("notFound uses the resource name in the message", () => {
    const err = notFound("Wallet", { details: { id: "abc" } });
    expect(DomainError.is(err)).toBe(true);
    expect(err.kind).toBe("notFound");
    expect(err.message).toBe("Wallet not found");
    expect(err.details).toEqual({ id: "abc" });
  });

  it("unauthorized defaults message and accepts overrides", () => {
    expect(unauthorized().message).toBe("Unauthorized");
    expect(unauthorized("Bad token").message).toBe("Bad token");
  });

  it("forbidden defaults message and accepts overrides", () => {
    expect(forbidden().message).toBe("Forbidden");
    expect(forbidden("Not yours").message).toBe("Not yours");
  });

  it("validation surfaces details", () => {
    const err = validation("Invalid body", {
      details: { errors: { field: "required" } },
    });
    expect(err.kind).toBe("validation");
    expect(err.details).toEqual({ errors: { field: "required" } });
  });

  it("preconditionFailed", () => {
    const err = preconditionFailed("Nonce expired");
    expect(err.kind).toBe("preconditionFailed");
    expect(err.message).toBe("Nonce expired");
  });

  it("rateLimited defaults message", () => {
    expect(rateLimited().kind).toBe("rateLimited");
    expect(rateLimited().message).toBe("Rate limited");
  });

  it("upstreamFailed prefixes the upstream in the message and keeps cause", () => {
    const cause = new Error("boom");
    const err = upstreamFailed("alchemy", { cause, details: { op: "fetch" } });
    expect(err.kind).toBe("upstreamFailed");
    expect(err.message).toBe("alchemy request failed");
    expect(err.cause).toBe(cause);
    expect(err.details).toEqual({ op: "fetch" });
  });

  it("internal defaults message", () => {
    expect(internal().message).toBe("Internal error");
  });

  it("DomainError.is discriminates domain vs plain errors", () => {
    expect(DomainError.is(new Error("plain"))).toBe(false);
    expect(DomainError.is(notFound("X"))).toBe(true);
    expect(DomainError.is(null)).toBe(false);
  });
});
