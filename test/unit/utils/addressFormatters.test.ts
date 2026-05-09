import { describe, it, expect } from "vitest";
import { truncateAddress } from "~~/app/utils/addressFormatters";

describe("addressFormatters", () => {
  describe("truncateAddress", () => {
    it("collapses the middle of a 42-char EVM address using the 8/6 default", () => {
      expect(truncateAddress("0xaf88d065e77c8cC2239327C5EDb3A432268e5831")).toBe(
        "0xaf88d0...8e5831",
      );
    });

    it("keeps full leading prefix (incl. 0x) and full trailing suffix at default sizes", () => {
      const result = truncateAddress("0x1234567890abcdef1234567890abcdef12345678");
      expect(result.startsWith("0x123456")).toBe(true);
      expect(result.endsWith("345678")).toBe(true);
      expect(result).toContain("...");
    });

    it("returns the input unchanged when truncation would not actually shorten it", () => {
      // 17 chars = 8 leading + "..." + 6 trailing. Truncating gains nothing.
      const exact = "0xabcdef012345678";
      expect(exact.length).toBe(17);
      expect(truncateAddress(exact)).toBe(exact);

      const shorter = "0xabc";
      expect(truncateAddress(shorter)).toBe(shorter);

      expect(truncateAddress("")).toBe("");
    });

    it("respects custom leading and trailing sizes", () => {
      expect(
        truncateAddress("0xaf88d065e77c8cC2239327C5EDb3A432268e5831", {
          leading: 6,
          trailing: 4,
        }),
      ).toBe("0xaf88...5831");
    });

    it("respects a custom separator", () => {
      expect(
        truncateAddress("0xaf88d065e77c8cC2239327C5EDb3A432268e5831", {
          separator: "…",
        }),
      ).toBe("0xaf88d0…8e5831");
    });

    it("leaves casing untouched (no checksum normalization)", () => {
      expect(truncateAddress("0xAf88D065E77c8CC2239327c5edb3A432268E5831")).toBe(
        "0xAf88D0...8E5831",
      );
    });
  });
});
