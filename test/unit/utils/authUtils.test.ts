import { describe, it, expect } from "vitest";
import { isValidSignatureFormat, validateSiweMessage } from "@server/utils/authUtils";

describe("authUtils", () => {
  describe("isValidSignatureFormat", () => {
    it("should validate correct signature format", () => {
      const validSignature = "0x" + "a".repeat(130);
      expect(isValidSignatureFormat(validSignature)).toBe(true);
    });

    it("should validate signature with uppercase hex chars", () => {
      const validSignature =
        "0x" + "ABCDEF1234567890".repeat(8) + "ABCDEF1234567890".substring(0, 2);
      expect(isValidSignatureFormat(validSignature)).toBe(true);
    });

    it("should validate signature with mixed case hex chars", () => {
      const validSignature =
        "0x" + "aBcDeF1234567890".repeat(8) + "aBcDeF1234567890".substring(0, 2);
      expect(isValidSignatureFormat(validSignature)).toBe(true);
    });

    it("should reject signature missing 0x prefix", () => {
      const invalidSignature = "a".repeat(130);
      expect(isValidSignatureFormat(invalidSignature)).toBe(false);
    });

    it("should reject signature with wrong length (too short)", () => {
      const invalidSignature = "0x" + "a".repeat(129);
      expect(isValidSignatureFormat(invalidSignature)).toBe(false);
    });

    it("should reject signature with wrong length (too long)", () => {
      const invalidSignature = "0x" + "a".repeat(131);
      expect(isValidSignatureFormat(invalidSignature)).toBe(false);
    });

    it("should reject signature with non-hex characters", () => {
      const invalidSignature = "0x" + "g".repeat(130);
      expect(isValidSignatureFormat(invalidSignature)).toBe(false);
    });

    it("should reject empty string", () => {
      expect(isValidSignatureFormat("")).toBe(false);
    });
  });

  describe("validateSiweMessage", () => {
    const expectedDomain = "example.com";
    const expectedUri = "https://example.com";

    // Note: We don't unit-test the happy path here. Constructing a SIWE message
    // that satisfies the library's strict ABNF parser deterministically would
    // require a real signing flow; the integration is exercised at the API
    // route level (see /api/auth/verify). What we lock down here is the
    // defensive runtime input validation that runs *before* the parser.

    it("rejects empty messages with a typed error", () => {
      expect(() => validateSiweMessage("", expectedDomain, expectedUri)).toThrow(
        "SIWE message is required and must be a string",
      );
    });

    it("rejects null messages with a typed error", () => {
      expect(() =>
        validateSiweMessage(null as unknown as string, expectedDomain, expectedUri),
      ).toThrow("SIWE message is required and must be a string");
    });

    it("rejects non-string messages with a typed error", () => {
      expect(() =>
        validateSiweMessage(123 as unknown as string, expectedDomain, expectedUri),
      ).toThrow("SIWE message is required and must be a string");
    });

    it("rejects unparseable messages with an Invalid SIWE message format error", () => {
      expect(() =>
        validateSiweMessage("not a valid SIWE message", expectedDomain, expectedUri),
      ).toThrow("Invalid SIWE message format");
    });
  });
});
