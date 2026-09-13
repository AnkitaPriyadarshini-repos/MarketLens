import React, { useState, useEffect, useRef } from 'react';
import { Cpu, Zap, Activity, RefreshCw } from 'lucide-react';
import { theme } from '../theme/designTokens';
import { lttbDownsample } from '../charts/core/Downsampler';
import { CandlestickPrimitive } from '../charts/primitives/CandlestickPrimitive';

export function PerformanceBenchmarkScreen() {
  const [pointCount, setPointCount] = useState(10000); // 1,000, 10,000, 50,000, 100,000
  const [targetDownsample, setTargetDownsample] = useState(500);
  const [fps, setFps] = useState(60);
  const [frameTime, setFrameTime] = useState(16.6);
  const [processingTime, setProcessingTime] = useState(0);
  const [downsampleLatency, setDownsampleLatency] = useState(0);
  const [renderTime, setRenderTime] = useState(0);
  const [benchmarkData, setBenchmarkData] = useState([]);

  // FPS Animation Frame loop measuring true browser performance
  const requestRef = useRef();
  const lastTimeRef = useRef(performance.now());
  const frameCountRef = useRef(0);

  useEffect(() => {
    const loop = (now) => {
      frameCountRef.current++;
      const delta = now - lastTimeRef.current;
      if (delta >= 1000) {
        const currentFps = Math.round((frameCountRef.current * 1000) / delta);
        setFps(currentFps);
        setFrameTime(parseFloat((1000 / Math.max(1, currentFps)).toFixed(2)));
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }
      requestRef.current = requestAnimationFrame(loop);
    };

    requestRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  // Run Real Benchmark Tests
  const runBenchmark = () => {
    const t0 = performance.now();
    
    // 1. Data Processing Step
    const raw = [];
    let price = 100;
    for (let i = 0; i < pointCount; i++) {
      price += (Math.random() - 0.49) * 2;
      raw.push({
        date: `P-${i}`,
        open: price,
        high: price + Math.random(),
        low: price - Math.random(),
        close: price,
        price: price,
        volume: Math.floor(Math.random() * 10000)
      });
    }
    const t1 = performance.now();
    setProcessingTime(parseFloat((t1 - t0).toFixed(2)));

    // 2. LTTB Downsampling Step
    const sampled = lttbDownsample(raw, targetDownsample);
    const t2 = performance.now();
    setDownsampleLatency(parseFloat((t2 - t1).toFixed(2)));

    // 3. Render Setup
    setBenchmarkData(sampled);
    setRenderTime(parseFloat((performance.now() - t2).toFixed(2)));
  };

  useEffect(() => {
    runBenchmark();
  }, [pointCount, targetDownsample]);

  return (
    <div style={{ width: '100%', fontFamily: theme.fonts.main, color: theme.colors.textPrimary }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        background: theme.colors.bgCard,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radius.xl,
        padding: '20px'
      }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={20} color={theme.colors.accentCyan} /> Real-Time Graphics & Downsampling Benchmark
          </h2>
          <span style={{ fontSize: '12px', color: theme.colors.textMuted }}>
            Empirical Performance Telemetry (1,000 - 100,000 Raw Points Downsampled via LTTB)
          </span>
        </div>

        <button
          onClick={runBenchmark}
          style={{
            padding: '8px 16px',
            borderRadius: theme.radius.md,
            background: theme.colors.accentPrimary,
            color: '#fff',
            border: 'none',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <RefreshCw size={14} /> Run Benchmark
        </button>
      </div>

      {/* Telemetry Metrics Panel */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{ background: theme.colors.bgCard, border: `1px solid ${theme.colors.border}`, borderRadius: theme.radius.xl, padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: theme.colors.textMuted }}>BROWSER FPS</div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: fps >= 55 ? theme.colors.gain : theme.colors.loss, fontFamily: theme.fonts.mono, marginTop: '4px' }}>
            {fps} FPS
          </div>
        </div>

        <div style={{ background: theme.colors.bgCard, border: `1px solid ${theme.colors.border}`, borderRadius: theme.radius.xl, padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: theme.colors.textMuted }}>FRAME TIME</div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: theme.colors.accentCyan, fontFamily: theme.fonts.mono, marginTop: '4px' }}>
            {frameTime} ms
          </div>
        </div>

        <div style={{ background: theme.colors.bgCard, border: `1px solid ${theme.colors.border}`, borderRadius: theme.radius.xl, padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: theme.colors.textMuted }}>DATA GENERATION TIME</div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: theme.colors.accentPurple, fontFamily: theme.fonts.mono, marginTop: '4px' }}>
            {processingTime} ms
          </div>
        </div>

        <div style={{ background: theme.colors.bgCard, border: `1px solid ${theme.colors.border}`, borderRadius: theme.radius.xl, padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: theme.colors.textMuted }}>LTTB DOWNSAMPLE LATENCY</div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: theme.colors.accentGold, fontFamily: theme.fonts.mono, marginTop: '4px' }}>
            {downsampleLatency} ms
          </div>
        </div>

        <div style={{ background: theme.colors.bgCard, border: `1px solid ${theme.colors.border}`, borderRadius: theme.radius.xl, padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: theme.colors.textMuted }}>RAW / VISIBLE RATIO</div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#fff', fontFamily: theme.fonts.mono, marginTop: '8px' }}>
            {pointCount.toLocaleString()} : {benchmarkData.length}
          </div>
        </div>
      </div>

      {/* Dataset Controls */}
      <div style={{
        background: theme.colors.bgCard,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radius.xl,
        padding: '20px',
        marginBottom: '24px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '24px',
        alignItems: 'center'
      }}>
        <div>
          <label style={{ fontSize: '12px', fontWeight: 700, color: theme.colors.textSecondary, display: 'block', marginBottom: '6px' }}>
            Raw Dataset Point Count
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[1000, 10000, 50000, 100000].map(cnt => (
              <button
                key={cnt}
                onClick={() => setPointCount(cnt)}
                style={{
                  padding: '6px 14px',
                  borderRadius: theme.radius.sm,
                  border: pointCount === cnt ? `1px solid ${theme.colors.accentPrimary}` : `1px solid ${theme.colors.border}`,
                  background: pointCount === cnt ? theme.colors.accentPrimary : theme.colors.bgCardElevated,
                  color: pointCount === cnt ? '#fff' : theme.colors.textMuted,
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {cnt >= 1000 ? `${cnt / 1000}k` : cnt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Rendered Benchmark Viewport */}
      <div style={{
        background: theme.colors.bgCard,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radius.xl,
        padding: '20px'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: 800, marginTop: 0, marginBottom: '16px', color: theme.colors.textSecondary }}>
          Canvas Viewport Output (LTTB Downsampled {pointCount.toLocaleString()} -&gt; {benchmarkData.length} points)
        </h3>
        <CandlestickPrimitive data={benchmarkData} height={350} showVolume={true} showSma={true} demoDataLabel={true} />
      </div>
    </div>
  );
}
