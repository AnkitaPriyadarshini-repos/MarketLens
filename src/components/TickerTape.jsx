import React, { useState, useEffect } from 'react';
import { theme } from '../theme/designTokens';
import { formatCurrency, formatPercent } from '../utils/formatters';

export function TickerTape({
  assets = [],
  onSelectAsset = null
}) {
  const [liveAssets, setLiveAssets] = useState(assets);
  const [flashSymbol, setFlashSymbol] = useState(null);

  // Simulate subtle real-time price tick updates every 2.5 seconds
  useEffect(() => {
    if (!assets || assets.length === 0) return;
    setLiveAssets(assets);

    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * assets.length);
      const target = assets[randomIdx];
      if (!target) return;

      const pctChange = (Math.random() - 0.48) * 0.4;
      const newPrice = parseFloat((target.price * (1 + pctChange / 100)).toFixed(2));

      setLiveAssets(prev => prev.map(a => {
        if (a.symbol === target.symbol) {
          return { ...a, price: newPrice, changePercent: parseFloat((a.changePercent + pctChange).toFixed(2)) };
        }
        return a;
      }));

      setFlashSymbol(target.symbol);
      setTimeout(() => setFlashSymbol(null), 600);
    }, 2500);

    return () => clearInterval(interval);
  }, [assets]);

  return (
    <div style={{
      width: '100%',
      background: theme.colors.bgDark,
      borderBottom: `1px solid ${theme.colors.border}`,
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      padding: '8px 0',
      userSelect: 'none'
    }}>
      <div style={{
        display: 'inline-flex',
        gap: '24px',
        animation: 'marquee 45s linear infinite'
      }}>
        {liveAssets.concat(liveAssets).map((asset, idx) => {
          const isPos = asset.changePercent >= 0;
          const isFlashing = flashSymbol === asset.symbol;

          return (
            <div
              key={`${asset.symbol}-${idx}`}
              onClick={() => onSelectAsset && onSelectAsset(asset.symbol)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12px',
                fontFamily: theme.fonts.mono,
                cursor: 'pointer',
                padding: '2px 8px',
                borderRadius: '4px',
                background: isFlashing ? (isPos ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)') : 'transparent',
                transition: 'background 0.3s ease'
              }}
            >
              <span style={{ fontWeight: 800, color: '#fff' }}>{asset.symbol}</span>
              <span style={{ color: theme.colors.textSecondary }}>{formatCurrency(asset.price)}</span>
              <span style={{ color: isPos ? theme.colors.gain : theme.colors.loss, fontWeight: 700 }}>
                {formatPercent(asset.changePercent)}
              </span>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
