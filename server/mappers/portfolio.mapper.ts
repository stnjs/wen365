/**
 * Maps data to PortfolioDto.
 *
 * Pure transformation — no business logic. The 24h delta fields default to
 * `null` ("no data"); handlers populate them via compute24hDelta when history
 * is available.
 */
export function mapToPortfolioDto(totalValue: number, tokens: TokenDto[]): PortfolioDto {
  return {
    totalValue,
    totalValueChange24h: null,
    totalValueChangePercent24h: null,
    tokens,
  };
}
