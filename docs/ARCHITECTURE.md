# MarketLens System Architecture

MarketLens is a web-first, high-performance financial analytics and data visualization platform built with React, TypeScript, Vite, and HTML5 Canvas.

The primary architectural objective of MarketLens is to provide high-density financial charts with real-time mouse interaction, deterministic downsampling, and synchronized multi-pane crosshairs without rendering bottlenecks.

---

## 🏗️ High-Level System Architecture

```
                               ┌─────────────────────────┐
                               │  Market Data Provider   │
                               │ (API / Demo Generator)  │
                               └────────────┬────────────┘
                                            │
                                            ▼
                               ┌─────────────────────────┐
                               │ Defensive Normalization │
                               │  (normalizer.ts)        │
                               └────────────┬────────────┘
                                            │
                                            ▼
                               ┌─────────────────────────┐
                               │  Chart Viewport Window  │
                               │  (ChartViewport.ts)     │
                               └────────────┬────────────┘
                                            │
                                            ▼
                               ┌─────────────────────────┐
                               │  LTTB Downsampler Engine│
                               │  (Downsampler.ts)       │
                               └────────────┬────────────┘
                                            │
                                            ▼
                               ┌─────────────────────────┐
                               │ Bidirectional Scale Map │
                               │   (ChartScales.ts)      │
                               └────────────┬────────────┘
                                            │
                                            ▼
                               ┌─────────────────────────┐
                               │ Geometry Transformer   │
                               │ (calculateCandleGeom)   │
                               └────────────┬────────────┘
                                            │
                                            ▼
                               ┌─────────────────────────┐
                               │ Custom Canvas Renderer  │
                               │(Candlestick/Volume/RSI) │
                               └────────────┬────────────┘
                                            │
                                            ▼
                               ┌─────────────────────────┐
                               │ Synchronized Interaction│
                               │ (Hover / Crosshair Sync)│
                               └─────────────────────────┘
```

---

## 🧩 Architectural Layers & Responsibilities

### 1. Data Provider Layer
- **File**: [`src/data/MarketDataProvider.js`](file:///c:/Users/ankit/MarketLens/src/data/MarketDataProvider.js)
- **Role**: Decouples data ingestion from UI components. Supplies market datasets, stock lists, news feeds, heatmaps, and financial metrics.

### 2. Defensive Normalization Layer
- **File**: [`src/data/normalizer.ts`](file:///c:/Users/ankit/MarketLens/src/data/normalizer.ts)
- **Role**: Sanitizes raw payloads into validated `OHLCPoint` instances. Sanitizes `NaN`, `null`, `undefined`, `Infinity`, negative volumes, out-of-order timestamps, and missing fields.

### 3. Viewport & Windowing Subsystem
- **File**: [`src/charts/core/ChartViewport.ts`](file:///c:/Users/ankit/MarketLens/src/charts/core/ChartViewport.ts)
- **Role**: Manages the visible slice window (`startIndex`, `endIndex`, `visibleCount`). Handles mouse wheel zooming with focal-point preservation (`zoomAtFocalIndex`), pan offset bounds clamping, and timeframe interval slicing.

### 4. Downsampling Subsystem
- **File**: [`src/charts/core/Downsampler.ts`](file:///c:/Users/ankit/MarketLens/src/charts/core/Downsampler.ts)
- **Role**: Implements the Largest-Triangle-Three-Buckets (LTTB) downsampling algorithm to reduce high-density datasets (up to 100,000 points) down to visible pixel resolutions while preserving local price extrema (peaks and troughs).

### 5. Coordinate Scaling Subsystem
- **File**: [`src/charts/core/ChartScales.ts`](file:///c:/Users/ankit/MarketLens/src/charts/core/ChartScales.ts)
- **Role**: Provides pure, bidirectional math conversions between price/index space and screen pixel space:
  - `priceToY(price)` / `yToPrice(y)`
  - `indexToX(index)` / `xToIndex(x)`
  - `timeToX(timeStr)` / `xToTime(x)`
  - `findNearestPointIndex(x)` using binary search $O(\log N)$

### 6. Canvas Rendering Primitives
- **Directory**: [`src/charts/primitives/`](file:///c:/Users/ankit/MarketLens/src/charts/primitives/)
- **Components**:
  - `CandlestickPrimitive.jsx`: Direct HTML5 Canvas renderer for OHLC candles, wicks, grid lines, and overlay indicators (SMA, EMA, Bollinger Bands).
  - `VolumePrimitive.jsx`: Canvas renderer for volume bars aligned on the x-axis scale.
  - `RsiPrimitive.jsx`: Canvas renderer for Relative Strength Index oscillator and 70/30 bounds.
  - `MacdPrimitive.jsx`: Canvas renderer for MACD signal, histogram, and centerline.
- **DPR Scaling**: Manages high-DPI (Retina) displays by scaling canvas backing store dimensions by `window.devicePixelRatio` and applying `ctx.setTransform(dpr, 0, 0, dpr, 0, 0)` on each render pass.

### 7. Synchronized Interaction & Overlays
- **Screen**: [`src/screens/TechnicalAnalysisScreen.jsx`](file:///c:/Users/ankit/MarketLens/src/screens/TechnicalAnalysisScreen.jsx)
- **Role**: Maintains a single source of truth for cursor hover index across synchronized chart panes (Price, Volume, RSI, MACD). Coordinates crosshair overlays, shared tooltips, and keyboard step navigation.

---

## 🎨 Rendering Strategy: Custom Canvas vs. Recharts

MarketLens employs a two-tier visualization strategy:

1. **Flagship Technical Terminal & Asset Detail Studio**: Powered exclusively by custom MarketLens Canvas primitives (`CandlestickPrimitive`, `VolumePrimitive`, `RsiPrimitive`, `MacdPrimitive`) for maximum frame rates, tight coordinate synchronization, and sub-millisecond redraws.
2. **Overview & Summary Dashboards**: Uses Recharts SVG charts for non-critical aggregate visualizations (e.g. portfolio allocation pie chart, sector breakdown bars) where declarative SVG layout is sufficient.

---

## 📄 Related Documentation
- [Chart Engine Deep Dive](CHART_ENGINE.md)
- [Data Model & Defensive Handling](DATA_MODEL.md)
- [Performance & Benchmarks](PERFORMANCE.md)
- [Testing Architecture](TESTING.md)
