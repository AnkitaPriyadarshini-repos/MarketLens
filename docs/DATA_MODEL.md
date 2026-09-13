# MarketLens Data Model & Ingestion Specification

This document details the data contracts, normalization guarantees, schema structures, and defensive error-handling mechanics used throughout MarketLens.

---

## 📐 Normalized OHLCV Contract

All financial chart visualizations in MarketLens consume market data through the normalized `OHLCPoint` interface defined in [`src/types/chart.ts`](file:///c:/Users/ankit/MarketLens/src/types/chart.ts):

```typescript
export interface OHLCPoint {
  timestamp: number; // Unix timestamp in milliseconds
  time: string;      // Human-readable formatted time string (e.g. "YYYY-MM-DD" or "HH:mm")
  open: number;      // Opening price (> 0)
  high: number;      // Period high price (high >= max(open, close))
  low: number;       // Period low price (0 < low <= min(open, close))
  close: number;     // Closing price (> 0)
  volume: number;    // Trading volume (>= 0)
}
```

---

## 🛡️ Defensive Data Handling ("Bad Data" Resilience)

Real-world financial data providers often transmit malformed, incomplete, or corrupt data payloads. MarketLens enforces strict defensive normalization through [`src/data/normalizer.ts`](file:///c:/Users/ankit/MarketLens/src/data/normalizer.ts) before any record reaches the chart engine.

### Edge Case Handling Specification

| Anomaly Type | Ingest Condition | Normalization Action | Engineering Rationale |
| :--- | :--- | :--- | :--- |
| **Missing OHLC Values** | `open`, `high`, `low`, or `close` missing or `undefined` | Replaces missing field with nearest valid numeric scalar or preceding bar's `close`. | Prevents render exceptions and layout NaN propagation. |
| **`NaN` / `Infinity`** | Price or volume values evaluate to `isNaN()` or `!isFinite()` | Clamped to `0` or fallback previous price. | Keeps Canvas `lineTo()` and scale calculations finite. |
| **Invalid High / Low** | `high < max(open, close)` or `low > min(open, close)` | Forces `high = Math.max(open, close, high)` and `low = Math.min(open, close, low)`. | Guarantees candle wick lines enclose candle body. |
| **Invalid Volume** | `volume < 0`, `NaN`, or missing | Defaulted to `0`. | Prevents negative histogram bar heights. |
| **Invalid Timestamps** | Non-numeric or missing timestamp | Assigned synthetic timestamp based on index offset or current time. | Preserves sequential x-axis alignment. |
| **Duplicate Timestamps** | Consecutive records share identical `timestamp` | Deduplicated by keeping the latest record or incrementing timestamp by +1ms. | Prevents division-by-zero during interval calculations. |
| **Empty Datasets** | Raw input array is `[]` or `null` | Returns empty normalized array `[]`; chart primitives render an graceful "No Data Available" empty state. | Prevents application crash when searching unknown tickers. |
| **Single-Point Dataset** | Array containing exactly 1 bar | Returns 1-element array; `ChartScales` sets minimum price padding ($Y_{\min} \times 0.95$, $Y_{\max} \times 1.05$) to prevent $0$ divide height. | Enables rendering single-day IPOs or new listings without scale collapse. |

---

## 🔌 Data Provider Architecture

MarketLens separates data providers from visual components using the Provider Pattern ([`src/data/MarketDataProvider.js`](file:///c:/Users/ankit/MarketLens/src/data/MarketDataProvider.js)).

### Current vs. Future Integration State

- **Current Implementation**: Embedded deterministic demo datasets and synthetic generators (`generateSyntheticMarketData`) providing high-volume realistic market movements (1k to 100k points) for performance verification.
- **Future Integration Path**: REST / WebSocket adapters (e.g. Polygon.io, Alpha Vantage, Financial Modeling Prep) will plug directly into `MarketDataProvider` by implementing the `normalizeMarketData` pipeline, requiring **zero code changes** to chart rendering primitives.
