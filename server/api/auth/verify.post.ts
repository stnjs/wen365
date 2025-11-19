import type { Address } from "viem";
import { createPublicClient, http, getAddress } from "viem";
import { handleServiceError } from "@server/utils/errorHandler";
import { isValidSignatureFormat, validateSiweMessage } from "@server/utils/authUtils";
import { logError } from "@server/utils/logger";

const REQUEST_TIMEOUT_MS = 60000; // 60 seconds

export default defineEventHandler(async event => {
  const requestId = crypto.randomUUID();
  const config = useRuntimeConfig(event);
  const projectId = config.public.reownProjectId;

  if (!projectId) {
    throw createError({
      statusCode: 500,
      statusMessage: "Server configuration error",
    });
  }

  // Get server domain and origin for SIWE validation
  const host = getHeader(event, "host") || "";
  const protocol = getHeader(event, "x-forwarded-proto") || "http";
  const origin = `${protocol}://${host}`;

  const body = await readBody(event);
  const { message, signature } = body;

  // Input validation
  if (!message || typeof message !== "string" || message.trim().length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Message is required and must be a non-empty string",
    });
  }

  if (!signature || typeof signature !== "string") {
    throw createError({
      statusCode: 400,
      statusMessage: "Signature is required and must be a string",
    });
  }

  // Validate signature format
  if (!isValidSignatureFormat(signature)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid signature format",
    });
  }

  // Get session to check nonce
  const session = await getUserSession(event);
  const storedNonce = session.nonce;
  const nonceExpiresAt = session.nonceExpiresAt;

  // Validate nonce exists and is not expired
  if (!storedNonce) {
    throw createError({
      statusCode: 400,
      statusMessage: "Nonce not found. Please request a new nonce.",
    });
  }

  if (nonceExpiresAt && nonceExpiresAt < Date.now()) {
    throw createError({
      statusCode: 400,
      statusMessage: "Nonce has expired. Please request a new nonce.",
    });
  }

  let normalizedAddress: Address | undefined;

  try {
    // Validate SIWE message structure and content
    const siweMessage = validateSiweMessage(message, host, origin);

    // Validate nonce matches
    if (siweMessage.nonce !== storedNonce) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid nonce",
      });
    }

    normalizedAddress = getAddress(siweMessage.address);

    // Extract chainId from parsed SIWE message (already a number)
    const chainIdNumber = siweMessage.chainId;
    if (chainIdNumber <= 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid chainId",
      });
    }

    // Verify signature using viem with timeout
    const publicClient = createPublicClient({
      transport: http(
        `https://rpc.walletconnect.org/v1/?chainId=${chainIdNumber}&projectId=${projectId}`,
        {
          timeout: REQUEST_TIMEOUT_MS,
        },
      ),
    });

    const isValid = await Promise.race([
      publicClient.verifyMessage({
        message,
        address: normalizedAddress,
        signature: signature as `0x${string}`,
      }),
      new Promise<boolean>((_, reject) =>
        setTimeout(() => reject(new Error("Signature verification timeout")), REQUEST_TIMEOUT_MS),
      ),
    ]);

    if (!isValid) {
      logError("Failed signature verification", {
        requestId,
        address: normalizedAddress,
      });

      throw createError({
        statusCode: 401,
        statusMessage: "Invalid signature",
      });
    }

    // Store user session using nuxt-auth-utils (nonce is automatically cleared)
    await setUserSession(event, {
      user: {
        address: normalizedAddress,
        chainId: chainIdNumber,
      },
    });

    return { success: true };
  } catch (error: unknown) {
    const httpError = error as { statusCode?: number; message?: string };

    logError("Authentication failed", {
      requestId,
      address: normalizedAddress,
      statusCode: httpError.statusCode || 500,
      error: httpError.message || "Unknown error",
    });

    // Clear session on error
    try {
      await clearUserSession(event);
    } catch {
      // Ignore session errors during cleanup
    }

    // Re-throw createError instances, handle others
    if (httpError.statusCode) {
      throw error;
    }

    handleServiceError(error);
  }
});
