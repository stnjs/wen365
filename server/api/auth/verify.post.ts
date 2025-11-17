import { createPublicClient, http } from "viem";
import { getAddressFromMessage, getChainIdFromMessage } from "@reown/appkit-siwe";
import { handleServiceError } from "@server/utils/errorHandler";

export default defineEventHandler(async event => {
  const config = useRuntimeConfig(event);
  const projectId = config.public.reownProjectId;

  if (!projectId) {
    throw createError({
      statusCode: 500,
      statusMessage: "Server configuration error",
    });
  }

  const body = await readBody(event);
  const { message, signature } = body;

  if (!message || !signature) {
    throw createError({
      statusCode: 400,
      statusMessage: "Message and signature are required",
    });
  }

  try {
    // Extract address and chainId from message
    const address = getAddressFromMessage(message);
    let chainId = getChainIdFromMessage(message);

    // Handle chainId format (may include ":" separator)
    if (typeof chainId === "string" && chainId.includes(":")) {
      const parts = chainId.split(":");
      // Use part after ":" if it exists, otherwise use the original value
      const extractedChainId = parts[1];
      if (extractedChainId) {
        chainId = extractedChainId;
      }
    }

    // Convert chainId to number
    const chainIdString = typeof chainId === "string" ? chainId : String(chainId);
    const chainIdNumber = Number(chainIdString);
    if (isNaN(chainIdNumber)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid chainId",
      });
    }

    // Verify signature using viem (recommended for social logins)
    const publicClient = createPublicClient({
      transport: http(
        `https://rpc.walletconnect.org/v1/?chainId=${chainIdNumber}&projectId=${projectId}`,
      ),
    });

    const isValid = await publicClient.verifyMessage({
      message,
      address: address as `0x${string}`,
      signature: signature as `0x${string}`,
    });

    if (!isValid) {
      throw createError({
        statusCode: 401,
        statusMessage: "Invalid signature",
      });
    }

    // Store session using nuxt-auth-utils
    await setUserSession(event, {
      user: {
        address,
        chainId: chainIdNumber,
      },
    });

    return { success: true };
  } catch (error: unknown) {
    // Clear session on error
    try {
      await clearUserSession(event);
    } catch {
      // Ignore session errors during cleanup
    }

    handleServiceError(error);
  }
});
