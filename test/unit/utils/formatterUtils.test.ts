import { describe, it, expect } from "vitest";
import { roundToTwoDecimals } from "@server/utils/formatterUtils";

describe("formatterUtils", () => {
  describe("roundToTwoDecimals", () => {
    it("should round 23.125 to 23.13", () => {
      expect(roundToTwoDecimals(23.125)).toBe(23.13);
    });

    it("should round 23.1253215 to 23.13", () => {
      expect(roundToTwoDecimals(23.1253215)).toBe(23.13);
    });

    it("should keep already rounded numbers unchanged", () => {
      expect(roundToTwoDecimals(23.13)).toBe(23.13);
      expect(roundToTwoDecimals(100.0)).toBe(100);
    });

    it("should round up correctly", () => {
      expect(roundToTwoDecimals(23.126)).toBe(23.13);
      expect(roundToTwoDecimals(23.129)).toBe(23.13);
    });

    it("should round down correctly", () => {
      expect(roundToTwoDecimals(23.124)).toBe(23.12);
      expect(roundToTwoDecimals(23.121)).toBe(23.12);
    });

    it("should handle large numbers", () => {
      expect(roundToTwoDecimals(1234567.891)).toBe(1234567.89);
      expect(roundToTwoDecimals(999999.999)).toBe(1000000);
    });

    it("should handle small decimals", () => {
      expect(roundToTwoDecimals(0.001)).toBe(0);
      expect(roundToTwoDecimals(0.005)).toBe(0.01);
      expect(roundToTwoDecimals(0.004)).toBe(0);
    });

    it("should handle zero", () => {
      expect(roundToTwoDecimals(0)).toBe(0);
      expect(roundToTwoDecimals(0.0)).toBe(0);
    });

    it("should handle negative numbers", () => {
      // Math.round rounds towards zero, so -23.125 rounds to -23.12 (not -23.13)
      expect(roundToTwoDecimals(-23.125)).toBe(-23.12);
      expect(roundToTwoDecimals(-23.124)).toBe(-23.12);
      // -0.005 rounds to -0 (towards zero), but -0 === 0 in JavaScript
      expect(roundToTwoDecimals(-0.005)).toBe(-0);
      expect(roundToTwoDecimals(-0.005) === 0).toBe(true);
    });

    it("should handle numbers with many decimal places", () => {
      expect(roundToTwoDecimals(1.23456789)).toBe(1.23);
      expect(roundToTwoDecimals(9.999999)).toBe(10);
    });
  });
});
