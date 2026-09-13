import React, { useState, useEffect } from 'react';
import {
  Sliders, RefreshCw, Layers, Search, Plus, Settings,
  Maximize2, MousePointer, Crosshair, TrendingUp, Type, Grid, Move,
  Lock, EyeOff, Trash2, BarChart2, Activity
} from 'lucide-react';
import { theme } from '../../theme/designTokens';
import { formatCurrency } from '../../utils/formatters';
import { CandlestickPrimitive } from '../../charts/primitives/CandlestickPrimitive';
import { VolumePrimitive } from '../../charts/primitives/VolumePrimitive';
import { RsiPrimitive } from '../../charts/primitives/RsiPrimitive';
import { MacdPrimitive } from '../../charts/primitives/MacdPrimitive';

export function TechnicalAnalysisScreen({
  asset = null,
  marketProvider = null
}) {
  const [symbol, setSymbol] = useState(asset?.symbol || 'AAPL');
  const [timeframe, setTimeframe] = useState('15m');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTool, setActiveTool] = useState('crosshair');

  // Active Technical Indicator Toggles
  const [indicators, setIndicators] = useState({
    sma20: true,
    ema12: true,
    vwap: false,
    bollinger: true,
    volume: true,
    rsi: true,
    macd: true
  });

  // Shared Authoritative Crosshair Hover Cursor State across ALL 4 Panes
  const [hoverIndex, setHoverIndex] = useState(null);

  useEffect(() => {
    if (!marketProvider) return;
    let isMounted = true;
    setLoading(true);

    marketProvider.getHistoricalPrices(symbol, timeframe).then(chartData => {
      if (isMounted) {
        setData(chartData);
        setHoverIndex(null);
        setLoading(false);
      }
    });

    return () => { isMounted = false; };
  }, [symbol, timeframe, marketProvider]);

  const toggleIndicator = (key) => {
    setIndicators(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const activeHoverPoint = hoverIndex !== null && data[hoverIndex] ? data[hoverIndex] : (data[data.length - 1] || null);

  const currentPrice = activeHoverPoint ? activeHoverPoint.close : (asset?.price || 192.45);
  const prevPrice = data.length > 1 ? data[data.length - 2].close : (currentPrice * 0.995);
  const priceChange = currentPrice - prevPrice;
  const priceChangePct = prevPrice > 0 ? (priceChange / prevPrice) * 100 : 0.46;

  return (
    <div style={{ width: '100%', fontFamily: theme.fonts.main, color: theme.colors.textPrimary, background: '#0a0e17', borderRadius: '12px', border: '1px solid #1e2638', overflow: 'hidden' }}>
      
      {/* 1. TOP STUDIO HEADER BAR */}
      <div style={{
        background: '#111726',
        borderBottom: '1px solid #1e2638',
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Left Section: Brand & Symbol Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: theme.colors.accentPrimary, fontWeight: 800, fontSize: '15px' }}>
            <BarChart2 size={18} color="#3b82f6" /> MarketLens Studio
          </div>

          <div style={{ width: '1px', height: '20px', background: '#1e2638' }} />

          {/* Symbol & Price Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#182032', padding: '4px 10px', borderRadius: '6px', border: '1px solid #26334d' }}>
            <span style={{ fontWeight: 800, fontFamily: theme.fonts.mono, color: '#ffffff' }}>${symbol}</span>
            <span style={{ fontWeight: 700, fontFamily: theme.fonts.mono, color: priceChangePct >= 0 ? theme.colors.gain : theme.colors.loss }}>
              {formatCurrency(currentPrice)} ({priceChangePct >= 0 ? '+' : ''}{priceChangePct.toFixed(2)}%)
            </span>
            <button style={{ background: 'transparent', border: 'none', color: theme.colors.textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <Plus size={14} />
            </button>
          </div>

          {/* Timeframe Selector */}
          <div style={{ display: 'flex', gap: '2px', background: '#182032', padding: '2px', borderRadius: '6px', border: '1px solid #26334d' }}>
            {['15m', '1h', '4h', '1D', '1W'].map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                style={{
                  padding: '3px 8px',
                  borderRadius: '4px',
                  border: 'none',
                  fontSize: '11px',
                  fontFamily: theme.fonts.mono,
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: timeframe === tf ? theme.colors.accentPrimary : 'transparent',
                  color: timeframe === tf ? '#ffffff' : theme.colors.textMuted
                }}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Center/Right Section: Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Indicator Toggles */}
          {[
            { id: 'sma20', label: 'SMA 20', color: '#3b82f6' },
            { id: 'bollinger', label: 'Bollinger', color: '#8b5cf6' },
            { id: 'volume', label: 'Volume', color: '#10b981' },
            { id: 'rsi', label: 'RSI', color: '#06b6d4' },
            { id: 'macd', label: 'MACD', color: '#f59e0b' }
          ].map(ind => (
            <button
              key={ind.id}
              onClick={() => toggleIndicator(ind.id)}
              style={{
                padding: '4px 10px',
                borderRadius: '4px',
                border: indicators[ind.id] ? `1px solid ${ind.color}` : '1px solid #26334d',
                background: indicators[ind.id] ? 'rgba(30, 41, 59, 0.8)' : 'transparent',
                color: indicators[ind.id] ? ind.color : theme.colors.textMuted,
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {ind.label}
            </button>
          ))}

          <div style={{ width: '1px', height: '20px', background: '#1e2638' }} />

          <button style={{ background: '#182032', border: '1px solid #26334d', color: theme.colors.textSecondary, padding: '5px', borderRadius: '4px', cursor: 'pointer' }} title="Settings">
            <Settings size={15} />
          </button>
          <button style={{ background: '#182032', border: '1px solid #26334d', color: theme.colors.textSecondary, padding: '5px', borderRadius: '4px', cursor: 'pointer' }} title="Full Screen">
            <Maximize2 size={15} />
          </button>
        </div>
      </div>

      {/* 2. MAIN TERMINAL WORKSPACE (LEFT TOOLBAR + CHART CANVAS PANES) */}
      <div style={{ display: 'flex', width: '100%', minHeight: '620px', background: '#0d111a' }}>
        
        {/* Left Vertical Drawing Toolbar */}
        <div style={{
          width: '42px',
          background: '#111726',
          borderRight: '1px solid #1e2638',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '8px 0',
          gap: '12px'
        }}>
          {[
            { id: 'cursor', icon: MousePointer, title: 'Cursor' },
            { id: 'crosshair', icon: Crosshair, title: 'Crosshair' },
            { id: 'trendline', icon: TrendingUp, title: 'Trendline' },
            { id: 'text', icon: Type, title: 'Text Annotation' },
            { id: 'pitchfork', icon: Grid, title: 'Pitchfork & Channels' },
            { id: 'pattern', icon: Activity, title: 'Patterns' },
            { id: 'measure', icon: Move, title: 'Measurement Ruler' },
            { id: 'lock', icon: Lock, title: 'Lock All Drawings' },
            { id: 'hide', icon: EyeOff, title: 'Hide Drawings' },
            { id: 'trash', icon: Trash2, title: 'Clear Chart' }
          ].map(tool => {
            const IconComp = tool.icon;
            const isActive = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                title={tool.title}
                style={{
                  background: isActive ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                  border: 'none',
                  color: isActive ? theme.colors.accentPrimary : theme.colors.textMuted,
                  padding: '6px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <IconComp size={16} />
              </button>
            );
          })}
        </div>

        {/* Central Panes Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ height: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.colors.textMuted }}>
              <RefreshCw size={24} className="spin" style={{ marginRight: 8 }} /> Computing Financial Viewports...
            </div>
          ) : (
            <>
              {/* PANE 1: Candlestick Price Action & Overlays */}
              <div style={{ position: 'relative', borderBottom: '1px solid #1e2638' }}>
                <CandlestickPrimitive
                  data={data}
                  height={300}
                  showSma={indicators.sma20}
                  showEma={indicators.ema12}
                  showBollinger={indicators.bollinger}
                  showVwap={indicators.vwap}
                  showVolume={false}
                  externalHoverIndex={hoverIndex}
                  onHoverPoint={(pt, idx) => setHoverIndex(idx)}
                  demoDataLabel={false}
                />
              </div>

              {/* PANE 2: Synchronized Volume Histogram Pane */}
              {indicators.volume && (
                <div style={{ position: 'relative', borderBottom: '1px solid #1e2638' }}>
                  <VolumePrimitive
                    data={data}
                    height={95}
                    hoverIndex={hoverIndex}
                    onHoverIndex={setHoverIndex}
                  />
                </div>
              )}

              {/* PANE 3: Synchronized RSI (14) Oscillator Pane */}
              {indicators.rsi && (
                <div style={{ position: 'relative', borderBottom: '1px solid #1e2638' }}>
                  <RsiPrimitive
                    data={data}
                    height={100}
                    hoverIndex={hoverIndex}
                    onHoverIndex={setHoverIndex}
                  />
                </div>
              )}

              {/* PANE 4: Synchronized MACD (12, 26, 9) Histogram Pane */}
              {indicators.macd && (
                <div style={{ position: 'relative' }}>
                  <MacdPrimitive
                    data={data}
                    height={105}
                    hoverIndex={hoverIndex}
                    onHoverIndex={setHoverIndex}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* 3. BOTTOM TIME SCALE & TIME RANGE FOOTER BAR */}
      <div style={{
        background: '#111726',
        borderTop: '1px solid #1e2638',
        padding: '6px 16px',
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        fontSize: '11px',
        fontFamily: theme.fonts.mono,
        color: theme.colors.textMuted
      }}>
        {/* Quick Range Selection */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {['15m', '5D', '1M', '3M', '1Y', '5Y', 'All'].map(range => (
            <button
              key={range}
              onClick={() => setTimeframe(range)}
              style={{
                background: timeframe === range ? '#182032' : 'transparent',
                border: timeframe === range ? '1px solid #26334d' : 'none',
                color: timeframe === range ? '#ffffff' : theme.colors.textMuted,
                padding: '2px 8px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 700
              }}
            >
              {range}
            </button>
          ))}
        </div>

        {/* Right Info Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span>14:38:15 UTC-4</span>
          <span style={{ color: theme.colors.accentPrimary, cursor: 'pointer' }}>log</span>
          <span style={{ color: theme.colors.accentPrimary, cursor: 'pointer' }}>auto</span>
        </div>
      </div>
    </div>
  );
}

export default TechnicalAnalysisScreen;

