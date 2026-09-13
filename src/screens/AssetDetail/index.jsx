import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Star, Bell, ZoomIn, ZoomOut, 
  RotateCcw, RefreshCw, Zap, ShieldCheck, HelpCircle 
} from 'lucide-react';
import { theme } from '../../theme/designTokens';
import { formatCurrency, formatPercent, formatNumber } from '../../utils/formatters';
import { LineChartPrimitive } from '../../charts/primitives/LineChartPrimitive';
import { CandlestickPrimitive } from '../../charts/primitives/CandlestickPrimitive';

export function AssetDetailScreen({
  asset = null,
  marketProvider = null,
  onAddToWatchlist = null,
  onOpenAlerts = null
}) {
  const [chartMode, setChartMode] = useState('candlestick'); // 'candlestick' | 'area' | 'line'
  const [timeframe, setTimeframe] = useState('1M');   // '1D'|'1W'|'1M'|'6M'|'1Y'|'ALL'
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Technical Indicators
  const [showSma, setShowSma] = useState(true);
  const [showBollinger, setShowBollinger] = useState(false);
  const [showVolume, setShowVolume] = useState(true);

  // Zoom & Pan state
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [panOffset, setPanOffset] = useState(0);

  useEffect(() => {
    if (!asset || !marketProvider) return;
    let isMounted = true;
    setLoading(true);

    marketProvider.getHistoricalPrices(asset.symbol, timeframe).then(data => {
      if (isMounted) {
        setChartData(data);
        setZoomLevel(1.0);
        setPanOffset(0);
        setLoading(false);
      }
    });

    return () => { isMounted = false; };
  }, [asset, timeframe, marketProvider]);

  if (!asset) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: theme.colors.textMuted }}>
        Select an asset to view professional terminal details.
      </div>
    );
  }

  const isPositive = asset.changePercent >= 0;

  const handleZoomIn = () => setZoomLevel(prev => Math.min(4.0, prev * 1.25));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(1.0, prev / 1.25));
  const handleResetZoom = () => { setZoomLevel(1.0); setPanOffset(0); };

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
              LIVE FEED
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

      {/* Main Chart Terminal Window */}
      <div style={{
        background: theme.colors.bgCard,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radius.xl,
        padding: '20px',
        marginBottom: '24px'
      }}>
        {/* Toolbar & Zoom Controls */}
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
          {/* Mode Selector */}
          <div style={{ display: 'flex', background: theme.colors.bgDark, padding: '3px', borderRadius: theme.radius.md }}>
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
              Candlesticks (OHLC)
            </button>
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
          </div>

          {/* Indicator Toggles */}
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

          {/* Zoom Buttons & Timeframe Bar */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button onClick={handleZoomIn} title="Zoom In" style={{ padding: '6px 10px', borderRadius: theme.radius.sm, background: theme.colors.bgCardElevated, border: `1px solid ${theme.colors.border}`, color: '#fff', cursor: 'pointer' }}>
                <ZoomIn size={14} />
              </button>
              <button onClick={handleZoomOut} title="Zoom Out" style={{ padding: '6px 10px', borderRadius: theme.radius.sm, background: theme.colors.bgCardElevated, border: `1px solid ${theme.colors.border}`, color: '#fff', cursor: 'pointer' }}>
                <ZoomOut size={14} />
              </button>
              <button onClick={handleResetZoom} title="Reset Zoom" style={{ padding: '6px 10px', borderRadius: theme.radius.sm, background: theme.colors.bgCardElevated, border: `1px solid ${theme.colors.border}`, color: '#fff', cursor: 'pointer' }}>
                <RotateCcw size={14} />
              </button>
            </div>

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
        </div>

        {/* Keyboard Navigation Tip */}
        <div style={{ fontSize: '11px', color: theme.colors.textMuted, marginBottom: '10px', display: 'flex', gap: '6px', alignItems: 'center' }}>
          <HelpCircle size={13} /> Tip: Use Keyboard <kbd style={{ background: theme.colors.bgDark, padding: '1px 5px', borderRadius: '3px' }}>←</kbd> and <kbd style={{ background: theme.colors.bgDark, padding: '1px 5px', borderRadius: '3px' }}>→</kbd> Arrow Keys to scrub through price bars with crosshair.
        </div>

        {/* Chart Viewport */}
        {loading ? (
          <div style={{ height: 380, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.colors.textMuted }}>
            <RefreshCw size={24} className="spin" style={{ marginRight: 8 }} /> Loading Chart Terminal...
          </div>
        ) : chartMode === 'candlestick' ? (
          <CandlestickPrimitive
            data={chartData}
            height={380}
            showSma={showSma}
            showBollinger={showBollinger}
            showVolume={showVolume}
            zoomLevel={zoomLevel}
            panOffset={panOffset}
            demoDataLabel={true}
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

      {/* Fundamental Statistics & AI Sentiment */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px'
      }}>
        {/* Statistics Grid */}
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
          </div>
        </div>

        {/* AI Sentiment */}
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
        </div>
      </div>
    </div>
  );
}
