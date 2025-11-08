import type { TokenDto } from "./TokenDto";

export interface PortfolioDto {
  totalValue: number;
  totalValueChange24h: number;
  totalValueChangePercent24h: number;
  tokens: TokenDto[];
}
