/**
 * ChartScales Utility Module
 * Transforms domain values (time/index, price) into pixel coordinates
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
    return this.rangeMin + ((val - this.domainMin) / this.domainSpan) * this.rangeSpan;
  }

  invert(pixelVal) {
    return this.domainMin + ((pixelVal - this.rangeMin) / this.rangeSpan) * this.domainSpan;
  }
}

/**
 * Binary search for nearest data point index
 */
export function findNearestPointIndex(data, mouseX, marginLeft, chartWidth) {
  if (!data || data.length === 0) return -1;
  const stepX = chartWidth / data.length;
  const rawIdx = Math.floor((mouseX - marginLeft) / stepX);
  return Math.max(0, Math.min(data.length - 1, rawIdx));
}
