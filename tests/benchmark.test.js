import { describe, it, expect } from 'vitest';
import { lttbDownsample } from '../src/charts/core/Downsampler';
import { normalizeMarketData } from '../src/data/normalizer';
import { ChartScale, calculateCandleGeometry, findNearestPointIndex } from '../src/charts/core/ChartScales';
import { ChartViewport } from '../src/charts/core/ChartViewport';

describe('Deterministic Performance Benchmark Suite', () => {
  const pointCounts = [1000, 10000, 50000, 100000];

  pointCounts.forEach(count => {
    it(`should benchmark ${count.toLocaleString()} raw data points`, () => {
      // 1. Generation
      const tGen0 = performance.now();
      const rawData = [];
      let price = 150;
      for (let i = 0; i < count; i++) {
        price += Math.sin(i / 100);
        rawData.push({
          date: `2024-01-${i + 1}`,
          open: price,
          high: price + 2,
          low: price - 2,
          close: price + 0.5,
          price: price + 0.5,
          volume: 100000 + i * 10
        });
      }
      const tGen1 = performance.now();

      // 2. Normalization
      const tNorm0 = performance.now();
      const normalized = normalizeMarketData(rawData);
      const tNorm1 = performance.now();
      expect(normalized.length).toBe(count);

      // 3. LTTB Downsampling
      const tLttb0 = performance.now();
      const downsampled = lttbDownsample(normalized, 500);
      const tLttb1 = performance.now();
      expect(downsampled.length).toBe(500);

      // 4. Viewport Window Slicing
      const tVp0 = performance.now();
      const vp = new ChartViewport(count, 2.0, 100);
      const range = vp.getVisibleRange();
      const sliced = normalized.slice(range.startIdx, range.endIdx);
      const tVp1 = performance.now();
      expect(sliced.length).toBeGreaterThan(0);

      // 5. Candle Geometry Generation
      const tGeom0 = performance.now();
      const scale = new ChartScale(100, 200, 400, 0);
      let totalGeom = 0;
      sliced.forEach((pt, idx) => {
        const geom = calculateCandleGeometry(pt, idx, 10, 10, scale);
        if (geom) totalGeom++;
      });
      const tGeom1 = performance.now();
      expect(totalGeom).toBe(sliced.length);

      // 6. Nearest Point Hit Testing
      const tHit0 = performance.now();
      for (let k = 0; k < 1000; k++) {
        findNearestPointIndex(sliced.length, k * 0.8, 10, 800);
      }
      const tHit1 = performance.now();

      console.log(`\n--- ${count.toLocaleString()} Points ---`);
      console.log(`[Gen] ${ (tGen1 - tGen0).toFixed(2) } ms`);
      console.log(`[Norm] ${ (tNorm1 - tNorm0).toFixed(2) } ms`);
      console.log(`[LTTB] ${ (tLttb1 - tLttb0).toFixed(2) } ms`);
      console.log(`[Slicing] ${ (tVp1 - tVp0).toFixed(2) } ms`);
      console.log(`[Geometry] ${ (tGeom1 - tGeom0).toFixed(2) } ms`);
      console.log(`[HitTest 1k] ${ (tHit1 - tHit0).toFixed(2) } ms`);
    });
  });
});
