/**
 * ChartScales Module - Visualization Engine 2.0
 * Transforms domain values (index/time, price) into pixel coordinates
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

  toPixel(val) {
    if (val === null || val === undefined || isNaN(val)) return this.rangeMin;
    return this.rangeMin + ((val - this.domainMin) / this.domainSpan) * this.rangeSpan;
  }

  invert(pixelVal) {
    return this.domainMin + ((pixelVal - this.rangeMin) / this.rangeSpan) * this.domainSpan;
  }
}

/**
 * Binary search for nearest data point index given mouse X coordinate
 */
export function findNearestPointIndex(dataLength, mouseX, marginLeft, chartWidth) {
  if (!dataLength || dataLength <= 0 || chartWidth <= 0) return -1;
  const stepX = chartWidth / dataLength;
  const rawIdx = Math.floor((mouseX - marginLeft) / stepX);
  return Math.max(0, Math.min(dataLength - 1, rawIdx));
}

/**
 * Calculate OHLC Candle Geometry (x, yHigh, yLow, yOpen, yClose, bodyHeight)
 */
export function calculateCandleGeometry(point, index, stepX, marginLeft, priceScale) {
  const x = marginLeft + index * stepX + stepX / 2;
  const yHigh = priceScale.toPixel(point.high);
  const yLow = priceScale.toPixel(point.low);
  const yOpen = priceScale.toPixel(point.open);
  const yClose = priceScale.toPixel(point.close);
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
