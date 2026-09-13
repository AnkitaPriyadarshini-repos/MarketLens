import React, { useState, useEffect, useMemo } from 'react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, Cell 
} from 'recharts';
import { Sliders, Eye, RefreshCw, BarChart2, Layers, ShieldCheck } from 'lucide-react';
import { theme } from '../theme/designTokens';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { CandlestickPrimitive } from '../charts/primitives/CandlestickPrimitive';

export function TechnicalAnalysisScreen({
  asset = null,
  marketProvider = null
}) {
  const [symbol, setSymbol] = useState(asset?.symbol || 'NVDA');
  const [timeframe, setTimeframe] = useState('1M');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Active Technical Indicator Toggles
  const [indicators, setIndicators] = useState({
    sma20: true,
    ema12: true,
    vwap: false,
    bollinger: false,
    volume: true,
    rsi: true,
    macd: true,
    stochastic: false,
    obv: false
  });

  const [hoverIndex, setHoverIndex] = useState(null);

  useEffect(() => {
    if (!marketProvider) return;
    let isMounted = true;
    setLoading(true);

    marketProvider.getHistoricalPrices(symbol, timeframe).then(chartData => {
      if (isMounted) {
        setData(chartData);
        setLoading(false);
      }
    });

    return () => { isMounted = false; };
  }, [symbol, timeframe, marketProvider]);

  const toggleIndicator = (key) => {
    setIndicators(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const currentHoverPoint = hoverIndex !== null && data[hoverIndex] ? data[hoverIndex] : null;

  return (
    <div style={{ width: '100%', fontFamily: theme.fonts.main, color: theme.colors.textPrimary }}>
      {/* Top Controls Header */}
      <div style={{
        background: theme.colors.bgCard,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radius.xl,
        padding: '16px 20px',
        marginBottom: '20px',
        display: 'flex',
        flexWrap: 'wrap',
        justify: 'space-between',
        alignItems: 'center',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, fontFamily: theme.fonts.display }}>
            Technical Studio: {symbol}
          </h2>
          <span style={{ fontSize: '12px', color: theme.colors.textMuted }}>
            {data.length} Bars Calculated
          </span>
        </div>

        {/* Indicator Toggle Buttons Bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {[
            { id: 'sma20', label: 'SMA 20', color: theme.colors.accentCyan },
            { id: 'ema12', label: 'EMA 12', color: theme.colors.accentGold },
            { id: 'vwap', label: 'VWAP', color: theme.colors.accentPurple },
            { id: 'bollinger', label: 'Bollinger', color: '#ec4899' },
            { id: 'volume', label: 'Volume', color: '#64748b' },
            { id: 'rsi', label: 'RSI (14)', color: theme.colors.accentGold },
            { id: 'macd', label: 'MACD (12,26,9)', color: theme.colors.accentCyan },
            { id: 'stochastic', label: 'Stochastic', color: theme.colors.gain },
            { id: 'obv', label: 'OBV', color: theme.colors.accentPurple }
          ].map(ind => (
            <button
              key={ind.id}
              onClick={() => toggleIndicator(ind.id)}
              style={{
                padding: '5px 10px',
                borderRadius: theme.radius.sm,
                border: indicators[ind.id] ? `1px solid ${ind.color}` : `1px solid ${theme.colors.border}`,
                background: indicators[ind.id] ? 'rgba(30, 41, 59, 0.9)' : 'transparent',
                color: indicators[ind.id] ? ind.color : theme.colors.textMuted,
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {ind.label}
            </button>
          ))}
        </div>
      </div>

      {/* Synchronized Multi-Pane Technical Environment */}
      <div style={{
        background: theme.colors.bgCard,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radius.xl,
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {loading ? (
          <div style={{ height: 450, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.colors.textMuted }}>
            <RefreshCw size={24} className="spin" style={{ marginRight: 8 }} /> Computing Technical Indicators...
          </div>
        ) : (
          <>
            {/* Pane 1: Main Price & Overlay Canvas */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: theme.colors.textSecondary, marginBottom: '6px' }}>
                PANE 1: PRICE ACTION & OVERLAYS
              </div>
              <CandlestickPrimitive
                data={data}
                height={320}
                showSma={indicators.sma20}
                showBollinger={indicators.bollinger}
                showVolume={false}
                onHoverPoint={(pt) => {
                  if (pt) {
                    const idx = data.findIndex(d => d.date === pt.date);
                    setHoverIndex(idx);
                  } else {
                    setHoverIndex(null);
                  }
                }}
              />
            </div>

            {/* Pane 2: RSI Oscillator Pane */}
            {indicators.rsi && (
              <div style={{ borderTop: `1px solid ${theme.colors.border}`, paddingTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, color: theme.colors.textSecondary, marginBottom: '4px' }}>
                  <span>PANE 2: RSI (14) OSCILLATOR</span>
                  <span style={{ color: theme.colors.accentGold, fontFamily: theme.fonts.mono }}>
                    Current: {currentHoverPoint ? currentHoverPoint.rsi : data[data.length - 1]?.rsi}
                  </span>
                </div>
                <div style={{ height: 100, width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                      <YAxis domain={[0, 100]} ticks={[30, 50, 70]} axisLine={false} tickLine={false} tick={{ fill: theme.colors.textMuted, fontSize: 10 }} orientation="right" />
                      <Area type="monotone" dataKey="rsi" stroke={theme.colors.accentGold} strokeWidth={1.5} fill="rgba(245, 158, 11, 0.1)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Pane 3: MACD Indicator Pane */}
            {indicators.macd && (
              <div style={{ borderTop: `1px solid ${theme.colors.border}`, paddingTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, color: theme.colors.textSecondary, marginBottom: '4px' }}>
                  <span>PANE 3: MACD (12, 26, 9) HISTOGRAM & SIGNAL</span>
                  <span style={{ color: theme.colors.accentCyan, fontFamily: theme.fonts.mono }}>
                    MACD: {currentHoverPoint ? currentHoverPoint.macdLine : data[data.length - 1]?.macdLine} | Signal: {currentHoverPoint ? currentHoverPoint.macdSignal : data[data.length - 1]?.macdSignal}
                  </span>
                </div>
                <div style={{ height: 100, width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: theme.colors.textMuted, fontSize: 10 }} orientation="right" />
                      <Bar dataKey="macdHist">
                        {data.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.macdHist >= 0 ? theme.colors.gain : theme.colors.loss} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
