// Crypto Asset Types
export interface CryptoAsset {
  id: string;
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logo?: string;
  price?: number;
  priceChange24h?: number;
}

// Transaction Types
export interface Transaction {
  id: string;
  hash: string;
  blockNumber: number;
  timestamp: number;
  from: string;
  to: string;
  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
  tokenDecimals: number;
  value: string;
  valueUsd?: number;
  type: TransactionType;
  gasUsed?: string;
  gasPrice?: string;
  status: "success" | "failed";
  classification?: TransactionClassification;
}

export enum TransactionType {
  RECEIVE = "receive",
  SEND = "send",
  SWAP = "swap",
  STAKE = "stake",
  UNSTAKE = "unstake",
  BRIDGE = "bridge",
  LIQUIDITY_ADD = "liquidity_add",
  LIQUIDITY_REMOVE = "liquidity_remove",
  AIRDROP = "airdrop",
  REWARD = "reward",
}

export enum TransactionClassification {
  PURCHASE = "purchase",
  SALE = "sale",
  TRANSFER = "transfer",
  STAKING = "staking",
  BRIDGING = "bridging",
  LIQUIDITY = "liquidity",
  REWARD = "reward",
  AIRDROP = "airdrop",
}

// FIFO Holding Types
export interface FIFOHolding {
  id: string;
  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
  quantity: string;
  quantityUsd?: number;
  acquisitionDate: number;
  acquisitionPrice?: number;
  acquisitionPriceUsd?: number;
  holdingDays: number;
  isTaxFree: boolean;
  taxFreeDate?: number;
  daysUntilTaxFree?: number;
  transactionIds: string[];
}

// Portfolio Types
export interface Portfolio {
  totalValue: number;
  totalValueChange24h: number;
  totalValueChangePercent24h: number;
  assets: PortfolioAsset[];
  taxFreeAssets: FIFOHolding[];
  taxableAssets: FIFOHolding[];
}

export interface PortfolioAsset {
  token: CryptoAsset;
  balance: string;
  balanceUsd: number;
  holdings: FIFOHolding[];
  averageHoldingDays: number;
  taxFreePercentage: number;
}

// Tax Settings
export interface TaxSettings {
  country: string;
  taxFreePeriodDays: number;
  taxFreeDate: number; // timestamp
  currency: string;
  notifications: NotificationSettings;
}

export interface NotificationSettings {
  email: boolean;
  telegram: boolean;
  emailAddress?: string;
  telegramChatId?: string;
  notifyDaysBefore: number;
}

// API Response Types
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Wallet Types
export interface WalletInfo {
  address: string;
  chainId: number;
  isConnected: boolean;
  balance?: string;
}

// Export Types
export interface ExportOptions {
  format: "csv" | "json";
  dateRange: {
    start: number;
    end: number;
  };
  includeTaxFree: boolean;
  includeTaxable: boolean;
  includeTransactions: boolean;
}

// Chart Types
export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
}
export interface PortfolioResponse {
  totalValue: number;
  totalValueChange24h: number;
  totalValueChangePercent24h: number;
}
