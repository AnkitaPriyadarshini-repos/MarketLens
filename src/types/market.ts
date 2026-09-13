export interface AssetQuote {
  symbol: string;
  name: string;
  category: 'Stocks' | 'Crypto' | 'Indices' | 'Commodities' | 'Forex';
  sector: string;
  subSector?: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  marketCap: string;
  peRatio?: number | string;
  eps?: number | string;
  dividendYield?: string;
  high52w?: number;
  low52w?: number;
  rsi?: number;
  description?: string;
  sentiment?: string;
  aiScore?: number;
  bearPriceTarget?: number;
  bullPriceTarget?: number;
}

export interface OHLCPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  price: number;
  volume: number;

  // Technical Indicators
  sma20?: number | null;
  sma50?: number | null;
  ema12?: number | null;
  ema26?: number | null;
  wma14?: number | null;
  vwap?: number | null;
  bollingerUpper?: number | null;
  bollingerMiddle?: number | null;
  bollingerLower?: number | null;
  rsi?: number | null;
  macdLine?: number | null;
  macdSignal?: number | null;
  macdHist?: number | null;
  stochK?: number | null;
  stochD?: number | null;
  atr?: number | null;
  obv?: number | null;
}

export interface PortfolioPosition {
  id: string;
  symbol: string;
  shares: number;
  entryPrice: number;
  addedDate: string;
}

export interface UserPortfolio {
  id: string;
  name: string;
  cashBalance: number;
  positions: PortfolioPosition[];
}
