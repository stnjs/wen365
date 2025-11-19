import { SiweMessage } from "siwe";

/**
 * Validates signature format
 * @param signature - Signature to validate
 * @returns True if signature format is valid
 */
export function isValidSignatureFormat(signature: string): boolean {
  if (!signature || typeof signature !== "string") {
    return false;
  }

  // Signature should start with 0x and be 132 characters (0x + 130 hex chars)
  return /^0x[a-fA-F0-9]{130}$/.test(signature);
}

/**
 * Validates SIWE message structure and content
 * @param message - SIWE message string
 * @param expectedDomain - Expected domain (server domain)
 * @param expectedUri - Expected URI (server origin)
 * @returns Parsed and validated SiweMessage
 * @throws Error if validation fails
 */
export function validateSiweMessage(
  message: string,
  expectedDomain: string,
  expectedUri: string,
): SiweMessage {
  if (!message || typeof message !== "string") {
    throw new Error("Message is required and must be a string");
  }

  let siweMessage: SiweMessage;
  try {
    siweMessage = new SiweMessage(message);
  } catch (_error) {
    throw new Error("Invalid SIWE message format");
  }

  // Validate domain matches server domain
  if (siweMessage.domain !== expectedDomain) {
    throw new Error("Message domain does not match server domain");
  }

  // Validate URI matches server origin
  if (siweMessage.uri !== expectedUri) {
    throw new Error("Message URI does not match server origin");
  }

  // Check expiration (if expirationTime is set)
  if (siweMessage.expirationTime) {
    const expirationDate = new Date(siweMessage.expirationTime);
    if (expirationDate < new Date()) {
      throw new Error("Message has expired");
    }
  }

  // Check notBefore (if set)
  if (siweMessage.notBefore) {
    const notBeforeDate = new Date(siweMessage.notBefore);
    if (notBeforeDate > new Date()) {
      throw new Error("Message is not yet valid");
    }
  }

  return siweMessage;
}
