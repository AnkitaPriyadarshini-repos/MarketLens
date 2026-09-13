import React, { useState } from 'react';
import { theme } from '../../theme/designTokens';
import { formatCurrency, formatPercent } from '../../utils/formatters';

export function HeatmapPrimitive({
  assets = [],
  onSelectAsset = null
}) {
  const [hoveredAsset, setHoveredAsset] = useState(null);
  const [selectedSector, setSelectedSector] = useState('All');

  const filteredAssets = selectedSector === 'All'
    ? assets
    : assets.filter(a => a.sector === selectedSector);

  const sectors = ['All', ...new Set(assets.map(a => a.sector).filter(Boolean))];

  // Helper for background color intensity based on % change (-5% to +5%)
  const getTileBg = (changePct) => {
    if (changePct > 4.0) return '#047857'; // Deep emerald
    if (changePct > 2.0) return '#10b981'; // Emerald
    if (changePct > 0.0) return 'rgba(16, 185, 129, 0.45)';
    if (changePct === 0) return '#1e293b';
    if (changePct > -2.0) return 'rgba(239, 68, 68, 0.45)';
    if (changePct > -4.0) return '#ef4444'; // Red
    return '#b91c1c'; // Deep crimson
  };

  return (
    <div style={{
      background: theme.colors.bgCard,
      borderRadius: theme.radius.lg,
      padding: '20px',
      border: `1px solid ${theme.colors.border}`,
      boxShadow: theme.shadows.card
    }}>
      {/* Header & Sector Filter Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <h3 style={{ margin: 0, color: theme.colors.textPrimary, fontFamily: theme.fonts.display, fontSize: '18px' }}>
            Market Sector Heatmap
          </h3>
          <p style={{ margin: '4px 0 0', color: theme.colors.textMuted, fontSize: '12px' }}>
            Visualizing 24h performance across major equities sized by market capitalization
          </p>
        </div>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {sectors.map(sec => (
            <button
              key={sec}
              onClick={() => setSelectedSector(sec)}
              style={{
                padding: '5px 12px',
                borderRadius: theme.radius.sm,
                fontSize: '12px',
                fontFamily: theme.fonts.mono,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: selectedSector === sec ? theme.colors.accentPrimary : theme.colors.bgCardElevated,
                color: selectedSector === sec ? '#ffffff' : theme.colors.textSecondary,
                transition: 'all 0.15s ease'
              }}
            >
              {sec}
            </button>
          ))}
        </div>
      </div>

      {/* Heatmap Grid Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
        gap: '8px',
        minHeight: '340px'
      }}>
        {filteredAssets.map(asset => {
          const changePct = asset.changePercent || 0;
          const bg = getTileBg(changePct);
          const isHovered = hoveredAsset?.symbol === asset.symbol;

          return (
            <div
              key={asset.symbol}
              onClick={() => onSelectAsset && onSelectAsset(asset.symbol)}
              onMouseEnter={() => setHoveredAsset(asset)}
              onMouseLeave={() => setHoveredAsset(null)}
              style={{
                background: bg,
                borderRadius: theme.radius.md,
                padding: '12px 10px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                transform: isHovered ? 'scale(1.04)' : 'scale(1)',
                boxShadow: isHovered ? '0 8px 24px rgba(0, 0, 0, 0.4)' : 'none',
                border: isHovered ? `1px solid ${theme.colors.textPrimary}` : `1px solid rgba(255, 255, 255, 0.05)`,
                minHeight: '85px',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, fontSize: '14px', fontFamily: theme.fonts.mono, color: '#fff' }}>
                  {asset.symbol}
                </span>
                <span style={{ fontSize: '11px', fontFamily: theme.fonts.mono, fontWeight: 700, color: '#fff' }}>
                  {formatPercent(changePct)}
                </span>
              </div>

              <div style={{ marginTop: '8px' }}>
                <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.8)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {asset.name}
                </div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#fff', fontFamily: theme.fonts.mono, marginTop: '2px' }}>
                  {formatCurrency(asset.price)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Popover Footer */}
      {hoveredAsset && (
        <div style={{
          marginTop: '16px',
          padding: '12px 16px',
          background: theme.colors.bgCardElevated,
          borderRadius: theme.radius.md,
          border: `1px solid ${theme.colors.borderLight}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '13px',
          fontFamily: theme.fonts.mono
        }}>
          <div>
            <b style={{ color: theme.colors.textPrimary }}>{hoveredAsset.symbol}</b> — <span style={{ color: theme.colors.textSecondary }}>{hoveredAsset.name}</span> ({hoveredAsset.sector})
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span>Price: <b style={{ color: '#fff' }}>{formatCurrency(hoveredAsset.price)}</b></span>
            <span>24h Change: <b style={{ color: hoveredAsset.changePercent >= 0 ? theme.colors.gain : theme.colors.loss }}>{formatPercent(hoveredAsset.changePercent)}</b></span>
            {hoveredAsset.marketCap && (
              <span style={{ color: theme.colors.textMuted }}>Mkt Cap: {hoveredAsset.marketCap}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
