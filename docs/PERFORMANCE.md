# MarketLens Chart Engine Performance & Benchmark Methodology

This document outlines the benchmarking methodology, dataset sizes, operations measured, and local reproduction commands for evaluating the MarketLens Visualization Engine 2.0.

---

## 🔬 Benchmark Methodology

All performance measurements are executed deterministically on generated synthetic market data to ensure 100% reproducible results without random jitter or network latency.

### Datasets Tested
- **1,000 points** (1k raw bars)
- **10,000 points** (10k raw bars)
- **50,000 points** (50k raw bars)
- **100,000 points** (100k raw bars)

### Operations Measured
1. **Data Generation (`[Gen]`)**: Time to construct N raw market records in memory.
2. **Data Normalization (`[Norm]`)**: Time to run `normalizeMarketData()` ensuring non-null, valid numeric values.
3. **LTTB Downsampling (`[LTTB]`)**: Largest-Triangle-Three-Buckets reduction of raw points to 500 target points.
4. **Viewport Slicing (`[Viewport]`)**: Time to compute visible range indices via `ChartViewport` and slice the data window.
5. **OHLC Candle Geometry (`[Geometry]`)**: Time to map slice points to `CandleGeometry` bounds (`x`, `yHigh`, `yLow`, `yOpen`, `yClose`, `bodyY`, `bodyHeight`).
6. **Hit Testing (`[HitTest]`)**: Execution time of 1,000 consecutive binary-search nearest-point lookups (`findNearestPointIndex`).

---

## 🏃 How to Run Benchmarks

To execute the benchmark suite locally, run:

```bash
npm run benchmark
```

---

## 🛡️ Detecting Regression Thresholds
- **LTTB Downsampling**: Downsampling 100,000 raw points should complete in under 150ms.
- **Hit Testing**: 1,000 coordinate lookups should execute in under 10ms.
- **Frame Rate**: Canvas render cycle must maintain 60 FPS during cursor scrubbing.
