# MarketLens Visualization Engine 2.0 Architecture

The MarketLens Visualization Engine 2.0 is a unified, high-performance financial chart rendering architecture designed for high-density market analytics and interactive trading terminals.

---

## 🏛️ Pipeline Architecture

```
Data Provider
      ↓
Normalization
      ↓
Chart Model
      ↓
Scale
      ↓
Viewport
      ↓
Geometry
      ↓
Canvas Primitives
      ↓
Interaction
      ↓
Tooltip / Overlay
```

### 1. Data Provider & Normalization Layer
- **Market Data Provider** ([`src/data/MarketDataProvider.js`](file:///c:/Users/ankit/MarketLens/src/data/MarketDataProvider.js)): Abstract interface decoupling external market data APIs from UI screens.
- **Normalization Layer** ([`src/data/normalizer.ts`](file:///c:/Users/ankit/MarketLens/src/data/normalizer.ts)): Converts raw provider records into predictable `OHLCPoint` shapes with defensive fallbacks for missing/null/NaN values.
- **LTTB Downsampling Engine** ([`src/charts/core/Downsampler.ts`](file:///c:/Users/ankit/MarketLens/src/charts/core/Downsampler.ts)): Largest-Triangle-Three-Buckets algorithm reducing large datasets (1,000 to 100,000+ points) down to visible viewports while preserving price peaks and valleys.

### 2. Scale & Coordinate System ([`src/charts/core/ChartScales.ts`](file:///c:/Users/ankit/MarketLens/src/charts/core/ChartScales.ts))
- Authoritative bidirectional coordinate transformation methods:
  - `priceToY(price)` & `yToPrice(y)`
  - `indexToX(index, stepX, marginLeft)` & `xToIndex(x, stepX, marginLeft)`
  - `timeToX(timeStr, timeList)` & `xToTime(x, timeList)`
  - Binary search `findNearestPointIndex` for $O(\log N)$ hit testing.

### 3. Viewport Window Manager ([`src/charts/core/ChartViewport.ts`](file:///c:/Users/ankit/MarketLens/src/charts/core/ChartViewport.ts))
- Authoritative viewport bounds, zooming with **Focal-Point Preservation** (`zoomAtFocalIndex(factor, focalIdx)`) around mouse focus index, clamped pan boundaries, and viewport slicing.

### 4. Geometry Computation ([`src/charts/core/ChartScales.ts`](file:///c:/Users/ankit/MarketLens/src/charts/core/ChartScales.ts))
- `calculateCandleGeometry(point, index, stepX, marginLeft, priceScale)`: Computes exact candle body coordinates (`x`, `yHigh`, `yLow`, `yOpen`, `yClose`, `bodyY`, `bodyHeight`) and bullish/bearish flags.

### 5. Custom Canvas Primitives ([`src/charts/primitives/`](file:///c:/Users/ankit/MarketLens/src/charts/primitives/))
- **`CandlestickPrimitive.jsx`**: HTML5 Canvas renderer for OHLC bars, wicks, volume, price grid lines, and technical indicator lines (SMA 20, EMA 12, Bollinger Bands).
- **`VolumePrimitive.jsx`**: Canvas volume histogram primitive sharing the same viewport coordinate scale system.
- **`RsiPrimitive.jsx`**: Canvas RSI oscillator primitive with 70/30 overbought/oversold guidelines.
- **`MacdPrimitive.jsx`**: Canvas MACD histogram & signal line primitive.
- **Canvas DPR Lifecycle Handling**: `ctx.setTransform(dpr, 0, 0, dpr, 0, 0)` is used across all primitives to reset transforms and set exact devicePixelRatio scaling on every re-render without scale accumulation or memory leaks.

### 6. Synchronized Interaction Layer ([`TechnicalAnalysisScreen.jsx`](file:///c:/Users/ankit/MarketLens/src/screens/TechnicalAnalysisScreen.jsx))
- Authoritative shared `hoverIndex` state across all 4 technical panes (**Price**, **Volume**, **RSI**, **MACD**) ensuring crosshairs update simultaneously across all panes when hovering over any chart area.
- Keyboard navigation (Left <kbd>←</kbd> and Right <kbd>→</kbd> arrow keys).

---

## 📊 Recharts vs. Custom Engine Audit

- **Flagship Technical Terminal & Asset Detail Studio**: Uses 100% custom MarketLens Canvas/SVG primitives (`CandlestickPrimitive`, `VolumePrimitive`, `RsiPrimitive`, `MacdPrimitive`).
- **Overview & Secondary Dashboards**: Recharts is preserved for non-flagship overview components (e.g. portfolio allocation donut, sector overview bar chart) where simple SVG layout is appropriate.

---

## ⚡ Performance Benchmark Suite
Performance targets are validated through reproducible tests in [`scripts/benchmark.js`](file:///c:/Users/ankit/MarketLens/scripts/benchmark.js):
- Run `npm run benchmark` to execute deterministic benchmarks on 1,000, 10,000, 50,000, and 100,000 raw market data points.
