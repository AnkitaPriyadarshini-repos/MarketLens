/**
 * ChartScales Module - Visualization Engine 2.0 (Consolidated)
 * Single authoritative coordinate transformation system for financial charts
 */

export class ChartScale {
  constructor(domainMin, domainMax, rangeMin, rangeMax) {
    this.domainMin = domainMin;
    this.domainMax = domainMax;
    this.rangeMin = rangeMin;
    this.rangeMax = rangeMax;
    this.domainSpan = (domainMax - domainMin) || 1;
    this.rangeSpan = (rangeMax - rangeMin) || 1;
  }

  priceToY(price) {
    if (price === null || price === undefined || isNaN(price)) return this.rangeMin;
    return this.rangeMin + ((price - this.domainMin) / this.domainSpan) * this.rangeSpan;
  }

  yToPrice(y) {
    if (y === null || y === undefined || isNaN(y)) return this.domainMin;
    return this.domainMin + ((y - this.rangeMin) / this.rangeSpan) * this.domainSpan;
  }

  static indexToX(index, stepX, marginLeft = 10) {
    return marginLeft + index * stepX + stepX / 2;
  }

  static xToIndex(x, stepX, marginLeft = 10, totalCount = 1) {
    if (!stepX || stepX <= 0 || totalCount <= 0) return 0;
    const rawIdx = Math.floor((x - marginLeft) / stepX);
    return Math.max(0, Math.min(totalCount - 1, rawIdx));
  }

  static timeToX(timeStr, timeList = [], marginLeft = 10, chartWidth = 100) {
    if (!timeList.length) return marginLeft;
    const idx = timeList.indexOf(timeStr);
    if (idx === -1) return marginLeft;
    const stepX = chartWidth / timeList.length;
    return ChartScale.indexToX(idx, stepX, marginLeft);
  }

  static xToTime(x, timeList = [], marginLeft = 10, chartWidth = 100) {
    if (!timeList.length) return '';
    const stepX = chartWidth / timeList.length;
    const idx = ChartScale.xToIndex(x, stepX, marginLeft, timeList.length);
    return timeList[idx] || '';
  }
}

/**
 * Binary search for nearest data point index given mouse X coordinate
 */
export function findNearestPointIndex(dataLength, mouseX, marginLeft = 10, chartWidth = 100) {
  if (!dataLength || dataLength <= 0 || chartWidth <= 0) return -1;
  const stepX = chartWidth / dataLength;
  return ChartScale.xToIndex(mouseX, stepX, marginLeft, dataLength);
}

/**
 * Calculate OHLC Candle Geometry (x, yHigh, yLow, yOpen, yClose, bodyY, bodyHeight)
 */
export function calculateCandleGeometry(point, index, stepX, marginLeft, priceScale) {
  const x = ChartScale.indexToX(index, stepX, marginLeft);
  const yHigh = priceScale.priceToY(point.high);
  const yLow = priceScale.priceToY(point.low);
  const yOpen = priceScale.priceToY(point.open);
  const yClose = priceScale.priceToY(point.close);
  const candleWidth = Math.max(2, stepX * 0.7);

  const bodyY = Math.min(yOpen, yClose);
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
    isBullish: point.close >= point.open
  };
}
