import { describe, it, expect, beforeEach, vi } from "vitest";
import { handleServiceError } from "@server/utils/errorHandler";

const mockCreateError = vi.fn((opts: { statusCode: number; statusMessage: string }) => {
  const err = new Error(opts.statusMessage) as Error & {
    statusCode: number;
    statusMessage: string;
  };
  err.statusCode = opts.statusCode;
  err.statusMessage = opts.statusMessage;
  return err;
});
vi.stubGlobal("createError", mockCreateError);

describe("errorHandler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("handleServiceError", () => {
    it("should map 429 to 503 Service temporarily unavailable", () => {
      expect(() => handleServiceError({ statusCode: 429, message: "Too Many Requests" })).toThrow();

      expect(mockCreateError).toHaveBeenCalledWith({
        statusCode: 503,
        statusMessage: "Service temporarily unavailable",
      });
    });

    it("should pass through 4xx status codes with sanitized message", () => {
      expect(() =>
        handleServiceError({ statusCode: 400, message: "Detailed internal info" }),
      ).toThrow();

      expect(mockCreateError).toHaveBeenCalledWith({
        statusCode: 400,
        statusMessage: "Invalid request",
      });
    });

    it.each([401, 403, 404, 422])("should pass through %i status code", (statusCode) => {
      expect(() =>
        handleServiceError({ statusCode, message: "should not leak" }),
      ).toThrow();

      expect(mockCreateError).toHaveBeenCalledWith({
        statusCode,
        statusMessage: "Invalid request",
      });
    });

    it("should map 5xx errors to 500 Internal server error", () => {
      expect(() => handleServiceError({ statusCode: 502 })).toThrow();

      expect(mockCreateError).toHaveBeenCalledWith({
        statusCode: 500,
        statusMessage: "Internal server error",
      });
    });

    it("should map errors without statusCode to 500", () => {
      expect(() => handleServiceError(new Error("db crashed"))).toThrow();

      expect(mockCreateError).toHaveBeenCalledWith({
        statusCode: 500,
        statusMessage: "Internal server error",
      });
    });

    it("should map plain objects without statusCode to 500", () => {
      expect(() => handleServiceError({})).toThrow();

      expect(mockCreateError).toHaveBeenCalledWith({
        statusCode: 500,
        statusMessage: "Internal server error",
      });
    });

    it("should never leak the original error message", () => {
      const sensitiveMessages = [
        { statusCode: 429, message: "Rate limit key: sk_live_secret123" },
        { statusCode: 400, message: "SQL syntax error near SELECT * FROM users" },
        { statusCode: 500, message: "Connection to db-prod-03.internal failed" },
      ];

      const allowedMessages = [
        "Service temporarily unavailable",
        "Invalid request",
        "Internal server error",
      ];

      for (const input of sensitiveMessages) {
        mockCreateError.mockClear();
        expect(() => handleServiceError(input)).toThrow();

        const calledWith = mockCreateError.mock.calls[0]![0] as { statusMessage: string };
        expect(allowedMessages).toContain(calledWith.statusMessage);
        expect(calledWith.statusMessage).not.toContain(input.message);
      }
    });
  });
});
