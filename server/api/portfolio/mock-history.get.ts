import type { PortfolioHistoryDto } from "#shared/types/PortfolioHistoryDto";

/**
 * DEV-ONLY: Returns dummy portfolio history for testing the chart.
 * Remove this endpoint before shipping to production.
 */
export default defineEventHandler((event): PortfolioHistoryDto => {
  if (process.env.NODE_ENV === "production") {
    throw createError({ statusCode: 404, statusMessage: "Not Found" });
  }

  const query = getQuery(event);
  const days = Math.min(parseInt(query.days as string, 10) || 30, 365);

  const now = Date.now();
  const msPerDay = 24 * 60 * 60 * 1000;
  const startValue = 8500 + Math.random() * 1000;

  const snapshots = Array.from({ length: days }, (_, i) => {
    const drift = (i / days) * 3200;
    const noise = Math.sin(i * 0.7) * 400 + Math.cos(i * 1.3) * 250 + (Math.random() - 0.5) * 300;
    const value = Math.round((startValue + drift + noise) * 100) / 100;

    return {
      timestamp: new Date(now - (days - 1 - i) * msPerDay).toISOString(),
      totalValue: Math.max(value, 100),
    };
  });

  const firstValue = snapshots[0]!.totalValue;
  const lastValue = snapshots[snapshots.length - 1]!.totalValue;
  const valueChange = Math.round((lastValue - firstValue) * 100) / 100;
  const valueChangePercent =
    firstValue > 0 ? Math.round(((lastValue - firstValue) / firstValue) * 10000) / 100 : 0;

  return { snapshots, valueChange, valueChangePercent };
});
