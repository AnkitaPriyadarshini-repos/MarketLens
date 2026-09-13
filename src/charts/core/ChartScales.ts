import { OHLCPoint, CandleGeometry } from '../../types/chart';

/**
 * ChartScales Module - Visualization Engine 2.0 (TypeScript)
 * Single authoritative coordinate transformation system for financial charts
 */
export class ChartScale {
  readonly domainMin: number;
  readonly domainMax: number;
  readonly rangeMin: number;
  readonly rangeMax: number;
  readonly domainSpan: number;
  readonly rangeSpan: number;

  constructor(domainMin: number, domainMax: number, rangeMin: number, rangeMax: number) {
    this.domainMin = isNaN(domainMin) ? 0 : domainMin;
    this.domainMax = isNaN(domainMax) ? 100 : domainMax;
    this.rangeMin = isNaN(rangeMin) ? 0 : rangeMin;
    this.rangeMax = isNaN(rangeMax) ? 100 : rangeMax;
    this.domainSpan = (this.domainMax - this.domainMin) || 1;
    this.rangeSpan = (this.rangeMax - this.rangeMin) || 1;
  }

  priceToY(price: number | null | undefined): number {
    if (price === null || price === undefined || isNaN(price)) return this.rangeMin;
    return this.rangeMin + ((price - this.domainMin) / this.domainSpan) * this.rangeSpan;
  }

  yToPrice(y: number | null | undefined): number {
    if (y === null || y === undefined || isNaN(y)) return this.domainMin;
    return this.domainMin + ((y - this.rangeMin) / this.rangeSpan) * this.domainSpan;
  }

  static indexToX(index: number, stepX: number, marginLeft = 10): number {
    if (isNaN(index) || isNaN(stepX)) return marginLeft;
    return marginLeft + index * stepX + stepX / 2;
  }

  static xToIndex(x: number, stepX: number, marginLeft = 10, totalCount = 1): number {
    if (isNaN(x) || !stepX || stepX <= 0 || totalCount <= 0) return 0;
    const rawIdx = Math.floor((x - marginLeft) / stepX);
    return Math.max(0, Math.min(totalCount - 1, rawIdx));
  }

  static timeToX(timeStr: string, timeList: string[] = [], marginLeft = 10, chartWidth = 100): number {
    if (!timeList.length) return marginLeft;
    const idx = timeList.indexOf(timeStr);
    if (idx === -1) return marginLeft;
    const stepX = chartWidth / timeList.length;
    return ChartScale.indexToX(idx, stepX, marginLeft);
  }

  static xToTime(x: number, timeList: string[] = [], marginLeft = 10, chartWidth = 100): string {
    if (!timeList.length) return '';
    const stepX = chartWidth / timeList.length;
    const idx = ChartScale.xToIndex(x, stepX, marginLeft, timeList.length);
    return timeList[idx] || '';
  }
}

/**
 * Binary search for nearest data point index given mouse X coordinate
 */
export function findNearestPointIndex(dataLength: number, mouseX: number, marginLeft = 10, chartWidth = 100): number {
  if (!dataLength || dataLength <= 0 || chartWidth <= 0) return -1;
  const stepX = chartWidth / dataLength;
  return ChartScale.xToIndex(mouseX, stepX, marginLeft, dataLength);
}

/**
 * Calculate OHLC Candle Geometry (x, yHigh, yLow, yOpen, yClose, bodyY, bodyHeight, doji handling)
 */
export function calculateCandleGeometry(
  point: OHLCPoint,
  index: number,
  stepX: number,
  marginLeft: number,
  priceScale: ChartScale
): CandleGeometry {
  const x = ChartScale.indexToX(index, stepX, marginLeft);
  const open = typeof point?.open === 'number' && !isNaN(point.open) ? point.open : 0;
  const high = typeof point?.high === 'number' && !isNaN(point.high) ? point.high : open;
  const low = typeof point?.low === 'number' && !isNaN(point.low) ? point.low : open;
  const close = typeof point?.close === 'number' && !isNaN(point.close) ? point.close : open;

  const yHigh = priceScale.priceToY(high);
  const yLow = priceScale.priceToY(low);
  const yOpen = priceScale.priceToY(open);
  const yClose = priceScale.priceToY(close);
  
  // Adaptive candle width based on stepX (75% bar width, bounded between 1.5px and 32px)
  const candleWidth = Math.max(1.5, Math.min(32, stepX * 0.75));

  const bodyY = Math.min(yOpen, yClose);
  // Ensure minimum 1.5px body height for doji candles
  const bodyHeight = Math.max(1.5, Math.abs(yOpen - yClose));

  return {
    x,
    yHigh,
    yLow,
    yOpen,
    yClose,
    bodyY,
    bodyHeight,
    candleWidth,
    isBullish: close >= open
  };
}
