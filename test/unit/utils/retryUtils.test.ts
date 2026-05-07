import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { withRetry, fetchWithRetry } from "@server/utils/retryUtils";

const mockFetch = vi.fn();
global.$fetch = mockFetch as unknown as typeof global.$fetch;

describe("retryUtils", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("withRetry", () => {
    it("should return result on first success without retrying", async () => {
      const fn = vi.fn().mockResolvedValue("success");

      const promise = withRetry(fn);
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result).toBe("success");
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("should retry and succeed after transient failures", async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error("fail 1"))
        .mockRejectedValueOnce(new Error("fail 2"))
        .mockResolvedValue("recovered");

      const promise = withRetry(fn);
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result).toBe("recovered");
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it("should throw the original error after exhausting retries", async () => {
      const originalError = new Error("persistent failure");
      const fn = vi.fn().mockRejectedValue(originalError);

      const promise = withRetry(fn, { maxRetries: 3 });
      const assertion = expect(promise).rejects.toThrow("persistent failure");
      await vi.runAllTimersAsync();

      await assertion;
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it("should use exponential backoff delays", async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error("fail"))
        .mockRejectedValueOnce(new Error("fail"))
        .mockRejectedValueOnce(new Error("fail"))
        .mockResolvedValue("ok");

      const setTimeoutSpy = vi.spyOn(global, "setTimeout");

      const promise = withRetry(fn, { maxRetries: 4, baseDelay: 1000 });
      await vi.runAllTimersAsync();
      await promise;

      const delays = setTimeoutSpy.mock.calls.map(call => call[1]);
      expect(delays).toContain(1000);
      expect(delays).toContain(2000);
      expect(delays).toContain(4000);
    });

    it("should respect custom maxRetries and baseDelay", async () => {
      const fn = vi.fn().mockRejectedValue(new Error("fail"));

      const promise = withRetry(fn, { maxRetries: 2, baseDelay: 500 });
      const assertion = expect(promise).rejects.toThrow("fail");
      await vi.runAllTimersAsync();

      await assertion;
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it("should work with maxRetries of 1 (no retry on failure)", async () => {
      const fn = vi.fn().mockRejectedValue(new Error("immediate fail"));

      const promise = withRetry(fn, { maxRetries: 1 });
      const assertion = expect(promise).rejects.toThrow("immediate fail");
      await vi.runAllTimersAsync();

      await assertion;
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe("fetchWithRetry", () => {
    it("should pass timeout and options through to $fetch", async () => {
      mockFetch.mockResolvedValue({ data: "response" });

      const promise = fetchWithRetry("https://api.example.com/data", {
        method: "POST",
        body: { key: "value" },
        timeout: 5000,
      });
      await vi.runAllTimersAsync();
      await promise;

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/data",
        expect.objectContaining({
          method: "POST",
          body: { key: "value" },
          timeout: 5000,
        }),
      );
    });

    it("should default timeout to 30000ms", async () => {
      mockFetch.mockResolvedValue("ok");

      const promise = fetchWithRetry("https://api.example.com");
      await vi.runAllTimersAsync();
      await promise;

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com",
        expect.objectContaining({ timeout: 30000 }),
      );
    });
  });
});
