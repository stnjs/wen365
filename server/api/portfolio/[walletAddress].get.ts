import { getPortfolio } from "@server/services/portfolio.service";
import { compute24hDelta } from "@server/services/snapshot.service";
import { reposFromEvent } from "@server/repos";
import { forbidden, internal, toHttp } from "@server/errors";
import { validateParams } from "@server/utils/validation";
import { WalletAddressParamsSchema } from "@server/types/common";

export default defineEventHandler(async (event): Promise<PortfolioDto> => {
  try {
    const session = await requireUserSession(event);
    const config = useRuntimeConfig(event);
    const alchemyApiKey = config.alchemyApiKey;

    if (!alchemyApiKey) {
      throw internal("Server configuration error: missing alchemyApiKey");
    }

    const { walletAddress } = validateParams(event, WalletAddressParamsSchema);

    if (session.user.address.toLowerCase() !== walletAddress.toLowerCase()) {
      throw forbidden("Session wallet does not match requested address");
    }

    const portfolio = await getPortfolio(walletAddress, alchemyApiKey);

    const { wallets, snapshots } = reposFromEvent(event);
    const delta = await compute24hDelta(
      walletAddress,
      portfolio.totalValue,
      wallets,
      snapshots,
    );

    if (delta) {
      portfolio.totalValueChange24h = delta.change;
      portfolio.totalValueChangePercent24h = delta.changePercent;
    }

    return portfolio;
  } catch (err) {
    toHttp(err, event);
  }
});
