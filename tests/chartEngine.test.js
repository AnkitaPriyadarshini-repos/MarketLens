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

    const zoomedVp = vp.zoom(2.0);
    const zoomedRange = zoomedVp.getVisibleRange();
    expect(zoomedRange.visibleCount).toBe(50);
  });

  it('should handle panning bounds correctly', () => {
    const vp = new ChartViewport(100, 2.0, 0);
    const pannedVp = vp.pan(10);
    const range = pannedVp.getVisibleRange();
    expect(range.startIdx).toBe(10);
  });
});

describe('LTTB Downsampling Algorithm Benchmark Tests', () => {
  it('should downsample large datasets (1k, 10k, 50k, 100k points) with high performance', () => {
    [1000, 10000, 50000, 100000].forEach(count => {
      const data = Array.from({ length: count }, (_, i) => ({ price: Math.sin(i) * 50 + 100 }));
      const t0 = performance.now();
      const sampled = lttbDownsample(data, 500);
      const t1 = performance.now();

      expect(sampled.length).toBe(500);
      expect(t1 - t0).toBeLessThan(150); // Downsampling 100k points in < 150ms
    });
  });
});

describe('OHLC Candle Geometry Math', () => {
  it('should accurately compute candle body height, wick y-positions, and bullish flag', () => {
    const priceScale = new ChartScale(90, 110, 300, 0); // inverted canvas Y
    const point = { open: 95, high: 108, low: 92, close: 105 };

    const geom = calculateCandleGeometry(point, 2, 20, 10, priceScale);
    expect(geom.isBullish).toBe(true);
    expect(geom.x).toBe(10 + 2 * 20 + 10);
    expect(geom.yHigh).toBeLessThan(geom.yLow);
    expect(geom.bodyHeight).toBeGreaterThan(0);
  });
});

describe('Technical Analysis Indicator Math Tests', () => {
  const sampleOHLC = Array.from({ length: 60 }, (_, i) => ({
    date: `2024-01-${i + 1}`,
    open: 100 + i,
    high: 105 + i,
    low: 98 + i,
    close: 102 + i,
    price: 102 + i,
    volume: 500000 + i * 1000
  }));

  it('should calculate SMA 20, EMA 12, RSI, MACD, and Bollinger Bands without NaN or crashes', () => {
    const calculated = calculateIndicators(sampleOHLC);
    expect(calculated.length).toBe(60);

    expect(calculated[0].sma20).toBeNull();
    expect(typeof calculated[25].sma20).toBe('number');
    expect(calculated[25].sma20).toBeGreaterThan(0);

    expect(typeof calculated[30].rsi).toBe('number');
    expect(calculated[30].rsi).toBeGreaterThanOrEqual(0);
    expect(calculated[30].rsi).toBeLessThanOrEqual(100);

    expect(calculated[30].bollingerUpper).toBeGreaterThanOrEqual(calculated[30].bollingerLower);
  });

  it('should handle edge cases with missing/null/NaN data safely', () => {
    const edgeData = [
      { date: 'D1', open: NaN, high: null, low: undefined, close: 100, price: 100, volume: 0 },
      { date: 'D2', open: 100, high: 110, low: 90, close: 105, price: 105, volume: 1000 }
    ];
    expect(() => calculateIndicators(edgeData)).not.toThrow();
  });
});

describe('ChartScales Coordinate Transformations', () => {
  it('should accurately map domain values to pixels', () => {
    const scale = new ChartScale(0, 100, 0, 500);
    expect(scale.toPixel(0)).toBe(0);
    expect(scale.toPixel(50)).toBe(250);
    expect(scale.toPixel(100)).toBe(500);
    expect(scale.invert(250)).toBe(50);
  });

  it('should find nearest data index binary search', () => {
    const idx = findNearestPointIndex(10, 250, 0, 500);
    expect(idx).toBe(5);
  });
});

describe('Formatters Tests', () => {
  it('should format large market cap numbers cleanly', () => {
    expect(formatCurrency(3.16e12)).toBe('$3.16T');
    expect(formatCurrency(789.2e9)).toBe('$789.20B');
    expect(formatCurrency(45.2e6)).toBe('$45.20M');
    expect(formatCurrency(128.45)).toBe('$128.45');
  });

  it('should format percent signs', () => {
    expect(formatPercent(3.90)).toBe('+3.90%');
    expect(formatPercent(-0.51)).toBe('-0.51%');
  });
});
