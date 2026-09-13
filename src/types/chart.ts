export interface OHLCPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  price: number;
  volume: number;

  // Optional Technical Indicators
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

export interface ViewportRange {
  startIdx: number;
  endIdx: number;
  visibleCount: number;
}

export interface ChartDimensions {
  width: number;
  height: number;
  marginLeft: number;
  marginRight: number;
  marginTop: number;
  marginBottom: number;
}

export interface CandleGeometry {
  x: number;
  yHigh: number;
  yLow: number;
  yOpen: number;
  yClose: number;
  bodyY: number;
  bodyHeight: number;
  candleWidth: number;
  isBullish: boolean;
}

export interface TooltipModel {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  change: number;
  changePercent: number;
  rsi?: number | null;
  macdLine?: number | null;
}
