import { describe, it, expect } from 'vitest';
import { lttbDownsample } from '../src/charts/core/Downsampler';
import { calculateIndicators } from '../src/charts/indicators/technicalMath';
import { ChartScale, findNearestPointIndex, calculateCandleGeometry } from '../src/charts/core/ChartScales';
import { ChartViewport } from '../src/charts/core/ChartViewport';
import { normalizeMarketData } from '../src/data/normalizer';
import { formatCurrency, formatPercent } from '../src/utils/formatters';

describe('ChartScale Unit Tests', () => {
  it('should compute priceToY and yToPrice accurately', () => {
    const scale = new ChartScale(100, 200, 400, 0); // inverted canvas Y
    expect(scale.priceToY(100)).toBe(400);
    expect(scale.priceToY(200)).toBe(0);
    expect(scale.priceToY(150)).toBe(200);
  });

  it('should handle priceToY and yToPrice round-trip conversion', () => {
    const scale = new ChartScale(50, 150, 300, 50);
    const testPrices = [50, 75, 100, 125, 150];
    testPrices.forEach(p => {
      const y = scale.priceToY(p);
      const roundTrip = scale.yToPrice(y);
      expect(roundTrip).toBeCloseTo(p, 5);
    });
  });

  it('should convert indexToX and xToIndex correctly', () => {
    const x = ChartScale.indexToX(4, 20, 10);
    expect(x).toBe(10 + 4 * 20 + 10); // 100

    const idx = ChartScale.xToIndex(100, 20, 10, 50);
    expect(idx).toBe(4);
  });

  it('should convert timeToX and xToTime cleanly', () => {
    const timeList = ['09:30', '10:00', '10:30', '11:00'];
    const x = ChartScale.timeToX('10:30', timeList, 10, 200);
    const timeStr = ChartScale.xToTime(x, timeList, 10, 200);
    expect(timeStr).toBe('10:30');
  });

  it('should handle edge cases: empty arrays, invalid values, zero dimensions defensively', () => {
    expect(ChartScale.timeToX('10:00', [], 10, 100)).toBe(10);
    expect(ChartScale.xToTime(50, [], 10, 100)).toBe('');
    
    const scaleNaN = new ChartScale(NaN, NaN, 0, 100);
    expect(scaleNaN.priceToY(NaN)).toBe(0);
    expect(scaleNaN.yToPrice(null)).toBe(0);

    expect(ChartScale.indexToX(NaN, NaN)).toBe(10);
    expect(ChartScale.xToIndex(NaN, NaN, 10, 0)).toBe(0);
  });
});

describe('ChartViewport Unit Tests', () => {
  it('should initialize with default 1.0 zoom level and 0 pan offset', () => {
    const vp = new ChartViewport(100);
    expect(vp.zoomLevel).toBe(1.0);
    expect(vp.panOffset).toBe(0);
    expect(vp.getVisibleRange().visibleCount).toBe(100);
  });

  it('should clamp zoom level within valid limits [1.0, 20.0]', () => {
    const vpMin = new ChartViewport(100, 0.2, 0);
    expect(vpMin.zoomLevel).toBe(1.0);

    const vpMax = new ChartViewport(100, 50.0, 0);
    expect(vpMax.zoomLevel).toBe(20.0);
  });

  it('should preserve focal point index when zooming', () => {
    const vp = new ChartViewport(100, 1.0, 0);
    const focalIndex = 75;
    const zoomed = vp.zoomAtFocalIndex(2.0, focalIndex);
    const range = zoomed.getVisibleRange();

    expect(range.startIdx).toBeLessThanOrEqual(focalIndex);
    expect(range.endIdx).toBeGreaterThanOrEqual(focalIndex);
  });

  it('should handle pan limits and clamping correctly', () => {
    const vp = new ChartViewport(100, 2.0, 0);
    const panned = vp.pan(20);
    expect(panned.getVisibleRange().startIdx).toBe(20);

    const overPanned = vp.pan(999);
    expect(overPanned.getVisibleRange().endIdx).toBe(100);
  });

  it('should reset viewport to initial state', () => {
    const vp = new ChartViewport(100, 4.0, 35);
    const resetVp = vp.reset();
    expect(resetVp.zoomLevel).toBe(1.0);
    expect(resetVp.panOffset).toBe(0);
  });

  it('should handle tiny, single-point, and empty datasets gracefully', () => {
    const vpEmpty = new ChartViewport(0);
    expect(vpEmpty.getVisibleRange().visibleCount).toBeGreaterThan(0);

    const vpSingle = new ChartViewport(1);
    expect(vpSingle.getVisibleRange().visibleCount).toBeGreaterThan(0);
  });

  it('should handle repeated zooming and panning operations stably', () => {
    let vp = new ChartViewport(100, 1.0, 0);
    for (let i = 0; i < 5; i++) {
      vp = vp.zoomAtFocalIndex(1.2, 50).pan(5);
    }
    const range = vp.getVisibleRange();
    expect(range.startIdx).toBeGreaterThanOrEqual(0);
    expect(range.endIdx).toBeLessThanOrEqual(100);
  });
});

