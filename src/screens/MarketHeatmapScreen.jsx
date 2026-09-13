import React, { useState, useEffect } from 'react';
import { Grid, Layers, ShieldCheck } from 'lucide-react';
import { theme } from '../theme/designTokens';
import { HeatmapPrimitive } from '../charts/primitives/HeatmapPrimitive';

export function MarketHeatmapScreen({
  marketProvider = null,
  onSelectAsset = null
}) {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!marketProvider) return;
    marketProvider.searchAssets('').then(data => {
      setAssets(data);
      setLoading(false);
    });
  }, [marketProvider]);

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: theme.colors.textMuted }}>
        Loading Market Heatmap Grid...
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
            <Grid size={20} color={theme.colors.accentCyan} /> Market Heatmap Matrix
          </h2>
          <span style={{ fontSize: '12px', color: theme.colors.textMuted }}>
            Visual Market Cap Tile Sizing & Performance Intensity Gradients
          </span>
        </div>
      </div>

      <div style={{
        background: theme.colors.bgCard,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radius.xl,
        padding: '20px'
      }}>
        <HeatmapPrimitive assets={assets} onSelectAsset={onSelectAsset} />
      </div>
    </div>
  );
}
