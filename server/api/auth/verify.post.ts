import type { Address } from "viem";
import { createPublicClient, http, getAddress } from "viem";
import { internal, preconditionFailed, unauthorized, validation, toHttp } from "@server/errors";
import { validateSiweMessage } from "@server/utils/authUtils";
import { logError } from "@server/utils/logger";
import { validateBody } from "@server/utils/validation";
import { VerifyBodySchema } from "@server/types/auth";
import { reposFromEvent } from "@server/repos";

const REQUEST_TIMEOUT_MS = 60000;

export default defineEventHandler(async event => {
  const requestId = crypto.randomUUID();
  let normalizedAddress: Address | undefined;

  try {
    const config = useRuntimeConfig(event);
    const projectId = config.public.reownProjectId;

    if (!projectId) {
      throw internal("Server configuration error: missing reownProjectId");
    }

    const host = getHeader(event, "host") || "";
    const protocol = getHeader(event, "x-forwarded-proto") || "http";
    const origin = `${protocol}://${host}`;

    const { message, signature } = await validateBody(event, VerifyBodySchema);

    const session = await getUserSession(event);
    const storedNonce = session.nonce;
    const nonceExpiresAt = session.nonceExpiresAt;

    if (!storedNonce) {
      throw preconditionFailed("Nonce not found — request a new nonce first");
    }

    if (nonceExpiresAt && nonceExpiresAt < Date.now()) {
      throw preconditionFailed("Nonce has expired — request a new nonce");
    }

    const siweMessage = validateSiweMessage(message, host, origin);

    if (siweMessage.nonce !== storedNonce) {
      throw preconditionFailed("SIWE nonce does not match stored nonce");
    }

    normalizedAddress = getAddress(siweMessage.address);

    const chainIdNumber = siweMessage.chainId;
    if (chainIdNumber <= 0) {
      throw validation("Invalid chainId");
    }

    const publicClient = createPublicClient({
      transport: http(
        `https://rpc.walletconnect.org/v1/?chainId=${chainIdNumber}&projectId=${projectId}`,
        { timeout: REQUEST_TIMEOUT_MS },
      ),
    });

    const isValid = await publicClient.verifyMessage({
      message,
      address: normalizedAddress,
      signature: signature as `0x${string}`,
    });

    if (!isValid) {
      throw unauthorized("Invalid signature", {
        details: { address: normalizedAddress },
      });
    }

    await setUserSession(event, {
      user: {
        address: normalizedAddress,
        chainId: chainIdNumber,
      },
    });

    // Fire-and-forget Wallet registration. Logged but never blocking.
    const { wallets } = reposFromEvent(event);
    wallets.getOrCreate(normalizedAddress).catch(err => {
      logError("Failed to register Wallet post-auth", {
        requestId,
        address: normalizedAddress,
        cause: err instanceof Error ? err.message : err,
      });
    });

    return { success: true };
  } catch (err) {
    // Clear session on any auth failure. Ignore cleanup errors.
    await clearUserSession(event).catch(() => {});
    logError("Authentication failed", {
      requestId,
      address: normalizedAddress,
      cause: err instanceof Error ? err.message : err,
    });
    toHttp(err, event);
  }
});
