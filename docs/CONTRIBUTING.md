# Contributing to MarketLens

Thank you for your interest in contributing to MarketLens! We welcome bug fixes, performance enhancements, documentation improvements, and architectural refinements.

---

## 🚀 Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/AnkitaPriyadarshini-repos/MarketLens.git
   cd MarketLens
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start local development server**:
   ```bash
   npm run dev
   ```

4. **Run static typecheck & tests**:
   ```bash
   npm run typecheck
   npm test
   ```

---

## 🌿 Branch Naming Conventions

All work should be submitted via pull requests from clean branch names following this structure:

- `feature/<short-description>` — New application capabilities or chart UI components
- `fix/<short-description>` — Bug fixes or data handling corrections
- `perf/<short-description>` — Performance optimizations in downsampling or rendering primitives
- `docs/<short-description>` — Documentation updates or benchmark methodology refinements

---

## 📝 Commit Conventions

We follow clear, imperative commit messages:

- `feat: add RSI 14-period indicator primitive`
- `fix: clamp viewport index during rapid zoom out`
- `perf: optimize LTTB bucket triangle area calculation`
- `docs: document defensive normalization edge cases`
- `refactor: extract candle geometry transformer`

---

## 🧪 Pre-Submission Checklist

Before creating a Pull Request, verify that all local checks pass:

1. **Type Check**: `npm run typecheck` (Must complete with zero errors)
2. **Unit Tests**: `npm test` (All 24+ unit tests must pass)
3. **Build Pass**: `npm run build` (Vite production build must compile cleanly)
4. **Performance Check** *(for `perf/` or core engine changes)*: `npm run benchmark` (Verify no latency regressions on 1k–100k datasets)

---

## 📥 Pull Request Expectations

- Include a clear summary of what changes were made and why.
- For visual chart changes, attach a screenshot or GIF demonstrating the rendering outcome.
- Ensure all CI workflow checks pass in GitHub Actions.
