/**
 * Represents a single point in time for portfolio value history
 */
export interface PortfolioHistorySnapshot {
  /** ISO timestamp of the snapshot */
  timestamp: string;
  /** Total portfolio value in USD at this point in time */
  totalValue: number;
}

/**
 * Portfolio history data for charting performance over time
 */
export interface PortfolioHistoryDto {
  /** Array of historical snapshots ordered by timestamp ascending */
  snapshots: PortfolioHistorySnapshot[];
  /** Absolute value change from first to last snapshot in USD */
  valueChange: number;
  /** Percentage change from first to last snapshot */
  valueChangePercent: number;
}
