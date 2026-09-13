# MarketLens

A high-performance financial analytics and visualization platform built around a custom interactive chart engine.

[![CI Workflow](https://github.com/AnkitaPriyadarshini-repos/MarketLens/actions/workflows/ci.yml/badge.svg)](https://github.com/AnkitaPriyadarshini-repos/MarketLens/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-61dafb.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.1-646cff.svg)](https://vitejs.dev/)
[![Vitest](https://img.shields.io/badge/Vitest-1.3-green.svg)](https://vitest.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

MarketLens is a web-first financial analytics platform focused on high-density market visualization, interactive technical analysis, synchronized multi-pane charting, and resilient market-data processing.

---

## 📸 Overview

![MarketLens Technical Terminal](assets/screenshots/technical-analysis.png)

*MarketLens 4-pane synchronized technical analysis studio featuring Candlestick OHLC, Volume, RSI oscillator, and MACD indicators with unified crosshairs.*

---

## 🎯 Why MarketLens?

Modern web-based financial analytics platforms demand high-density rendering, precise technical analysis, and instant interactive feedback. Traditional charting components often struggle under these constraints, leading to dropped frames during zooming/panning, misaligned indicator crosshairs, or visual glitches when handling malformed data API feeds.

MarketLens was built from the ground up to solve these core engineering challenges:

- **High-Density Rendering**: Rendering time-series datasets (from 1,000 up to 100,000+ points) smoothly in browser viewports.
- **Focal-Point Zoom & Pan**: Interactive zooming centered precisely at mouse focus index with safety boundary clamping.
- **Synchronized Multi-Pane Panes**: Coordinating price, volume, RSI, and MACD indicator charts on a shared temporal x-axis.
- **Unified Crosshairs**: Real-time cursor tracking synchronized simultaneously across multiple distinct Canvas rendering surfaces.
- **Defensive Data Handling**: Normalizing incomplete, missing, or corrupt market data feeds before rendering.
- **Deterministic Downsampling**: Using the Largest-Triangle-Three-Buckets (LTTB) algorithm to preserve critical price peaks and valleys while reducing render density.
- **Maintainable Modular Architecture**: Decoupling coordinate mathematics, viewport windowing, geometry calculations, and rendering primitives into testable TypeScript modules.

---

## ⚡ Features

### 📊 Financial Visualization
- **Candlestick OHLC Charts**: Custom HTML5 Canvas rendering engine for OHLC bars, wicks, grid lines, and price scales.
- **Volume Histogram**: Synchronized Canvas volume renderer with bullish/bearish color coding.
- **RSI Oscillator**: Relative Strength Index pane with 70/30 overbought/oversold threshold lines.
- **MACD Terminal**: Moving Average Convergence Divergence pane with MACD line, signal line, and histogram.
- **Synchronized Crosshair**: Multi-pane pointer tracking broadcasting unified cursor position across all active panes.
- **Interactive Zoom & Pan**: Mouse wheel focal zooming (`zoomAtFocalIndex`) and smooth pan dragging.
- **Viewport Boundary Clamping**: Defensive viewport constraints preventing negative indices or empty chart spaces.
- **Technical Overlays**: Simple Moving Average (SMA 20/50), Exponential Moving Average (EMA 12/26), and Bollinger Bands.
- **Canvas DPR Scaling**: High-DPI (Retina) display support via `window.devicePixelRatio` store scaling.

### 💼 Market Analytics Workspace
- **Market Dashboard**: Ticker tape, top market movers, global indices overview, and instant search modal.
- **Market Heatmap**: Interactive sector performance matrix categorized by market capitalization and 24h return.
- **Calendar Heatmap**: Activity and return distribution visualization across trading calendar dates.
- **Portfolio Tracker**: Asset allocation distribution, holdings breakdown, and total equity analytics.
- **Watchlist & Alerts**: Stock tracking list with custom price threshold alerts.
- **AI Analyst Interface**: Contextual market commentary and technical analysis modal.
- **Benchmark Studio**: Built-in engine performance test suite for validating normalization and downsampling latency.

*Note: MarketLens currently operates on simulated demo datasets and synthetic benchmark generators. Future live provider integration is supported via the `MarketDataProvider` abstraction.*

---

## 🛠️ Interactive Chart Engine

MarketLens replaces generic charting wrappers with an optimized 8-stage pipeline:

```
Raw Market Data
      ↓
Normalization
      ↓
 Chart Model
      ↓
   Viewport
      ↓
 Scale Mapping
      ↓
   Geometry
      ↓
Canvas Primitives
      ↓
  Interaction
      ↓
Crosshair / Tooltip
```

### Core Engine Components

| Component | Responsibility | Repository Link |
| :--- | :--- | :--- |
| **`ChartScales`** | Bidirectional coordinate mapping (`priceToY`, `yToPrice`, `indexToX`, `xToIndex`) & binary search hit testing | [`src/charts/core/ChartScales.ts`](src/charts/core/ChartScales.ts) |
| **`ChartViewport`** | Visible slice range calculation, focal-point zoom, and boundary clamping | [`src/charts/core/ChartViewport.ts`](src/charts/core/ChartViewport.ts) |
| **`Downsampler`** | Largest-Triangle-Three-Buckets (LTTB) point reduction for dense series | [`src/charts/core/Downsampler.ts`](src/charts/core/Downsampler.ts) |
| **`normalizer`** | Defensive OHLCV data sanitization and missing field coercion | [`src/data/normalizer.ts`](src/data/normalizer.ts) |
| **`CandlestickPrimitive`** | HTML5 Canvas OHLC candlestick, wick, and indicator overlay rendering | [`src/charts/primitives/CandlestickPrimitive.jsx`](src/charts/primitives/CandlestickPrimitive.jsx) |
| **`VolumePrimitive`** | Canvas volume histogram rendering synchronized with price scale | [`src/charts/primitives/VolumePrimitive.jsx`](src/charts/primitives/VolumePrimitive.jsx) |
| **`RsiPrimitive`** | Canvas RSI oscillator pane rendering with 70/30 guideline overlays | [`src/charts/primitives/RsiPrimitive.jsx`](src/charts/primitives/RsiPrimitive.jsx) |
| **`MacdPrimitive`** | Canvas MACD signal, line, and histogram rendering | [`src/charts/primitives/MacdPrimitive.jsx`](src/charts/primitives/MacdPrimitive.jsx) |

---

## 🎨 How MarketLens Renders a Chart

MarketLens executes a deterministic rendering loop on every frame pass:

1. **Data Normalization**: Raw payload records pass through [`normalizer.ts`](src/data/normalizer.ts) to guarantee non-null, valid numeric `OHLCPoint` shapes.
2. **Viewport Selection**: [`ChartViewport.ts`](src/charts/core/ChartViewport.ts) calculates the active visible slice range (`startIdx` to `endIdx`) based on current zoom level and pan offset.
3. **Downsampling**: If the visible slice contains more data points than visible screen pixel resolution, [`Downsampler.ts`](src/charts/core/Downsampler.ts) applies LTTB downsampling to preserve min/max price extrema.
4. **Scale Transformation**: [`ChartScales.ts`](src/charts/core/ChartScales.ts) computes bidirectional linear scale factors mapping price ranges ($[P_{\min}, P_{\max}]$) to canvas pixel heights ($[0, H]$) and indices to pixel x-offsets.
5. **Geometry Generation**: Candlestick wick coordinates (`yHigh`, `yLow`), body rectangles (`bodyY`, `bodyHeight`), indicator polyline paths, and volume bars are calculated into geometric structs.
6. **Canvas Rendering**: Rendering primitives draw directly to 2D HTML5 Canvas contexts, applying `ctx.setTransform(dpr, 0, 0, dpr, 0, 0)` for crisp high-DPI rendering.
7. **Interaction Resolution**: Pointer movement over any chart pane triggers $O(\log N)$ binary search hit testing (`findNearestPointIndex`), broadcasting a shared `hoverIndex` to render aligned crosshairs and tooltips across all panes.

---

## 🛡️ Data Model & Defensive Handling

All financial data structures conform to the authoritative `OHLCPoint` schema defined in [`src/types/chart.ts`](src/types/chart.ts):

```typescript
export interface OHLCPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  price: number;
  volume: number;
  sma20?: number | null;
  ema12?: number | null;
  bollingerUpper?: number | null;
  rsi?: number | null;
  macdLine?: number | null;
}
```

### Anomaly Mitigation Matrix

| Anomaly Type | Condition | Defensive Mitigation Action |
| :--- | :--- | :--- |
| **Missing Fields** | `open`, `high`, `low`, or `close` is missing/null | Replaced with nearest valid numeric scalar or preceding bar's `close`. |
| **`NaN` / `Infinity`** | Value evaluates to `isNaN()` or `!isFinite()` | Clamped to `0` or fallback previous price to keep calculations finite. |
| **Inverted High/Low** | `high < max(open, close)` or `low > min(open, close)` | Forced to $H = \max(O, C, H)$ and $L = \min(O, C, L)$ to preserve wick integrity. |
| **Negative Volume** | `volume < 0` or missing | Defaulted to `0` to prevent negative bar height rendering. |
| **Duplicate Timestamps** | Consecutive records share identical timestamps | Deduplicated or offset by +1ms to maintain strictly monotonic x-scaling. |
| **Empty Datasets** | Raw array is `[]` or `null` | Renderers display a clean "No Data Available" state without crashing. |
| **Single-Point Data** | Array contains exactly 1 bar | `ChartScales` applies synthetic $\pm 5\%$ price padding to prevent $0$ height collapse. |

📖 *Read the complete specification in [`docs/DATA_MODEL.md`](docs/DATA_MODEL.md).*

---

## 🔬 Performance Methodology & Benchmarks

Performance targets are validated using deterministic Vitest benchmark suites operating on N synthetic market records:

| Dataset Size | Data Normalization | LTTB Downsampling | Viewport Slicing | Hit Testing (1,000 Lookups) |
| :--- | :--- | :--- | :--- | :--- |
| **1,000 points** | ~0.15 ms | ~0.35 ms | ~0.02 ms | ~0.10 ms |
| **10,000 points** | ~1.20 ms | ~3.80 ms | ~0.04 ms | ~0.12 ms |
| **50,000 points** | ~6.50 ms | ~18.50 ms | ~0.05 ms | ~0.15 ms |
| **100,000 points** | ~13.10 ms | ~37.20 ms | ~0.06 ms | ~0.18 ms |

*Note: Benchmarks measured locally using Node 20 / Vitest 1.3 on synthetic OHLC datasets. Run `npm run benchmark` to evaluate performance on your local system.*

📖 *See detailed methodology in [`docs/PERFORMANCE.md`](docs/PERFORMANCE.md).*

---

## 🚀 Quick Start & Developer Setup

### Prerequisites
- **Node.js**: `>= 18.0.0`
- **npm**: `>= 9.0.0`

### Setup Commands
```bash
# 1. Clone the repository
git clone https://github.com/AnkitaPriyadarshini-repos/MarketLens.git
cd MarketLens

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev

# 4. Run static typecheck
npm run typecheck

# 5. Execute unit tests
npm test

# 6. Execute performance benchmarks
npm run benchmark

# 7. Build production bundle
npm run build
```

---

## 📁 Project Structure

```
MarketLens/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                 # GitHub Actions CI workflow
│   │   └── benchmark.yml          # GitHub Actions benchmark workflow
│   └── ISSUE_TEMPLATE/            # Issue templates (bug report, feature, perf)
│
├── assets/
│   └── screenshots/               # Screenshot documentation & visual assets
│
├── docs/
│   ├── ARCHITECTURE.md            # Architecture blueprint & canvas pipeline
│   ├── CHART_ENGINE.md            # Chart engine rendering math & coordinate scales
│   ├── DATA_MODEL.md              # OHLCV contract & defensive normalization spec
│   ├── PERFORMANCE.md             # Performance methodology & benchmark details
│   ├── TESTING.md                 # Test suite inventory & QA guidelines
│   └── CONTRIBUTING.md            # Detailed contribution standards
│
├── scripts/
│   └── benchmark.test.js          # Vitest benchmark suite
│
├── src/
│   ├── charts/
│   │   ├── core/                  # ChartScales, ChartViewport, Downsampler
│   │   └── primitives/            # Candlestick, Volume, RSI, MACD primitives
│   │
│   ├── components/                # UI modals, navigation, headers, search
│   ├── data/                      # MarketDataProvider, data normalizer
│   ├── screens/                   # Dashboard, Technical Analysis, Portfolio, etc.
│   ├── types/                     # TypeScript types and OHLC schemas
│   ├── utils/                     # Formatters & helper utilities
│   ├── App.jsx                    # Core router & application shell
│   └── main.jsx                   # React entry point
│
├── tests/                         # Unit tests (scales, viewport, downsampler, normalizer)
├── CONTRIBUTING.md                # Root contribution summary
├── LICENSE                        # MIT License
├── package.json                   # Metadata & scripts
└── README.md                      # Primary documentation
```

---

## 📚 Documentation Index

- 🏛️ [System Architecture Blueprint](docs/ARCHITECTURE.md)
- 📈 [Chart Engine Deep Dive](docs/CHART_ENGINE.md)
- 🛡️ [Data Model & Defensive Handling](docs/DATA_MODEL.md)
- 🔬 [Performance & Benchmark Methodology](docs/PERFORMANCE.md)
- 🧪 [Testing Specification](docs/TESTING.md)
- 🌿 [Contribution Guidelines](docs/CONTRIBUTING.md)

---

## 🏆 Engineering Quality

- **Strict TypeScript**: Full static type definitions across coordinate scales, viewports, and primitives.
- **Defensive Error Handling**: Automatic recovery from malformed, null, or out-of-order OHLC records.
- **Comprehensive Unit Testing**: 100% test pass rate across scale transformations, viewport windowing, and LTTB downsampling.
- **Reproducible Performance Benchmarks**: Automated Vitest suite measuring timing across 1k, 10k, 50k, and 100k data points.
- **Continuous Integration (CI)**: GitHub Actions workflow validating typecheck, unit tests, and Vite build on every push.

---

## ⚠️ Current Limitations & Data Disclaimer

- **Simulated Market Data**: MarketLens currently utilizes embedded synthetic demo market data generators for development, testing, and benchmarking. It does not connect to live stock exchanges or real-time WebSocket broker feeds.
- **Viewport Target**: Optimized for modern desktop and tablet browsers (Chrome, Firefox, Safari, Edge). Mobile chart controls are functional but desktop displays provide the ideal multi-pane experience.

---

## 🌿 Contributing

Contributions are welcome! Please review our [Contribution Guidelines](CONTRIBUTING.md) for branch naming conventions (`feature/`, `fix/`, `perf/`, `docs/`), commit standards, and pull request expectations.

---

## 📄 License

This project is open-source software licensed under the [MIT License](LICENSE).
