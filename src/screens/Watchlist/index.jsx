import React, { useState, useEffect } from 'react';
import { Star, Trash2, Bell, TrendingUp, TrendingDown, Search, ArrowRight } from 'lucide-react';
import { theme } from '../../theme/designTokens';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { LineChartPrimitive } from '../../charts/primitives/LineChartPrimitive';

export function WatchlistScreen({
  marketProvider = null,
  onSelectAsset = null,
  onOpenAlerts = null
}) {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!marketProvider) return;
    marketProvider.getWatchlist().then(data => {
      setWatchlist(data);
      setLoading(false);
    });
  }, [marketProvider]);

  const removeAsset = (symbol) => {
    setWatchlist(prev => prev.filter(a => a.symbol !== symbol));
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: theme.colors.textMuted }}>
        Loading Watchlist...
      </div>
    );
  }

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
            <Star size={20} color={theme.colors.accentGold} /> My Market Watchlist
          </h2>
          <span style={{ fontSize: '12px', color: theme.colors.textMuted }}>
            {watchlist.length} Assets Tracked in Real-Time
          </span>
        </div>
      </div>

      {/* Watchlist Rows Container */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {watchlist.map(asset => {
          const isPos = asset.changePercent >= 0;

          return (
            <div
              key={asset.symbol}
              style={{
                display: 'grid',
                gridTemplateColumns: '1.5fr 1fr 1fr 1fr auto',
                alignItems: 'center',
                padding: '16px 20px',
                background: theme.colors.bgCard,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.radius.lg,
                transition: 'all 0.15s ease',
                userSelect: 'none'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = theme.colors.borderLight}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = theme.colors.border}
            >
              {/* Asset Info */}
              <div 
                onClick={() => onSelectAsset && onSelectAsset(asset.symbol)}
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}
              >
                <div style={{
                  fontWeight: 800,
                  fontSize: '16px',
                  fontFamily: theme.fonts.mono,
                  color: '#fff',
                  width: '60px'
                }}>
                  {asset.symbol}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: theme.colors.textSecondary }}>
                    {asset.name}
                  </div>
                  <div style={{ fontSize: '11px', color: theme.colors.textMuted }}>
                    {asset.sector}
                  </div>
                </div>
              </div>

              {/* Price & Change */}
              <div 
                onClick={() => onSelectAsset && onSelectAsset(asset.symbol)}
                style={{ cursor: 'pointer', fontFamily: theme.fonts.mono }}
              >
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>
                  {formatCurrency(asset.price)}
                </div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: isPos ? theme.colors.gain : theme.colors.loss }}>
                  {formatPercent(asset.changePercent)}
                </div>
              </div>

              {/* Volume & Market Cap */}
              <div style={{ fontFamily: theme.fonts.mono, fontSize: '12px' }}>
                <div style={{ color: theme.colors.textMuted }}>Vol: {asset.volume}</div>
                <div style={{ color: theme.colors.textMuted }}>Cap: {asset.marketCap}</div>
              </div>

              {/* RSI & Sentiment */}
              <div style={{ fontSize: '12px' }}>
                <span style={{ color: theme.colors.accentGold, fontFamily: theme.fonts.mono }}>RSI: {asset.rsi}</span>
                <div style={{ color: isPos ? theme.colors.gain : theme.colors.loss, fontSize: '11px', fontWeight: 600 }}>
                  {asset.sentiment}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => onOpenAlerts && onOpenAlerts(asset)}
                  title="Set Alert"
                  style={{
                    padding: '8px',
                    borderRadius: theme.radius.sm,
                    background: theme.colors.bgCardElevated,
                    border: `1px solid ${theme.colors.border}`,
                    color: theme.colors.accentCyan,
                    cursor: 'pointer'
                  }}
                >
                  <Bell size={16} />
                </button>
                <button
                  onClick={() => removeAsset(asset.symbol)}
                  title="Remove from Watchlist"
                  style={{
                    padding: '8px',
                    borderRadius: theme.radius.sm,
                    background: theme.colors.bgCardElevated,
                    border: `1px solid ${theme.colors.border}`,
                    color: theme.colors.loss,
                    cursor: 'pointer'
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
