import type { TokenDto } from "./TokenDto";

export interface PortfolioDto {
  totalValue: number;
  /**
   * 24h USD change. `null` when no Snapshot history exists yet (new Wallet) or
   * when the Snapshot repo is temporarily unavailable. Never omitted — the
   * client should distinguish `null` ("no data") from `0` ("flat").
   */
  totalValueChange24h: number | null;
  /**
   * 24h percentage change. Same null semantics as `totalValueChange24h`.
   */
  totalValueChangePercent24h: number | null;
  tokens: TokenDto[];
}
