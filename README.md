# MarketLens

High-performance financial analytics and visualization platform built around a custom interactive chart engine.

[![CI Workflow](https://github.com/AnkitaPriyadarshini-repos/MarketLens/actions/workflows/ci.yml/badge.svg)](https://github.com/AnkitaPriyadarshini-repos/MarketLens/actions/workflows/ci.yml)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)
![React](https://img.shields.io/badge/React-18.2-61dafb.svg)
![Vite](https://img.shields.io/badge/Vite-5.1-646cff.svg)
![Vitest](https://img.shields.io/badge/Vitest-1.3-green.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

MarketLens is a web-first financial analytics application designed for high-density market data visualization, real-time technical analysis, synchronized multi-pane charting, and deterministic data downsampling.

---

## 📸 Overview

![MarketLens Technical Terminal](assets/screenshots/technical-analysis.png)

*MarketLens 4-pane synchronized technical analysis studio featuring Candlestick OHLC, Volume, RSI oscillator, and MACD indicators with unified crosshairs.*

---

## 🎯 Engineering Purpose & Motivation

Financial data applications face unique technical challenges on the modern web:

- Rendering high-density time-series data (10k–100k+ records) in browser viewports without dropping frame rates.
- Synchronizing cursor hover states, tooltips, and time axes seamlessly across distinct chart indicator panes.
- Preventing visual artifacts or scale collapses when consuming messy, unnormalized market data APIs.
- Retaining key price peaks and valleys during data downsampling.

MarketLens addresses these challenges by replacing generic charting wrappers with a **custom HTML5 Canvas rendering engine** paired with **bidirectional scale mapping**, **focal-point viewport windowing**, and **LTTB downsampling**.

---

## ⚡ Features

### 📊 Financial Visualization Engine
- **Custom HTML5 Canvas Rendering**: High-performance OHLC candlestick renderer with dynamic devicePixelRatio scaling.
- **Synchronized Multi-Pane Layout**: Unified x-axis time alignment across Price, Volume, RSI, and MACD charts.
- **Interactive Shared Crosshair**: Single cursor position synchronized simultaneously across all 4 visual panes.
- **Viewport Zoom & Pan**: Mouse wheel focal zooming (`zoomAtFocalIndex`) and smooth offset panning with boundary safety.
- **Overlay Technical Indicators**: Simple Moving Average (SMA), Exponential Moving Average (EMA), and Bollinger Bands.
- **LTTB Downsampling**: Largest-Triangle-Three-Buckets algorithm to downsample high-density datasets while preserving price extrema.

### 💼 Portfolio & Market Analytics
- **Market Dashboard**: Ticker tape, top market movers, global indices, and stock search modal.
- **Interactive Market Heatmap**: Sector performance matrix visualization grouped by market capitalization.
- **Calendar Heatmap**: Activity and return distribution visualization across calendar timeframes.
- **Portfolio Tracker**: Asset allocation breakdown, position management, and performance tracking.
- **Watchlist & Alerts**: Custom stock tracking lists and price threshold notification configuration.
- **AI Financial Analyst Modal**: Interactive contextual ticker summary and financial insight modal.
- **Engine Performance Benchmark Studio**: Interactive benchmark suite for evaluating normalization and downsampling latency.

---

## 🏛️ System Architecture

```
Market Data Provider
        ↓
Defensive Normalization
        ↓
  Chart Viewport
        ↓
 LTTB Downsampler
        ↓
 Bidirectional Scale
        ↓
Geometry Calculation
        ↓
 Custom Canvas Render
        ↓
Synchronized Interaction
        ↓
  Crosshair / Tooltip
```

### Architectural Pipeline Breakdown
1. **Data Ingestion**: Fetching raw ticker payloads from [`MarketDataProvider`](file:///c:/Users/ankit/MarketLens/src/data/MarketDataProvider.js).
2. **Defensive Normalization**: Sanitizing missing/null/NaN values into predictable `OHLCPoint` schemas ([`normalizer.ts`](file:///c:/Users/ankit/MarketLens/src/data/normalizer.ts)).
3. **Viewport Management**: Computing visible slice boundaries and focal-point zoom offsets ([`ChartViewport.ts`](file:///c:/Users/ankit/MarketLens/src/charts/core/ChartViewport.ts)).
4. **LTTB Downsampling**: Reducing high-count points to visible target resolutions ([`Downsampler.ts`](file:///c:/Users/ankit/MarketLens/src/charts/core/Downsampler.ts)).
5. **Scale Transformation**: Converting price and time indices to exact pixel coordinates ([`ChartScales.ts`](file:///c:/Users/ankit/MarketLens/src/charts/core/ChartScales.ts)).
6. **Geometry Generation**: Computing pixel coordinates for candle wicks, bodies, and grid overlays.
7. **Canvas Rendering**: Direct 2D canvas drawing with DPR transform reset passes ([`CandlestickPrimitive.jsx`](file:///c:/Users/ankit/MarketLens/src/charts/primitives/CandlestickPrimitive.jsx)).
8. **Synchronized Hover**: Broadcasting a shared `hoverIndex` across all chart panes.

📖 *For a complete architectural deep-dive, see [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).*

---

## 🚀 Flagship Technical Analysis Engine

Unlike traditional charting setups that rely on heavy DOM nodes, MarketLens implements a dedicated Canvas pipeline:

- **Coordinate Scaling (`ChartScales.ts`)**: Pure mathematical mapping between data values ($[P_{\min}, P_{\max}]$) and pixel dimensions ($[0, \text{Height}]$), supporting $O(\log N)$ binary search hit testing (`findNearestPointIndex`).
- **Device Pixel Ratio Scaling**: Handles Retina displays automatically by multiplying canvas backing store size by `window.devicePixelRatio` and applying `ctx.setTransform(dpr, 0, 0, dpr, 0, 0)` per frame.
- **Focal-Point Zooming**: Zooming via mouse wheel stays centered directly under the user's cursor index rather than jumping to the start of the series.
- **Pane Synchronization**: Mouse movement on any pane calculates the active data index and highlights corresponding price levels on all adjacent panes.

📖 *Read more in [`docs/CHART_ENGINE.md`](docs/CHART_ENGINE.md).*

---

## 🛡️ Data Handling & Defensive Normalization

Real-world financial data feeds frequently emit malformed records. MarketLens enforces strict defensive guarantees:

```typescript
export interface OHLCPoint {
  timestamp: number;
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}
```

### Anomaly Mitigation Rules
- **Missing / NaN Prices**: Substituted with nearest valid scalar or prior bar close.
- **Inverted High/Low**: Corrected so $H = \max(O, C, H)$ and $L = \min(O, C, L)$.
- **Negative / Null Volume**: Defaulted to `0`.
- **Empty / Single-Bar Datasets**: Safely handled with scale padding without divide-by-zero errors.

📖 *Full specification available at [`docs/DATA_MODEL.md`](docs/DATA_MODEL.md).*

---

## 🔬 Performance Metrics & Benchmarks

Performance is measured via reproducible Vitest benchmark suites operating on N synthetic market records:

| Dataset Size | Data Normalization | LTTB Downsampling | Viewport Slicing | Hit Testing (1,000 Lookups) |
| :--- | :--- | :--- | :--- | :--- |
| **1,000 points** | ~0.15 ms | ~0.35 ms | ~0.02 ms | ~0.10 ms |
| **10,000 points** | ~1.20 ms | ~3.80 ms | ~0.04 ms | ~0.12 ms |
| **50,000 points** | ~6.50 ms | ~18.50 ms | ~0.05 ms | ~0.15 ms |
| **100,000 points** | ~13.10 ms | ~37.20 ms | ~0.06 ms | ~0.18 ms |

*Note: Environment measurements taken on Node 20 / Intel Core i7 / Windows 11. Run `npm run benchmark` to measure on your local environment.*

📖 *Detailed methodology available at [`docs/PERFORMANCE.md`](docs/PERFORMANCE.md).*

---

## 🛠️ Quick Start & Developer Setup

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation & Execution
```bash
# 1. Clone the repository
git clone https://github.com/AnkitaPriyadarshini-repos/MarketLens.git
cd MarketLens

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev

# 4. Execute static type check
npm run typecheck

# 5. Run test suite
npm test

# 6. Run performance benchmarks
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
│   └── ISSUE_TEMPLATE/            # GitHub issue templates
│
├── assets/
│   └── screenshots/               # Screenshot catalog & visuals
│
├── docs/
│   ├── ARCHITECTURE.md            # System architecture blueprint
│   ├── CHART_ENGINE.md            # Chart engine deep-dive & rendering math
│   ├── DATA_MODEL.md              # OHLCV contract & defensive normalization
│   ├── PERFORMANCE.md             # Benchmark methodology & metrics
│   ├── TESTING.md                 # Test suite inventory & QA workflow
│   └── CONTRIBUTING.md            # Contribution guidelines & branch conventions
│
├── scripts/
│   └── benchmark.test.js          # Vitest benchmark suite
│
├── src/
│   ├── charts/
│   │   ├── core/                  # Scales, Viewport, Downsampler
│   │   └── primitives/            # Candlestick, Volume, RSI, MACD primitives
│   │
│   ├── components/                # UI layout, modals, header, navigation
│   ├── data/                      # MarketDataProvider, data normalizer
│   ├── screens/                   # Dashboard, Technical Analysis, Portfolio, etc.
│   ├── types/                     # TypeScript types and OHLC schemas
│   ├── utils/                     # Formatters & helper utilities
│   ├── App.jsx                    # Core application router & shell
│   └── main.jsx                   # Application entrypoint
│
├── tests/                         # Unit tests (scales, viewport, downsampler, normalizer)
├── CONTRIBUTING.md                # Root contribution summary
├── LICENSE                        # MIT License
├── package.json                   # Metadata & scripts
└── README.md                      # Primary documentation
```

---

## 📚 Documentation Index

- [Architecture Blueprint](docs/ARCHITECTURE.md)
- [Chart Engine Deep Dive](docs/CHART_ENGINE.md)
- [Data Model & Defensive Handling](docs/DATA_MODEL.md)
- [Performance & Benchmarks](docs/PERFORMANCE.md)
- [Testing Specification](docs/TESTING.md)
- [Contribution Guidelines](docs/CONTRIBUTING.md)

---

## 🏆 Engineering Quality & Standards

- **Strict TypeScript Integration**: Type assertions and interface definitions for all chart scale primitives.
- **Defensive Error Resilience**: Normalizes bad inputs (NaN, null, inverted high/low) without rendering failure.
- **Automated Test Coverage**: 100% pass rate across coordinate math, downsampling, and normalization test suites.
- **Reproducible Performance**: Deterministic benchmark suite validating downsampling performance on up to 100,000 raw points.
- **Continuous Integration**: Automated GitHub Actions CI validating type checking, unit tests, and production build output on every push.

---

## 📄 License

This project is open source under the terms of the [MIT License](LICENSE).
