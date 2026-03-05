import type { PortfolioHistoryDto } from "#shared/types/PortfolioHistoryDto";

/**
 * Returns deterministic demo portfolio history for the chart.
 * Uses a seeded sine-wave pattern so the data is stable across page loads.
 */
export default defineEventHandler((event): PortfolioHistoryDto => {
  const query = getQuery(event);
  const days = Math.min(parseInt(query.days as string, 10) || 30, 365);

  const now = Date.now();
  const msPerDay = 24 * 60 * 60 * 1000;
  const baseValue = 42000;

  const snapshots = Array.from({ length: days }, (_, i) => {
    const progress = i / days;
    const trend = progress * 5800;
    const wave = Math.sin(i * 0.4) * 1200 + Math.cos(i * 0.9) * 800;
    const value = Math.round((baseValue + trend + wave) * 100) / 100;

    return {
      timestamp: new Date(now - (days - 1 - i) * msPerDay).toISOString(),
      totalValue: Math.max(value, 1000),
    };
  });

  const firstValue = snapshots[0]?.totalValue ?? 0;
  const lastValue = snapshots[snapshots.length - 1]?.totalValue ?? 0;
  const valueChange = Math.round((lastValue - firstValue) * 100) / 100;
  const valueChangePercent =
    firstValue > 0 ? Math.round(((lastValue - firstValue) / firstValue) * 10000) / 100 : 0;

  return { snapshots, valueChange, valueChangePercent };
});
