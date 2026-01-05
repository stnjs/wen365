/**
 * Maps data to PortfolioDto
 * Pure transformation function - no business logic
 * @param totalValue - Pre-calculated total portfolio value
 * @param tokens - Pre-processed and filtered tokens
 */
export function mapToPortfolioDto(totalValue: number, tokens: TokenDto[]): PortfolioDto {
  return {
    totalValue,
    totalValueChange24h: 0, // TODO: Implement 24h change calculation
    totalValueChangePercent24h: 0,
    tokens,
  };
}
