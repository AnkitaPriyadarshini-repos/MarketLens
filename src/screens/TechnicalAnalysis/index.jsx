import React, { useState, useEffect } from 'react';
import { Sliders, RefreshCw, Layers } from 'lucide-react';
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

  const activeHoverPoint = hoverIndex !== null && data[hoverIndex] ? data[hoverIndex] : null;

  return (
    <div style={{ width: '100%', fontFamily: theme.fonts.main, color: theme.colors.textPrimary }}>
      {/* Controls Header */}
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
            Technical Studio 2.0: {symbol}
          </h2>
          <span style={{ fontSize: '12px', color: theme.colors.textMuted }}>
            {data.length} Bars Calculated
          </span>
        </div>

        {/* Indicators Bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {[
            { id: 'sma20', label: 'SMA 20', color: theme.colors.accentCyan },
            { id: 'ema12', label: 'EMA 12', color: theme.colors.accentGold },
            { id: 'bollinger', label: 'Bollinger', color: '#ec4899' },
            { id: 'volume', label: 'Volume Pane', color: '#64748b' },
            { id: 'rsi', label: 'RSI Pane', color: theme.colors.accentGold },
            { id: 'macd', label: 'MACD Pane', color: theme.colors.accentCyan }
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

      {/* Multi-Pane Synchronized Custom Canvas Terminal */}
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
            <RefreshCw size={24} className="spin" style={{ marginRight: 8 }} /> Computing Technical Viewports...
          </div>
        ) : (
          <>
            {/* PANE 1: Price Action */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: theme.colors.textSecondary, marginBottom: '6px' }}>
                PANE 1: PRICE ACTION & OVERLAYS
              </div>
              <CandlestickPrimitive
                data={data}
                height={280}
                showSma={indicators.sma20}
                showBollinger={indicators.bollinger}
                showVolume={false}
                externalHoverIndex={hoverIndex}
                onHoverPoint={(pt, idx) => setHoverIndex(idx)}
                demoDataLabel={true}
              />
            </div>

            {/* PANE 2: Synchronized Volume Histogram */}
            {indicators.volume && (
              <div style={{ borderTop: `1px solid ${theme.colors.border}`, paddingTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, color: theme.colors.textSecondary, marginBottom: '4px' }}>
                  <span>PANE 2: VOLUME HISTOGRAM</span>
                  {activeHoverPoint && (
                    <span style={{ color: theme.colors.textMuted, fontFamily: theme.fonts.mono }}>
                      Vol: {activeHoverPoint.volume.toLocaleString()}
                    </span>
                  )}
                </div>
                <VolumePrimitive
                  data={data}
                  height={80}
                  hoverIndex={hoverIndex}
                  onHoverIndex={setHoverIndex}
                />
              </div>
            )}

            {/* PANE 3: Synchronized Custom Canvas RSI Oscillator */}
            {indicators.rsi && (
              <div style={{ borderTop: `1px solid ${theme.colors.border}`, paddingTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, color: theme.colors.textSecondary, marginBottom: '4px' }}>
                  <span>PANE 3: RSI (14) OSCILLATOR</span>
                  <span style={{ color: theme.colors.accentGold, fontFamily: theme.fonts.mono }}>
                    RSI: {activeHoverPoint ? activeHoverPoint.rsi : data[data.length - 1]?.rsi}
                  </span>
                </div>
                <RsiPrimitive
                  data={data}
                  height={90}
                  hoverIndex={hoverIndex}
                  onHoverIndex={setHoverIndex}
                />
              </div>
            )}

            {/* PANE 4: Synchronized Custom Canvas MACD Histogram */}
            {indicators.macd && (
              <div style={{ borderTop: `1px solid ${theme.colors.border}`, paddingTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, color: theme.colors.textSecondary, marginBottom: '4px' }}>
                  <span>PANE 4: MACD (12, 26, 9) HISTOGRAM</span>
                  <span style={{ color: theme.colors.accentCyan, fontFamily: theme.fonts.mono }}>
                    MACD: {activeHoverPoint ? activeHoverPoint.macdLine : data[data.length - 1]?.macdLine} | Signal: {activeHoverPoint ? activeHoverPoint.macdSignal : data[data.length - 1]?.macdSignal}
                  </span>
                </div>
                <MacdPrimitive
                  data={data}
                  height={90}
                  hoverIndex={hoverIndex}
                  onHoverIndex={setHoverIndex}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
