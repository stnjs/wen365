import { describe, it, expect } from "vitest";
import { DomainError, normalizeUpstreamError, wrapUpstream, notFound } from "@server/errors";

describe("normalizeUpstreamError", () => {
  it("passes through existing DomainErrors unchanged", () => {
    const original = notFound("Wallet");
    const result = normalizeUpstreamError("alchemy", original);
    expect(result).toBe(original);
  });

  it("maps HTTP 429 to rateLimited with source in details", () => {
    const err = normalizeUpstreamError("alchemy", { statusCode: 429 });
    expect(DomainError.is(err)).toBe(true);
    expect(err.kind).toBe("rateLimited");
    expect(err.details).toMatchObject({ source: "alchemy" });
  });

  it("wraps arbitrary errors in upstreamFailed with source name", () => {
    const err = normalizeUpstreamError("alchemy", new Error("network down"));
    expect(err.kind).toBe("upstreamFailed");
    expect(err.message).toContain("alchemy");
  });

  it("wraps non-429 HTTP errors in upstreamFailed", () => {
    const err = normalizeUpstreamError("alchemy", { statusCode: 500 });
    expect(err.kind).toBe("upstreamFailed");
  });
});

describe("wrapUpstream", () => {
  it("returns the value on success", async () => {
    const result = await wrapUpstream("alchemy", async () => 42);
    expect(result).toBe(42);
  });

  it("normalizes thrown errors", async () => {
    await expect(
      wrapUpstream("alchemy", async () => {
        throw { statusCode: 429 };
      }),
    ).rejects.toMatchObject({ kind: "rateLimited" });
  });

  it("keeps DomainError identity through the wrapper", async () => {
    const original = notFound("Wallet");
    await expect(
      wrapUpstream("alchemy", async () => {
        throw original;
      }),
    ).rejects.toBe(original);
  });
});
