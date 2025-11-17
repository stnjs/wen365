export default defineEventHandler(async event => {
  const session = await getUserSession(event);

  // Return SIWE session format (address and chainId)
  if (session.user?.address && session.user?.chainId) {
    return {
      address: session.user.address,
      chainId: session.user.chainId,
    };
  }

  return null;
});
