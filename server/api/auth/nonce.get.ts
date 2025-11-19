import { generateNonce } from "siwe";

const NONCE_EXPIRATION_MINUTES = 5;

export default defineEventHandler(async event => {
  const nonce = generateNonce();
  const session = await getUserSession(event);

  // Store nonce in session with expiration timestamp
  // Note: We store nonce outside user object as it's temporary auth data
  session.nonce = nonce;
  session.nonceExpiresAt = Date.now() + NONCE_EXPIRATION_MINUTES * 60 * 1000;

  // Update session to persist nonce
  await setUserSession(event, session);

  setHeader(event, "Content-Type", "text/plain");
  return nonce;
});
