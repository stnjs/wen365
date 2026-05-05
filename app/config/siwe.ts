import {
  type SIWESession,
  type SIWEVerifyMessageArgs,
  type SIWECreateMessageArgs,
  createSIWEConfig,
  formatMessage,
} from "@reown/appkit-siwe";
import { networks } from "./wagmi";

/**
 * Function that returns the user's session - uses nuxt-auth-utils
 */
async function getSession(): Promise<SIWESession | null> {
  // Note: This is called from AppKit context, so we need to fetch directly
  // useUserSession() composable is not available here
  try {
    const data = await $fetch<SIWESession | null>("/api/auth/session", {
      method: "GET",
      credentials: "include",
    });

    const isValidData =
      typeof data === "object" &&
      data !== null &&
      typeof data.address === "string" &&
      typeof data.chainId === "number";

    return isValidData ? (data as SIWESession) : null;
  } catch (_error) {
    return null;
  }
}

/**
 * Use your SIWE server to verify if the message and the signature are valid
 */
const verifyMessage = async ({ message, signature }: SIWEVerifyMessageArgs): Promise<boolean> => {
  try {
    const result = await $fetch<{ success: boolean }>("/api/auth/verify", {
      method: "POST",
      body: { message, signature },
      credentials: "include",
    });

    return result.success === true;
  } catch (_error) {
    return false;
  }
};

/**
 * Get nonce from server
 */
const getNonce = async (): Promise<string> => {
  try {
    return await $fetch<string>("/api/auth/nonce", {
      method: "GET",
      credentials: "include",
    });
  } catch (_error) {
    throw new Error("Failed to get nonce!");
  }
};

/**
 * Sign out function
 */
const signOut = async (): Promise<boolean> => {
  try {
    await $fetch("/api/auth/signout", {
      method: "GET",
      credentials: "include",
    });
    return true;
  } catch (_error) {
    return false;
  }
};

/**
 * Refresh the nuxt-auth-utils client session cache so `loggedIn` updates
 * reactively across the app (landing-page redirect, route middleware, etc.)
 * after the server has set or cleared the session cookie.
 */
const refreshUserSession = async (): Promise<void> => {
  try {
    await useUserSession().fetch();
  } catch (_error) {
    // Best-effort — the next page load will pick up the correct session.
  }
};

/**
 * Create a SIWE configuration object
 */
export const siweConfig = createSIWEConfig({
  getMessageParams: async () => ({
    domain: typeof window !== "undefined" ? window.location.host : "",
    uri: typeof window !== "undefined" ? window.location.origin : "",
    chains: networks.map(network => network.id as number),
    statement: "Please sign in with your Ethereum account to access your portfolio.",
  }),
  createMessage: ({ address, ...args }: SIWECreateMessageArgs) => formatMessage(args, address),
  getNonce,
  getSession,
  verifyMessage,
  signOut,
  onSignIn: () => {
    void refreshUserSession();
  },
  onSignOut: () => {
    void refreshUserSession();
  },
});
