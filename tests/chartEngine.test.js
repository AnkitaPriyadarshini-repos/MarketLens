import { describe, it, expect } from 'vitest';
import { lttbDownsample } from '../src/charts/core/Downsampler';
import { calculateIndicators } from '../src/charts/indicators/technicalMath';
import { ChartScale, findNearestPointIndex, calculateCandleGeometry } from '../src/charts/core/ChartScales';
import { ChartViewport } from '../src/charts/core/ChartViewport';
import { formatCurrency, formatPercent } from '../src/utils/formatters';

describe('ChartViewport Engine 2.0 Tests', () => {
  it('should calculate correct visible ranges for zoom levels', () => {
    const vp = new ChartViewport(100, 1.0, 0);
    const range = vp.getVisibleRange();
    expect(range.visibleCount).toBe(100);

    const zoomedVp = vp.zoomAtFocalIndex(2.0, 50);
    const zoomedRange = zoomedVp.getVisibleRange();
    expect(zoomedRange.visibleCount).toBe(50);
  });

  it('should preserve focal point when zooming', () => {
    const vp = new ChartViewport(100, 1.0, 0);
    const zoomedVp = vp.zoomAtFocalIndex(2.0, 60);
    const range = zoomedVp.getVisibleRange();
    expect(range.startIdx).toBeLessThanOrEqual(60);
    expect(range.endIdx).toBeGreaterThanOrEqual(60);
  });

  it('should handle panning bounds and clamping correctly', () => {
    const vp = new ChartViewport(100, 2.0, 0);
    const pannedVp = vp.pan(10);
    const range = pannedVp.getVisibleRange();
    expect(range.startIdx).toBe(10);

    // Over-pan should clamp
    const overPanned = vp.pan(500);
    expect(overPanned.getVisibleRange().endIdx).toBe(100);
  });
});

describe('ChartScales Inverse & Forward Coordinate Transformations', () => {
  it('should accurately convert priceToY and yToPrice', () => {
    const scale = new ChartScale(100, 200, 400, 0); // inverted canvas y
    const y = scale.priceToY(150);
    expect(y).toBe(200);

    const price = scale.yToPrice(200);
    expect(price).toBe(150);
  });

  it('should accurately convert indexToX and xToIndex', () => {
    const x = ChartScale.indexToX(5, 20, 10);
    expect(x).toBe(10 + 5 * 20 + 10);

    const idx = ChartScale.xToIndex(x, 20, 10, 100);
    expect(idx).toBe(5);
  });

  it('should convert timeToX and xToTime cleanly', () => {
    const timeList = ['Jan 1', 'Jan 2', 'Jan 3', 'Jan 4'];
    const x = ChartScale.timeToX('Jan 3', timeList, 10, 100);
    const time = ChartScale.xToTime(x, timeList, 10, 100);
    expect(time).toBe('Jan 3');
  });

  it('should handle edge cases: empty datasets, single-point, NaN, nulls safely', () => {
    expect(ChartScale.indexToX(0, 0, 10)).toBe(10);
    expect(ChartScale.xToIndex(100, 0, 10, 0)).toBe(0);
    expect(findNearestPointIndex(0, 50, 10, 0)).toBe(-1);
    
    const scale = new ChartScale(0, 0, 0, 0);
    expect(scale.priceToY(NaN)).toBe(0);
    expect(scale.yToPrice(null)).toBe(0);
  });
});

describe('LTTB Downsampling Benchmark Tests', () => {
  it('should downsample large datasets (1k, 10k, 50k, 100k points) with high performance', () => {
    [1000, 10000, 50000, 100000].forEach(count => {
      const data = Array.from({ length: count }, (_, i) => ({ price: Math.sin(i) * 50 + 100 }));
      const t0 = performance.now();
      const sampled = lttbDownsample(data, 500);
      const t1 = performance.now();

      expect(sampled.length).toBe(500);
      expect(t1 - t0).toBeLessThan(150);
    });
  });
});

describe('OHLC Candle Geometry Math', () => {
  it('should compute candle geometry properly', () => {
    const priceScale = new ChartScale(90, 110, 300, 0);
    const point = { open: 95, high: 108, low: 92, close: 105 };

    const geom = calculateCandleGeometry(point, 2, 20, 10, priceScale);
    expect(geom.isBullish).toBe(true);
    expect(geom.x).toBe(10 + 2 * 20 + 10);
    expect(geom.yHigh).toBeLessThan(geom.yLow);
    expect(geom.bodyHeight).toBeGreaterThan(0);
  });
});
