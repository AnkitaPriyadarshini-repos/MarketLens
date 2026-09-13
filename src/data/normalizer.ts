import { OHLCPoint } from '../types/chart';

/**
 * Normalizes raw market data points into predictable OHLC data shape.
 * Handles missing fields, NaN values, nulls, and negative volumes defensively.
 */
export function normalizeMarketData(rawData: any[]): OHLCPoint[] {
  if (!Array.isArray(rawData) || rawData.length === 0) {
    return [];
  }

  return rawData.map((item, idx) => {
    const fallbackPrice = typeof item?.price === 'number' && !isNaN(item.price) ? item.price : 100;
    
    const open = typeof item?.open === 'number' && !isNaN(item.open) ? item.open : fallbackPrice;
    const high = typeof item?.high === 'number' && !isNaN(item.high) ? item.high : Math.max(open, fallbackPrice);
    const low = typeof item?.low === 'number' && !isNaN(item.low) ? item.low : Math.min(open, fallbackPrice);
    const close = typeof item?.close === 'number' && !isNaN(item.close) ? item.close : fallbackPrice;
    const price = typeof item?.price === 'number' && !isNaN(item.price) ? item.price : close;
    const volume = typeof item?.volume === 'number' && !isNaN(item.volume) ? Math.max(0, item.volume) : 0;
    const date = item?.date || `P-${idx}`;

    return {
      date,
      open,
      high,
      low,
      close,
      price,
      volume,
      sma20: item?.sma20 ?? null,
      sma50: item?.sma50 ?? null,
      ema12: item?.ema12 ?? null,
      ema26: item?.ema26 ?? null,
      wma14: item?.wma14 ?? null,
      vwap: item?.vwap ?? null,
      bollingerUpper: item?.bollingerUpper ?? null,
      bollingerMiddle: item?.bollingerMiddle ?? null,
      bollingerLower: item?.bollingerLower ?? null,
      rsi: item?.rsi ?? null,
      macdLine: item?.macdLine ?? null,
      macdSignal: item?.macdSignal ?? null,
      macdHist: item?.macdHist ?? null,
      stochK: item?.stochK ?? null,
      stochD: item?.stochD ?? null,
      atr: item?.atr ?? null,
      obv: item?.obv ?? null
    };
  });
}
