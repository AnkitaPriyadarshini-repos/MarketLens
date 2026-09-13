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
    if (changePct > 4.0) return '#059669'; // Emerald strong
    if (changePct > 2.0) return '#10b981';
    if (changePct > 0.0) return 'rgba(16, 185, 129, 0.45)';
    if (changePct === 0) return '#1e293b';
    if (changePct > -2.0) return 'rgba(239, 68, 68, 0.45)';
    if (changePct > -4.0) return '#ef4444';
    return '#b91c1c'; // Crimson strong
  };

  return (
    <div style={{ width: '100%', fontFamily: theme.fonts.main }}>
      {/* Sector Filter Chips */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '12px',
        marginBottom: '12px'
      }}>
        {sectors.map(sec => (
          <button
            key={sec}
            onClick={() => setSelectedSector(sec)}
            style={{
              padding: '6px 14px',
              borderRadius: theme.radius.full,
              border: selectedSector === sec ? `1px solid ${theme.colors.accentPrimary}` : `1px solid ${theme.colors.border}`,
              background: selectedSector === sec ? theme.colors.accentPrimary : theme.colors.bgCard,
              color: selectedSector === sec ? '#fff' : theme.colors.textSecondary,
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease'
            }}
          >
            {sec}
          </button>
        ))}
      </div>

      {/* Heatmap Tile Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
        gap: '8px',
        minHeight: '340px'
      }}>
        {filteredAssets.map(asset => {
          const bg = getTileBg(asset.changePercent);
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
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between',
                cursor: 'pointer',
                border: isHovered ? '2px solid #ffffff' : `1px solid ${theme.colors.border}`,
                boxShadow: isHovered ? theme.shadows.card : 'none',
                transform: isHovered ? 'translateY(-2px)' : 'none',
                transition: 'all 0.15s ease',
                userSelect: 'none'
              }}
            >
              <div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff', fontFamily: theme.fonts.display }}>
                  {asset.symbol}
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.75)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {asset.name}
                </div>
              </div>

              <div style={{ marginTop: '12px' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', fontFamily: theme.fonts.mono }}>
                  {formatCurrency(asset.price)}
                </div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff', fontFamily: theme.fonts.mono }}>
                  {formatPercent(asset.changePercent)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Hover Card */}
      {hoveredAsset && (
        <div style={{
          marginTop: '14px',
          padding: '12px 16px',
          background: theme.colors.bgCardElevated,
          border: `1px solid ${theme.colors.borderLight}`,
          borderRadius: theme.radius.lg,
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <span style={{ fontSize: '16px', fontWeight: 800, color: theme.colors.textPrimary }}>{hoveredAsset.name} ({hoveredAsset.symbol})</span>
            <span style={{ marginLeft: '12px', fontSize: '12px', color: theme.colors.textMuted }}>{hoveredAsset.sector} • {hoveredAsset.subSector}</span>
          </div>
          <div style={{ display: 'flex', gap: '20px', fontFamily: theme.fonts.mono }}>
            <div><span style={{ color: theme.colors.textMuted, fontSize: '11px' }}>MKT CAP</span> <b style={{ color: '#fff' }}>{hoveredAsset.marketCap}</b></div>
            <div><span style={{ color: theme.colors.textMuted, fontSize: '11px' }}>P/E</span> <b style={{ color: '#fff' }}>{hoveredAsset.peRatio}</b></div>
            <div><span style={{ color: theme.colors.textMuted, fontSize: '11px' }}>24H</span> <b style={{ color: hoveredAsset.changePercent >= 0 ? theme.colors.gain : theme.colors.loss }}>{formatPercent(hoveredAsset.changePercent)}</b></div>
          </div>
        </div>
      )}
    </div>
  );
}
