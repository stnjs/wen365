import { z } from "zod";

/**
 * Hex signature format regex (0x followed by hex characters)
 */
const HEX_SIGNATURE_REGEX = /^0x[a-fA-F0-9]+$/;

/**
 * Schema for SIWE signature verification request body
 */
export const VerifyBodySchema = z.object({
  message: z
    .string({ error: "Message is required" })
    .min(1, "Message must be a non-empty string")
    .trim(),
  signature: z
    .string({ error: "Signature is required" })
    .regex(HEX_SIGNATURE_REGEX, "Invalid signature format - must be a hex string starting with 0x"),
});

export type VerifyBody = z.infer<typeof VerifyBodySchema>;
