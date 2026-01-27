import type { Address } from "viem";
import { createPublicClient, http, getAddress } from "viem";
import { handleServiceError } from "@server/utils/errorHandler";
import { validateSiweMessage } from "@server/utils/authUtils";
import { logError } from "@server/utils/logger";
import { validateBody } from "@server/utils/validation";
import { VerifyBodySchema } from "@server/types/auth";
import { getOrCreateWallet } from "@server/services/wallet.service";

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

  // Validate request body with Zod
  const { message, signature } = await validateBody(event, VerifyBodySchema);

  const session = await getUserSession(event);
  const storedNonce = session.nonce;
  const nonceExpiresAt = session.nonceExpiresAt;

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
    const siweMessage = validateSiweMessage(message, host, origin);

    if (siweMessage.nonce !== storedNonce) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid nonce",
      });
    }

    normalizedAddress = getAddress(siweMessage.address);

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

    const isValid = await publicClient.verifyMessage({
      message,
      address: normalizedAddress,
      signature: signature as `0x${string}`,
    });

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

    await setUserSession(event, {
      user: {
        address: normalizedAddress,
        chainId: chainIdNumber,
      },
    });

    // Register wallet in Supabase (non-blocking)
    getOrCreateWallet(event, normalizedAddress).catch(err => {
      logError("Failed to register wallet in Supabase", {
        requestId,
        address: normalizedAddress,
        error: err instanceof Error ? err.message : "Unknown error",
      });
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
