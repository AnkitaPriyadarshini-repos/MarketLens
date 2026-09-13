import React, { useState, useEffect, useRef } from 'react';
import { Search, X, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { theme } from '../theme/designTokens';
import { formatCurrency, formatPercent } from '../utils/formatters';

export function SearchModal({
  isOpen = false,
  onClose = null,
  marketProvider = null,
  onSelectAsset = null
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!marketProvider) return;
    marketProvider.searchAssets(query).then(res => setResults(res));
  }, [query, marketProvider]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(9, 13, 22, 0.85)',
      backdropFilter: 'blur(10px)',
      zIndex: 999,
      display: 'flex',
      justify: 'center',
      paddingTop: '80px',
      fontFamily: theme.fonts.main
    }}>
      <div style={{
        width: '90%',
        maxWidth: '640px',
        background: theme.colors.bgCard,
        border: `1px solid ${theme.colors.borderLight}`,
        borderRadius: theme.radius.xl,
        boxShadow: theme.shadows.card,
        overflow: 'hidden',
        height: 'max-content',
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Search Bar Input */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px 20px',
          borderBottom: `1px solid ${theme.colors.border}`
        }}>
          <Search size={20} color={theme.colors.textMuted} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search stocks, crypto, ETFs, indices (e.g. NVDA, BTC, AAPL)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#fff',
              fontSize: '16px',
              fontFamily: theme.fonts.main
            }}
          />
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: theme.colors.textMuted, cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Results List */}
        <div style={{ overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {results.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: theme.colors.textMuted }}>
              No assets matching "{query}"
            </div>
          ) : (
            results.map(asset => {
              const isPos = asset.changePercent >= 0;
              return (
                <div
                  key={asset.symbol}
                  onClick={() => {
                    if (onSelectAsset) onSelectAsset(asset.symbol);
                    if (onClose) onClose();
                  }}
                  style={{
                    display: 'flex',
                    justify: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    borderRadius: theme.radius.lg,
                    background: theme.colors.bgCardElevated,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = theme.colors.borderLight}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      fontWeight: 800,
                      fontSize: '15px',
                      color: '#fff',
                      fontFamily: theme.fonts.mono,
                      width: '60px'
                    }}>
                      {asset.symbol}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13px', color: theme.colors.textPrimary }}>
                        {asset.name}
                      </div>
                      <div style={{ fontSize: '11px', color: theme.colors.textMuted }}>
                        {asset.category} • {asset.sector}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', fontFamily: theme.fonts.mono }}>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: '#fff' }}>
                      {formatCurrency(asset.price)}
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: isPos ? theme.colors.gain : theme.colors.loss }}>
                      {formatPercent(asset.changePercent)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
