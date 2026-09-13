# MarketLens

[![CI Workflow](https://github.com/AnkitaPriyadarshini-repos/MarketLens/actions/workflows/ci.yml/badge.svg)](https://github.com/AnkitaPriyadarshini-repos/MarketLens/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-61dafb.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.1-646cff.svg)](https://vitejs.dev/)
[![Vitest](https://img.shields.io/badge/Vitest-1.3-green.svg)](https://vitest.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A high-performance financial analytics and visualization platform built around a custom interactive chart engine.

MarketLens is a web-first financial analytics platform engineered for high-density time-series data rendering, interactive technical analysis, multi-pane indicator crosshairs, and resilient data processing.

---

## Features Available

- [Market Dashboard](#1-market-dashboard)
- [Technical Analysis Studio](#2-technical-analysis-studio)
- [Candlestick & Technical Overlays](#3-candlestick--technical-overlays)
- [Volume Analysis](#4-volume-analysis)
- [RSI Oscillator](#5-rsi-oscillator)
- [MACD Terminal](#6-macd-terminal)
- [Market Sector Heatmap](#7-market-sector-heatmap)
- [Calendar Heatmap](#8-calendar-heatmap)
- [Portfolio Tracker & Allocation](#9-portfolio-tracker--allocation)
- [Watchlist & Price Alerts](#10-watchlist--price-alerts)
- [News & Events Stream](#11-news--events-stream)
- [AI Financial Analyst Interface](#12-ai-financial-analyst-interface)
- [Engine Performance Benchmark Studio](#13-engine-performance-benchmark-studio)

---

## Chart Engine & Utilities

- [`ChartScales`](#chartscales) — Bidirectional coordinate transformation math ($O(\log N)$ hit testing)
- [`ChartViewport`](#chartviewport) — Viewport windowing, focal-point zoom, and pan boundary clamping
- [`Downsampler`](#downsampler) — Largest-Triangle-Three-Buckets (LTTB) point reduction
- [`normalizer`](#market-data-normalizer) — Defensive OHLCV data normalization and sanitization
- [`CandlestickPrimitive`](#candlestickprimitive) — HTML5 Canvas candlestick and overlay primitive
- [`VolumePrimitive`](#volumeprimitive) — Canvas volume histogram primitive
- [`RsiPrimitive`](#rsiprimitive) — Canvas RSI oscillator primitive
- [`MacdPrimitive`](#macdprimitive) — Canvas MACD histogram & signal primitive

---

## Installation

### Prerequisites

Ensure your environment meets the minimum version requirements:

- **Node.js**: `>= 18.0.0`
- **npm**: `>= 9.0.0`
- **Modern Browser**: Chrome, Firefox, Safari, or Edge with HTML5 Canvas 2D support.

### Clone the Repository

```bash
git clone https://github.com/AnkitaPriyadarshini-repos/MarketLens.git
cd MarketLens
```

### Install Dependencies

```bash
npm install
```

### Run Local Development Server

```bash
npm run dev
```

The application will start on `http://localhost:5173`.

### Verification Commands

```bash
# Execute TypeScript static typecheck
npm run typecheck

# Run Vitest unit test suite (24 tests)
npm test

# Run deterministic benchmark suite (1k to 100k points)
npm run benchmark

# Compile Vite production build
npm run build
```

---

## Compatibility

| Environment | Requirement | Status |
| :--- | :--- | :--- |
| **Node.js Environment** | Node.js `>= 18.0.0` | Verified |
| **Package Manager** | npm `>= 9.0.0` | Verified |
| **TypeScript Compiler** | TypeScript `5.3+` (Strict Mode) | Verified |
| **Supported Browsers** | Chrome 90+, Firefox 88+, Safari 14+, Edge 90+ | Supported |
| **Display Support** | High-DPI (Retina) `devicePixelRatio` | Built-in |
| **Target Viewport** | Desktop & Tablet landscapes (Recommended width `>= 1024px`) | Optimized |

---

## Important Notes

> [!IMPORTANT]
> **Web-First React + TypeScript Platform**  
> MarketLens is built strictly for the modern web using React 18, TypeScript 5.3, Vite, HTML5 Canvas 2D APIs, and Tailwind CSS design tokens. It is **not** built with React Native or React Native Skia.

> [!NOTE]
> **Simulated Demo Data Architecture**  
> MarketLens currently operates on deterministic synthetic data generators and embedded market datasets. To connect external live feeds (e.g., Polygon.io, Alpha Vantage, Financial Modeling Prep), pass payloads through the [`MarketDataProvider`](src/data/MarketDataProvider.js) and [`normalizer`](src/data/normalizer.ts) pipeline.

> [!TIP]
> **Dual Visualization Architecture**  
> Flagship financial terminals (Technical Analysis, Asset Detail Studio) use custom HTML5 Canvas primitives (`CandlestickPrimitive`, `VolumePrimitive`, `RsiPrimitive`, `MacdPrimitive`) for frame performance. Secondary summary charts (portfolio allocation pie charts, overview bars) use Recharts SVG.

---

## Bad Data & Edge Case Resilience

Market data API payloads often contain null values, missing fields, zero-range prices, or out-of-order timestamps. MarketLens enforces strict defensive normalization in [`src/data/normalizer.ts`](src/data/normalizer.ts) before records enter the chart scale pipeline:

| Anomaly Type | Condition | Defensive Mitigation Action |
| :--- | :--- | :--- |
| **Missing Prices** | `open`, `high`, `low`, or `close` missing or `undefined` | Replaced with nearest valid numeric scalar or preceding bar's `close`. |
| **`NaN` / `Infinity`** | Value evaluates to `isNaN()` or `!isFinite()` | Clamped to `0` or fallback previous price to keep Canvas math finite. |
| **Inverted High/Low** | `high < max(open, close)` or `low > min(open, close)` | Forced to $H = \max(O, C, H)$ and $L = \min(O, C, L)$ to preserve wick geometry. |
| **Negative Volume** | `volume < 0` or missing | Defaulted to `0` to prevent negative bar height calculation errors. |
| **Duplicate Timestamps** | Consecutive records share identical timestamps | Deduplicated or incremented by +1ms to maintain strictly monotonic x-scale steps. |
| **Empty Datasets** | Raw array is `[]` or `null` | Rendering primitives display a clean "No Data Available" state without throwing errors. |
| **Single-Point Data** | Array contains exactly 1 bar | `ChartScales` applies synthetic $\pm 5\%$ price bounds padding to prevent zero height collapse. |

---

## Detailed Feature Sections

### 1. Market Dashboard

The primary hub providing an immediate overview of global equity markets, major index tickers, sector momentum, and quick search navigation.

#### Features
- Real-time ticker tape displaying global indices (S&P 500, Nasdaq, Dow Jones, FTSE 100, Nikkei 225).
- Quick asset search modal supporting instant filtering by ticker symbol or company name.
- Sector performance card grid.
- Key market statistics (Volume, Market Cap, 24h gainers/losers).

![Market Lens Dashboard](assets/screenshots/dashboard.png)

#### Quick Start / Code Snippet
```jsx
import { DashboardScreen } from './screens/DashboardScreen';

export function App() {
  return <DashboardScreen onSelectTicker={(symbol) => console.log('Selected:', symbol)} />;
}
```

#### Component Reference
| Prop Name | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `onSelectTicker` | `(ticker: string) => void` | `undefined` | Callback fired when a user selects a ticker from search or top movers. |

---

### 2. Technical Analysis Studio

The flagship 4-pane synchronized workstation built for in-depth technical analysis across Candlestick, Volume, RSI, and MACD indicators.

#### Features
- **Shared Timeline Alignment**: X-axis coordinate synchronicity across all 4 stacked chart panes.
- **Unified Crosshairs**: Moving pointer highlights exact date, price, volume, RSI, and MACD metrics simultaneously.
- **Focal-Point Zoom & Pan**: Mouse wheel focal zooming centered at cursor index with safety clamping.
- **Timeframe Selector**: Instant switching across `1D`, `1W`, `1M`, `1Y`, `ALL`.
- **Keyboard Navigation**: Left <kbd>←</kbd> and Right <kbd>→</kbd> arrow key step navigation across historical data points.

![Technical Analysis Studio](assets/screenshots/technical-analysis.png)

#### Quick Start / Code Snippet
```jsx
import { TechnicalAnalysisScreen } from './screens/TechnicalAnalysisScreen';

export function TechnicalTerminal() {
  return <TechnicalAnalysisScreen activeTicker="AAPL" timeframe="1Y" />;
}
```

#### Component Reference
| Prop Name | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `activeTicker` | `string` | `"AAPL"` | Ticker symbol to load into technical analysis panes. |
| `timeframe` | `string` | `"1M"` | Active viewport timeframe selection (`1D`, `1W`, `1M`, `1Y`, `ALL`). |
| `showIndicators` | `boolean` | `true` | Toggles display of SMA, EMA, and Bollinger overlay lines. |

> [!TIP]
> Use the mouse wheel while hovering over any chart pane to zoom in and out around your cursor position.

---

### 3. Candlestick & Technical Overlays

Custom HTML5 Canvas primitive rendering OHLC candlestick bars, wicks, price grid lines, and overlay indicators.

#### Features
- High-frequency HTML5 Canvas 2D rendering pipeline.
- Automatic devicePixelRatio compensation preventing blurriness on Retina displays.
- SMA 20 / SMA 50 overlay lines.
- EMA 12 / EMA 26 overlay lines.
- Bollinger Bands upper/lower volatility envelope lines.

#### Quick Start / Code Snippet
```jsx
import { CandlestickPrimitive } from './charts/primitives/CandlestickPrimitive';

<CandlestickPrimitive
  data={ohlcPoints}
  height={380}
  showSma={true}
  showBollinger={true}
  zoomLevel={1.5}
  panOffset={10}
  onHoverPoint={(pt, idx) => setHoverInfo(pt)}
/>
```

#### API Reference
| Prop Name | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `data` | `OHLCPoint[]` | `[]` | Normalized array of OHLC data points. |
| `height` | `number` | `380` | Canvas element height in pixels. |
| `showSma` | `boolean` | `true` | Toggles Simple Moving Average (SMA 20) overlay line. |
| `showEma` | `boolean` | `false` | Toggles Exponential Moving Average (EMA 12) overlay line. |
| `showBollinger` | `boolean` | `false` | Toggles Bollinger Bands upper/lower envelope lines. |
| `zoomLevel` | `number` | `1.0` | Active zoom scale factor (1.0x to 20.0x). |
| `panOffset` | `number` | `0` | Starting index offset for viewport pan. |
| `onHoverPoint` | `(point: OHLCPoint, index: number) => void` | `null` | Hover callback returning active data point and index. |

---

### 4. Volume Analysis

Synchronized Canvas histogram primitive rendering trading volume bars directly below OHLC candles.

#### Features
- Color-coded volume bars (Green for bullish close $\ge$ open, Red for bearish close $<$ open).
- Max volume scaling calculated relative to current viewport slice.
- Hover overlay broadcasting exact volume numbers.

#### Component Reference
| Prop Name | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `data` | `OHLCPoint[]` | `[]` | Data point array containing volume values. |
| `height` | `number` | `120` | Canvas pane height in pixels. |
| `externalHoverIndex` | `number \| null` | `null` | Synchronized cursor index passed from parent pane. |

---

### 5. RSI Oscillator

Canvas primitive rendering the Relative Strength Index (RSI 14-period) oscillator pane with overbought/oversold boundaries.

#### Features
- Continuous RSI oscillator line rendering.
- 70 overbought and 30 oversold horizontal guideline markers.
- Dynamic color highlighting when RSI enters overbought (>70) or oversold (<30) regions.

#### Component Reference
| Prop Name | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `data` | `OHLCPoint[]` | `[]` | Data array containing `rsi` indicator values. |
| `height` | `number` | `120` | Pane height in pixels. |
| `overbought` | `number` | `70` | Upper threshold line level. |
| `oversold` | `number` | `30` | Lower threshold line level. |

---

### 6. MACD Terminal

Canvas primitive rendering Moving Average Convergence Divergence (MACD) signal line, MACD line, and center histogram.

#### Features
- MACD Line (Fast EMA - Slow EMA) and Signal Line (9-period EMA of MACD Line).
- Color-coded histogram bars around $0.0$ center axis.
- Aligned crosshair tracking with parent price pane.

#### Component Reference
| Prop Name | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `data` | `OHLCPoint[]` | `[]` | Data array containing `macdLine`, `macdSignal`, and `macdHist`. |
| `height` | `number` | `130` | MACD pane canvas height in pixels. |

---

### 7. Market Sector Heatmap

Interactive matrix visualizer representing equities grouped by sector and sized by market capitalization.

#### Features
- Color intensity reflecting 24-hour price change percentage.
- Market capitalization proportional block layout.
- Filter by market sector (Technology, Healthcare, Financials, Energy, Consumer Cyclical).

![Market Sector Heatmap](assets/screenshots/market-heatmap.png)

---

### 8. Calendar Heatmap

GitHub-style annual trading calendar heatmap displaying daily performance intensity and activity metrics across trading days.

#### Features
- Year/month calendar block grid rendering.
- Tooltip on hover displaying trading date, daily return %, and traded volume.
- Interactive year navigation controls.

---

### 9. Portfolio Tracker & Allocation

Comprehensive portfolio holdings management screen with asset allocation distribution charts and equity performance tracking.

#### Features
- Portfolio equity distribution donut chart.
- Position table listing shares owned, average cost basis, current price, total value, and unrealized gain/loss.
- Real-time portfolio total value summary cards.

![Portfolio Analytics](assets/screenshots/portfolio.png)

---

### 10. Watchlist & Price Alerts

Custom asset tracking hub with price alert threshold configuration.

#### Features
- Custom watchlist item creation and deletion.
- Target price alert trigger configuration (Alert above / Alert below).
- Mini sparkline chart previews for tracked assets.

![Watchlist & Alerts](assets/screenshots/watchlist.png)

---

### 11. News & Events Stream

Financial news aggregator feed providing market news items, sentiment tagging, and economic calendar event listings.

#### Features
- Categorized news feed (Market News, Earnings Reports, Macroeconomics).
- Sentiment indicator tags (Bullish, Bearish, Neutral).
- Filter news feed by specific asset ticker symbol.

---

### 12. AI Financial Analyst Interface

Contextual AI assistant modal providing automated financial insights, technical indicator summaries, and asset overview notes.

#### Features
- Ticker-specific technical summary generation.
- Support level and resistance level estimation.
- Key financial metrics synthesis.

---

### 13. Engine Performance Benchmark Studio

Interactive testing studio built directly into the application ([`PerformanceBenchmarkScreen.jsx`](src/screens/PerformanceBenchmarkScreen.jsx)) allowing real-time benchmarking of data normalization, viewport slicing, LTTB downsampling, and hit testing.

#### Features
- Benchmark data sizes: 1,000 points, 10,000 points, 50,000 points, and 100,000 points.
- Real-time execution timing graphs and execution logs.
- Trigger benchmarks directly in-browser or via CLI (`npm run benchmark`).

---

## Types & Data Reference

The authoritative TypeScript type interfaces are defined in [`src/types/chart.ts`](src/types/chart.ts):

### `OHLCPoint`

```typescript
export interface OHLCPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  price: number;
  volume: number;

  // Optional Technical Indicators
  sma20?: number | null;
  sma50?: number | null;
  ema12?: number | null;
  ema26?: number | null;
  wma14?: number | null;
  vwap?: number | null;
  bollingerUpper?: number | null;
  bollingerMiddle?: number | null;
  bollingerLower?: number | null;
  rsi?: number | null;
  macdLine?: number | null;
  macdSignal?: number | null;
  macdHist?: number | null;
  stochK?: number | null;
  stochD?: number | null;
  atr?: number | null;
  obv?: number | null;
}
```

### `ViewportRange`

```typescript
export interface ViewportRange {
  startIdx: number;
  endIdx: number;
  visibleCount: number;
}
```

### `CandleGeometry`

```typescript
export interface CandleGeometry {
  x: number;
  yHigh: number;
  yLow: number;
  yOpen: number;
  yClose: number;
  bodyY: number;
  bodyHeight: number;
  candleWidth: number;
  isBullish: boolean;
}
```

### `TooltipModel`

```typescript
export interface TooltipModel {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  change: number;
  changePercent: number;
  rsi?: number | null;
  macdLine?: number | null;
}
```

---

## Technical Utilities

### `ChartScales`

Module providing pure mathematical coordinate transformation methods between price/time domains and screen pixel dimensions.

- **Path**: [`src/charts/core/ChartScales.ts`](src/charts/core/ChartScales.ts)
- **Key Methods**:
  - `priceToY(price: number): number` — Maps price value to canvas Y pixel coordinate.
  - `yToPrice(y: number): number` — Inverse conversion mapping canvas Y pixel to price value.
  - `ChartScale.indexToX(index: number, stepX: number, marginLeft: number): number` — Maps array index to X pixel coordinate.
  - `ChartScale.xToIndex(x: number, stepX: number, marginLeft: number, totalCount: number): number` — Inverse X pixel to index conversion.
  - `findNearestPointIndex(dataLength: number, mouseX: number, marginLeft: number, chartWidth: number): number` — $O(\log N)$ binary search hit testing.
  - `calculateCandleGeometry(point, index, stepX, marginLeft, priceScale): CandleGeometry` — Candle geometry transformer.

---

### `ChartViewport`

Immutable viewport window manager handling zoom levels, pan offsets, and visible range calculations.

- **Path**: [`src/charts/core/ChartViewport.ts`](src/charts/core/ChartViewport.ts)
- **Key Methods**:
  - `getVisibleRange(): ViewportRange` — Computes active `startIdx`, `endIdx`, and `visibleCount`.
  - `zoomAtFocalIndex(factor: number, focalIdx: number | null): ChartViewport` — Zooms relative to a specific mouse focus index.
  - `pan(deltaBars: number): ChartViewport` — Pans the visible window by N bar offsets with boundary clamping.
  - `reset(): ChartViewport` — Resets zoom to 1.0x and pan to offset 0.

---

### `Downsampler`

Implementation of the Largest-Triangle-Three-Buckets (LTTB) downsampling algorithm for high-density time-series data.

- **Path**: [`src/charts/core/Downsampler.ts`](src/charts/core/Downsampler.ts)
- **Key Function**:
  - `lttbDownsample(data: OHLCPoint[], threshold: number): OHLCPoint[]` — Downsamples input series down to `threshold` points while preserving local min/max price triangles.

---

### Market Data Normalizer

Defensive data pipeline transforming raw JSON payloads into validated `OHLCPoint` arrays.

- **Path**: [`src/data/normalizer.ts`](src/data/normalizer.ts)
- **Key Function**:
  - `normalizeMarketData(rawData: any[]): OHLCPoint[]` — Coerces missing/null fields, clamps `NaN`/`Infinity`, enforces high $\ge$ low constraints, and defaults invalid volumes.

---

## Future Roadmap

- [ ] **WebSocket Live Streaming**: Add real-time streaming WebSocket adapter in [`MarketDataProvider.js`](src/data/MarketDataProvider.js).
- [ ] **Order Book Depth Visualizer**: Interactive Canvas-based L2 market depth (bid/ask volume ladder) primitive.
- [ ] **Custom Indicator Scripting Engine**: User-definable custom technical indicator math expressions.
- [ ] **Multi-Chart Grid Layouts**: Split-screen multi-asset comparison views (2x2 and 1x2 terminal layouts).
- [ ] **Export Options**: Export high-resolution chart images (PNG/SVG) and CSV data tables.

---

## Contributing

We welcome community contributions! Please review our [Contribution Guidelines](CONTRIBUTING.md) for complete details on:

- **Branch Naming Conventions**: `feature/<name>`, `fix/<name>`, `perf/<name>`, `docs/<name>`
- **Commit Standards**: Imperative commit messages (e.g. `feat: add VWAP indicator primitive`)
- **Pre-Submission Verification**: Running `npm run typecheck`, `npm test`, `npm run benchmark`, and `npm run build` prior to opening a Pull Request.

---

## License

MarketLens is open-source software licensed under the terms of the [MIT License](LICENSE).
