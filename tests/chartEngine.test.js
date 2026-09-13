import { describe, it, expect } from 'vitest';
import { lttbDownsample } from '../src/charts/core/Downsampler';
import { calculateIndicators } from '../src/charts/indicators/technicalMath';
import { ChartScale, findNearestPointIndex } from '../src/charts/core/ChartScales';
import { formatCurrency, formatPercent } from '../src/utils/formatters';

describe('LTTB Downsampling Algorithm Tests', () => {
  it('should return empty array when data is empty', () => {
    expect(lttbDownsample([], 10)).toEqual([]);
    expect(lttbDownsample(null, 10)).toEqual([]);
  });

  it('should return original data if threshold is >= data length', () => {
    const data = [{ price: 10 }, { price: 20 }, { price: 30 }];
    expect(lttbDownsample(data, 5)).toEqual(data);
  });

  it('should downsample 100 points to exactly target threshold', () => {
    const data = Array.from({ length: 100 }, (_, i) => ({ price: Math.sin(i) * 50 + 100 }));
    const result = lttbDownsample(data, 20);
    expect(result.length).toBe(20);
    expect(result[0]).toEqual(data[0]); // first point preserved
    expect(result[result.length - 1]).toEqual(data[data.length - 1]); // last point preserved
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

    // SMA 20 should be null for first 19 bars and a number afterwards
    expect(calculated[0].sma20).toBeNull();
    expect(typeof calculated[25].sma20).toBe('number');
    expect(calculated[25].sma20).toBeGreaterThan(0);

    // RSI should be between 0 and 100
    expect(typeof calculated[30].rsi).toBe('number');
    expect(calculated[30].rsi).toBeGreaterThanOrEqual(0);
    expect(calculated[30].rsi).toBeLessThanOrEqual(100);

    // Bollinger Upper should be >= Bollinger Lower
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
    const data = Array.from({ length: 10 });
    const idx = findNearestPointIndex(data, 250, 0, 500);
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
