import { SiweMessage } from "siwe";
import { preconditionFailed, validation } from "@server/errors";

/**
 * Validates signature format
 * @param signature - Signature to validate
 * @returns True if signature format is valid
 */
export function isValidSignatureFormat(signature: string): boolean {
  if (!signature || typeof signature !== "string") {
    return false;
  }
  return /^0x[a-fA-F0-9]{130}$/.test(signature);
}

/**
 * Validates SIWE message structure and content.
 *
 * Format/shape problems throw DomainError("validation").
 * Domain/state problems (domain mismatch, expiry) throw DomainError("preconditionFailed").
 */
export function validateSiweMessage(
  message: string,
  expectedDomain: string,
  expectedUri: string,
): SiweMessage {
  if (!message || typeof message !== "string") {
    throw validation("SIWE message is required and must be a string");
  }

  let siweMessage: SiweMessage;
  try {
    siweMessage = new SiweMessage(message);
  } catch (err) {
    throw validation("Invalid SIWE message format", { cause: err });
  }

  if (siweMessage.domain !== expectedDomain) {
    throw preconditionFailed("Message domain does not match server domain");
  }

  if (siweMessage.uri !== expectedUri) {
    throw preconditionFailed("Message URI does not match server origin");
  }

  if (siweMessage.expirationTime) {
    const expirationDate = new Date(siweMessage.expirationTime);
    if (expirationDate < new Date()) {
      throw preconditionFailed("SIWE message has expired");
    }
  }

  if (siweMessage.notBefore) {
    const notBeforeDate = new Date(siweMessage.notBefore);
    if (notBeforeDate > new Date()) {
      throw preconditionFailed("SIWE message is not yet valid");
    }
  }

  return siweMessage;
}
