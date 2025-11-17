import { generateNonce } from "siwe";

export default defineEventHandler(async event => {
  const nonce = generateNonce();
  setHeader(event, "Content-Type", "text/plain");
  return nonce;
});
