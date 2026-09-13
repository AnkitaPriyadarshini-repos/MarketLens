# MarketLens Testing & Quality Assurance Architecture

MarketLens relies on comprehensive automated testing, static type checking, and deterministic performance benchmarks to guarantee system reliability and mathematical correctness.

---

## 🧪 Testing Philosophy

Financial chart engines require strict mathematical precision. A single rounding error or coordinate miscalculation can lead to invalid price level representation or cursor offset bugs.

Our testing strategy prioritizes:
1. **Mathematical Invariance**: Verifying that `yToPrice(priceToY(P)) == P` within numerical tolerance.
2. **Defensive Normalization**: Ensuring malformed datasets do not cause runtime crashes or rendering freezes.
3. **Viewport Bounds Preservation**: Validating zoom/pan boundary clamping under extreme user interaction.
4. **Downsampling Fidelity**: Confirming that LTTB algorithm retains global price min/max bounds.

---

## 🛠️ Test Execution Suite

### 1. Unit & Integration Tests
Runs the Vitest test runner across all test modules in `tests/`:

```bash
npm test
```

### 2. TypeScript Static Typecheck
Validates all TypeScript source files without producing build output:

```bash
npm run typecheck
```

### 3. Deterministic Performance Benchmark
Executes the benchmark suite on N synthetic market records (1k, 10k, 50k, 100k points):

```bash
npm run benchmark
```

### 4. Production Build Verification
Ensures Vite bundle compiles cleanly:

```bash
npm run build
```

---

## 📂 Test Suite Inventory

| Test Module | Location | Purpose | Key Assertions Covered |
| :--- | :--- | :--- | :--- |
| **`normalizer.test.js`** | [`tests/normalizer.test.js`](file:///c:/Users/ankit/MarketLens/tests/normalizer.test.js) | Defensive Data Sanitization | missing fields, NaN/Infinity, high/low correction, negative volume, empty arrays, duplicate timestamps |
| **`chartScales.test.js`** | [`tests/chartScales.test.js`](file:///c:/Users/ankit/MarketLens/tests/chartScales.test.js) | Coordinate Math & Searching | `priceToY`, `yToPrice`, `indexToX`, `xToIndex`, binary search `findNearestPointIndex` bounds |
| **`downsampler.test.js`** | [`tests/downsampler.test.js`](file:///c:/Users/ankit/MarketLens/tests/downsampler.test.js) | LTTB Downsampling Engine | output bucket length, retention of global min/max price points, small dataset passthrough |
| **`viewport.test.js`** | [`tests/viewport.test.js`](file:///c:/Users/ankit/MarketLens/tests/viewport.test.js) | Viewport Windowing & Zoom | focal index preservation during zoom, pan boundary clamping, valid index slicing |
| **`benchmark.test.js`** | [`scripts/benchmark.test.js`](file:///c:/Users/ankit/MarketLens/scripts/benchmark.test.js) | Engine Performance Benchmarks | execution timing metrics for 1k, 10k, 50k, and 100k point synthetic datasets |

---

## 🤖 Continuous Integration (CI)

Every commit and pull request triggers our GitHub Actions workflow ([`.github/workflows/ci.yml`](file:///c:/Users/ankit/MarketLens/.github/workflows/ci.yml)), executing:
1. `npm ci`
2. `npm run typecheck`
3. `npm test`
4. `npm run build`
