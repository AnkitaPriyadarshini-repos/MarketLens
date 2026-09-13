import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Star, Bell, ShieldCheck, 
  BarChart2, LineChart, Layers, Eye, RefreshCw, Zap, Cpu 
} from 'lucide-react';
import { theme } from '../theme/designTokens';
import { formatCurrency, formatPercent, formatNumber } from '../utils/formatters';
import { LineChartPrimitive } from '../charts/primitives/LineChartPrimitive';
import { CandlestickPrimitive } from '../charts/primitives/CandlestickPrimitive';

export function AssetDetailScreen({
  asset = null,
  marketProvider = null,
  onAddToWatchlist = null,
  onOpenAlerts = null,
  onOpenTradeModal = null
}) {
  const [chartMode, setChartMode] = useState('area'); // 'area' | 'line' | 'candlestick'
  const [timeframe, setTimeframe] = useState('1M');   // '1D'|'1W'|'1M'|'6M'|'1Y'|'ALL'
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Indicator Overlay Toggles
  const [showSma, setShowSma] = useState(true);
  const [showBollinger, setShowBollinger] = useState(false);
  const [showVolume, setShowVolume] = useState(true);

  useEffect(() => {
    if (!asset || !marketProvider) return;
    let isMounted = true;
    setLoading(true);

    marketProvider.getHistoricalPrices(asset.symbol, timeframe).then(data => {
      if (isMounted) {
        setChartData(data);
        setLoading(false);
      }
    });

    return () => { isMounted = false; };
  }, [asset, timeframe, marketProvider]);

  if (!asset) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: theme.colors.textMuted }}>
        Select an asset from search or market dashboard to view detail analysis.
      </div>
    );
  }

  const isPositive = asset.changePercent >= 0;

  return (
    <div style={{ width: '100%', fontFamily: theme.fonts.main, color: theme.colors.textPrimary }}>
      {/* Header Banner */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justify: 'space-between',
        alignItems: 'center',
        padding: '20px 24px',
        background: theme.colors.bgCard,
        borderRadius: theme.radius.xl,
        border: `1px solid ${theme.colors.border}`,
        marginBottom: '20px'
      }}>
        {/* Title & Badge */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 800, margin: 0, fontFamily: theme.fonts.display }}>
              {asset.name}
            </h1>
            <span style={{
              background: theme.colors.bgCardElevated,
              color: theme.colors.accentCyan,
              padding: '4px 10px',
              borderRadius: theme.radius.sm,
              fontSize: '12px',
              fontWeight: 700,
              fontFamily: theme.fonts.mono
            }}>
              {asset.symbol}
            </span>
            <span style={{ fontSize: '12px', color: theme.colors.textMuted }}>
              NASDAQ • USD
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', marginTop: '10px' }}>
            <span style={{ fontSize: '32px', fontWeight: 800, fontFamily: theme.fonts.mono }}>
              {formatCurrency(asset.price)}
            </span>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '16px',
              fontWeight: 700,
              color: isPositive ? theme.colors.gain : theme.colors.loss,
              fontFamily: theme.fonts.mono
            }}>
              {isPositive ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
              <span>{formatCurrency(asset.change, 'USD', 2)} ({formatPercent(asset.changePercent)})</span>
            </div>
            <span style={{ fontSize: '11px', color: theme.colors.gain, background: theme.colors.gainBg, padding: '2px 8px', borderRadius: '4px' }}>
              MARKET LIVE
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
          <button
            onClick={() => onAddToWatchlist && onAddToWatchlist(asset)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              background: theme.colors.bgCardElevated,
              border: `1px solid ${theme.colors.borderLight}`,
              color: theme.colors.textPrimary,
              borderRadius: theme.radius.md,
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            <Star size={16} color={theme.colors.accentGold} />
            <span>Watchlist</span>
          </button>

          <button
            onClick={() => onOpenAlerts && onOpenAlerts(asset)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              background: theme.colors.bgCardElevated,
              border: `1px solid ${theme.colors.borderLight}`,
              color: theme.colors.textPrimary,
              borderRadius: theme.radius.md,
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            <Bell size={16} color={theme.colors.accentCyan} />
            <span>Set Alert</span>
          </button>
        </div>
      </div>

      {/* Main Chart Canvas Container */}
      <div style={{
        background: theme.colors.bgCard,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radius.xl,
        padding: '20px',
        marginBottom: '24px'
      }}>
        {/* Toolbar Controls */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justify: 'space-between',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '16px',
          borderBottom: `1px solid ${theme.colors.border}`,
          paddingBottom: '14px'
        }}>
          {/* Chart Mode Toggles */}
          <div style={{ display: 'flex', background: theme.colors.bgDark, padding: '3px', borderRadius: theme.radius.md }}>
            <button
              onClick={() => setChartMode('area')}
              style={{
                padding: '6px 12px',
                borderRadius: theme.radius.sm,
                border: 'none',
                background: chartMode === 'area' ? theme.colors.bgCardElevated : 'transparent',
                color: chartMode === 'area' ? '#fff' : theme.colors.textMuted,
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Area
            </button>
            <button
              onClick={() => setChartMode('candlestick')}
              style={{
                padding: '6px 12px',
                borderRadius: theme.radius.sm,
                border: 'none',
                background: chartMode === 'candlestick' ? theme.colors.bgCardElevated : 'transparent',
                color: chartMode === 'candlestick' ? '#fff' : theme.colors.textMuted,
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Candles (OHLC)
            </button>
          </div>

          {/* Indicators Toggles */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setShowSma(!showSma)}
              style={{
                padding: '6px 12px',
                borderRadius: theme.radius.sm,
                border: showSma ? `1px solid ${theme.colors.accentCyan}` : `1px solid ${theme.colors.border}`,
                background: showSma ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
                color: showSma ? theme.colors.accentCyan : theme.colors.textMuted,
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              SMA 20
            </button>
            <button
              onClick={() => setShowBollinger(!showBollinger)}
              style={{
                padding: '6px 12px',
                borderRadius: theme.radius.sm,
                border: showBollinger ? `1px solid ${theme.colors.accentPurple}` : `1px solid ${theme.colors.border}`,
                background: showBollinger ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                color: showBollinger ? theme.colors.accentPurple : theme.colors.textMuted,
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Bollinger Bands
            </button>
          </div>

          {/* Timeframe Controls */}
          <div style={{ display: 'flex', gap: '4px', background: theme.colors.bgDark, padding: '3px', borderRadius: theme.radius.md }}>
            {['1D', '1W', '1M', '6M', '1Y', 'ALL'].map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                style={{
                  padding: '6px 12px',
                  borderRadius: theme.radius.sm,
                  border: 'none',
                  background: timeframe === tf ? theme.colors.accentPrimary : 'transparent',
                  color: timeframe === tf ? '#fff' : theme.colors.textMuted,
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Chart Output Render */}
        {loading ? (
          <div style={{ height: 380, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.colors.textMuted }}>
            <RefreshCw size={24} className="spin" style={{ marginRight: 8 }} /> Loading Chart Viewport...
          </div>
        ) : chartMode === 'candlestick' ? (
          <CandlestickPrimitive
            data={chartData}
            height={380}
            showSma={showSma}
            showBollinger={showBollinger}
            showVolume={showVolume}
          />
        ) : (
          <LineChartPrimitive
            data={chartData}
            height={380}
            showArea={chartMode === 'area'}
            showSma={showSma}
            showBollinger={showBollinger}
          />
        )}
      </div>

      {/* Fundamental Metrics & AI Sentiment Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px'
      }}>
        {/* Fundamental Key Statistics */}
        <div style={{
          background: theme.colors.bgCard,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: theme.radius.xl,
          padding: '20px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginTop: 0, marginBottom: '16px', color: theme.colors.textSecondary }}>
            Key Fundamental Metrics
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '14px 24px',
            fontSize: '13px',
            fontFamily: theme.fonts.mono
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${theme.colors.border}`, paddingBottom: '6px' }}>
              <span style={{ color: theme.colors.textMuted }}>Market Cap</span>
              <span style={{ fontWeight: 700, color: '#fff' }}>{asset.marketCap}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${theme.colors.border}`, paddingBottom: '6px' }}>
              <span style={{ color: theme.colors.textMuted }}>P/E Ratio</span>
              <span style={{ fontWeight: 700, color: '#fff' }}>{asset.peRatio}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${theme.colors.border}`, paddingBottom: '6px' }}>
              <span style={{ color: theme.colors.textMuted }}>EPS</span>
              <span style={{ fontWeight: 700, color: '#fff' }}>${asset.eps}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${theme.colors.border}`, paddingBottom: '6px' }}>
              <span style={{ color: theme.colors.textMuted }}>Volume</span>
              <span style={{ fontWeight: 700, color: '#fff' }}>{asset.volume}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${theme.colors.border}`, paddingBottom: '6px' }}>
              <span style={{ color: theme.colors.textMuted }}>52w High</span>
              <span style={{ fontWeight: 700, color: theme.colors.gain }}>${asset.high52w}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${theme.colors.border}`, paddingBottom: '6px' }}>
              <span style={{ color: theme.colors.textMuted }}>52w Low</span>
              <span style={{ fontWeight: 700, color: theme.colors.loss }}>${asset.low52w}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${theme.colors.border}`, paddingBottom: '6px' }}>
              <span style={{ color: theme.colors.textMuted }}>Div Yield</span>
              <span style={{ fontWeight: 700, color: '#fff' }}>{asset.dividendYield}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${theme.colors.border}`, paddingBottom: '6px' }}>
              <span style={{ color: theme.colors.textMuted }}>RSI (14)</span>
              <span style={{ fontWeight: 700, color: theme.colors.accentGold }}>{asset.rsi}</span>
            </div>
          </div>
        </div>

        {/* AI Sentiment & Price Target Range */}
        <div style={{
          background: theme.colors.bgCard,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: theme.radius.xl,
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          justify: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: theme.colors.textSecondary, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={16} color={theme.colors.accentGold} /> AI Market Sentiment
              </h3>
              <span style={{
                background: theme.colors.gainBg,
                color: theme.colors.gain,
                padding: '4px 10px',
                borderRadius: theme.radius.full,
                fontSize: '12px',
                fontWeight: 700
              }}>
                {asset.sentiment} ({asset.aiScore}/100)
              </span>
            </div>

            <p style={{ fontSize: '13px', color: theme.colors.textSecondary, lineHeight: 1.5 }}>
              {asset.description}
            </p>
          </div>

          {/* Wall St Price Target Range Bar */}
          <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontFamily: theme.fonts.mono, marginBottom: '6px' }}>
              <span style={{ color: theme.colors.loss }}>Bear: ${asset.bearPriceTarget}</span>
              <span style={{ color: '#fff', fontWeight: 700 }}>Current: ${asset.price}</span>
              <span style={{ color: theme.colors.gain }}>Bull: ${asset.bullPriceTarget}</span>
            </div>

            <div style={{ width: '100%', height: '8px', background: theme.colors.bgDark, borderRadius: '4px', position: 'relative', overflow: 'hidden' }}>
              <div style={{
                position: 'absolute',
                left: '0%',
                width: '100%',
                height: '100%',
                background: `linear-gradient(90deg, ${theme.colors.loss} 0%, ${theme.colors.accentGold} 50%, ${theme.colors.gain} 100%)`
              }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