describe('Candle Geometry Unit Tests', () => {
  const priceScale = new ChartScale(90, 110, 300, 0);

  it('should calculate bullish candle geometry correctly', () => {
    const bullPoint = { date: 'D1', open: 95, high: 108, low: 92, close: 105, price: 105, volume: 1000 };
    const geom = calculateCandleGeometry(bullPoint, 0, 20, 10, priceScale);

    expect(geom.isBullish).toBe(true);
    expect(geom.yClose).toBeLessThan(geom.yOpen); // higher price is smaller Y on inverted canvas
    expect(geom.bodyHeight).toBeGreaterThan(0);
  });

  it('should calculate bearish candle geometry correctly', () => {
    const bearPoint = { date: 'D2', open: 105, high: 108, low: 92, close: 95, price: 95, volume: 1000 };
    const geom = calculateCandleGeometry(bearPoint, 0, 20, 10, priceScale);

    expect(geom.isBullish).toBe(false);
    expect(geom.yOpen).toBeLessThan(geom.yClose);
    expect(geom.bodyHeight).toBeGreaterThan(0);
  });

  it('should calculate flat doji candle with minimum body height', () => {
    const flatPoint = { date: 'D3', open: 100, high: 105, low: 95, close: 100, price: 100, volume: 1000 };
    const geom = calculateCandleGeometry(flatPoint, 0, 20, 10, priceScale);

    expect(geom.bodyHeight).toBeGreaterThanOrEqual(1.5);
  });

  it('should handle malformed OHLC point with missing or null values gracefully', () => {
    const malformed = { date: 'D4', open: null, high: undefined, low: NaN, close: 100, price: 100, volume: -50 };
    expect(() => calculateCandleGeometry(malformed, 0, 20, 10, priceScale)).not.toThrow();
  });
});

describe('Nearest-Point Hit-Testing Unit Tests', () => {
  it('should find first, middle, and last point correctly', () => {
    const totalCount = 10;
    const marginLeft = 10;
    const chartWidth = 200;

    // First point
    expect(findNearestPointIndex(totalCount, 15, marginLeft, chartWidth)).toBe(0);
    // Middle point
    expect(findNearestPointIndex(totalCount, 110, marginLeft, chartWidth)).toBe(5);
    // Last point
    expect(findNearestPointIndex(totalCount, 195, marginLeft, chartWidth)).toBe(9);
  });

  it('should clamp bounds for outside-left and outside-right coordinates', () => {
    const totalCount = 10;
    const marginLeft = 10;
    const chartWidth = 200;

    // Outside-left
    expect(findNearestPointIndex(totalCount, -50, marginLeft, chartWidth)).toBe(0);
    // Outside-right
    expect(findNearestPointIndex(totalCount, 999, marginLeft, chartWidth)).toBe(9);
  });

  it('should return -1 for empty dataset', () => {
    expect(findNearestPointIndex(0, 100, 10, 200)).toBe(-1);
  });
});

describe('LTTB Downsampling Unit Tests', () => {
  it('should return empty array for empty data or invalid input', () => {
    expect(lttbDownsample([], 10)).toEqual([]);
    expect(lttbDownsample(null, 10)).toEqual([]);
  });

  it('should preserve first and last points in output', () => {
    const data = Array.from({ length: 50 }, (_, i) => ({
      date: `D-${i}`, open: i, high: i + 1, low: i, close: i, price: i, volume: 100
    }));
    const result = lttbDownsample(data, 10);
    expect(result.length).toBe(10);
    expect(result[0]).toEqual(data[0]);
    expect(result[result.length - 1]).toEqual(data[data.length - 1]);
  });

  it('should produce deterministic output for identical input', () => {
    const data = Array.from({ length: 100 }, (_, i) => ({
      date: `D-${i}`, open: Math.sin(i), high: Math.sin(i) + 1, low: Math.sin(i) - 1, close: Math.sin(i), price: Math.sin(i), volume: 500
    }));
    const run1 = lttbDownsample(data, 15);
    const run2 = lttbDownsample(data, 15);
    expect(run1).toEqual(run2);
  });
});

describe('Data Normalizer & Technical Math Tests', () => {
  it('should normalize raw market data defensively', () => {
    const raw = [
      { date: '2024-01-01', open: 100, high: 105, low: 95, close: 102, volume: 1000 },
      { date: null, open: NaN, high: null, low: undefined, close: null, volume: -500 }
    ];
    const normalized = normalizeMarketData(raw);

    expect(normalized.length).toBe(2);
    expect(normalized[0].volume).toBe(1000);
    expect(normalized[1].volume).toBe(0); // negative volume normalized to 0
    expect(typeof normalized[1].open).toBe('number');
    expect(typeof normalized[1].close).toBe('number');
  });

  it('should calculate SMA, EMA, RSI, MACD, and Bollinger Bands cleanly', () => {
    const raw = Array.from({ length: 60 }, (_, i) => ({
      date: `2024-01-${i + 1}`,
      open: 100 + i,
      high: 105 + i,
      low: 98 + i,
      close: 102 + i,
      price: 102 + i,
      volume: 500000 + i * 1000
    }));
    const calculated = calculateIndicators(normalizeMarketData(raw));

    expect(calculated.length).toBe(60);
    expect(typeof calculated[30].rsi).toBe('number');
    expect(calculated[30].rsi).toBeGreaterThanOrEqual(0);
    expect(calculated[30].rsi).toBeLessThanOrEqual(100);
    expect(calculated[30].bollingerUpper).toBeGreaterThanOrEqual(calculated[30].bollingerLower);
  });
});
