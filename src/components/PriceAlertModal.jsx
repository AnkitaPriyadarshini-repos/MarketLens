import React, { useState } from 'react';
import { Bell, X, CheckCircle } from 'lucide-react';
import { theme } from '../theme/designTokens';
import { formatCurrency } from '../utils/formatters';

export function PriceAlertModal({
  isOpen = false,
  onClose = null,
  asset = null
}) {
  const [targetPrice, setTargetPrice] = useState(asset ? (asset.price * 1.05).toFixed(2) : '150.00');
  const [alertType, setAlertType] = useState('above'); // 'above' | 'below'
  const [created, setCreated] = useState(false);

  if (!isOpen || !asset) return null;

  const handleSave = () => {
    setCreated(true);
    setTimeout(() => {
      setCreated(false);
      if (onClose) onClose();
    }, 1200);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(9, 13, 22, 0.85)',
      backdropFilter: 'blur(8px)',
      zIndex: 999,
      display: 'flex',
      alignItems: 'center',
      justify: 'center',
      fontFamily: theme.fonts.main
    }}>
      <div style={{
        width: '90%',
        maxWidth: '420px',
        background: theme.colors.bgCard,
        border: `1px solid ${theme.colors.borderLight}`,
        borderRadius: theme.radius.xl,
        padding: '24px',
        boxShadow: theme.shadows.card
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={18} color={theme.colors.accentCyan} /> Set Price Alert for {asset.symbol}
          </h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: theme.colors.textMuted, cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        {created ? (
          <div style={{ padding: '20px', textAlign: 'center', color: theme.colors.gain }}>
            <CheckCircle size={36} style={{ marginBottom: 8 }} />
            <div style={{ fontWeight: 700 }}>Alert Active!</div>
            <div style={{ fontSize: '12px', color: theme.colors.textMuted }}>You will be notified when {asset.symbol} crosses ${targetPrice}.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', color: theme.colors.textMuted, display: 'block', marginBottom: '6px' }}>Current Market Price</label>
              <div style={{ fontSize: '20px', fontWeight: 800, fontFamily: theme.fonts.mono }}>{formatCurrency(asset.price)}</div>
            </div>

            <div>
              <label style={{ fontSize: '12px', color: theme.colors.textMuted, display: 'block', marginBottom: '6px' }}>Notify Me When Price Crosses</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setAlertType('above')}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: theme.radius.md,
                    border: alertType === 'above' ? `1px solid ${theme.colors.gain}` : `1px solid ${theme.colors.border}`,
                    background: alertType === 'above' ? theme.colors.gainBg : 'transparent',
                    color: alertType === 'above' ? theme.colors.gain : theme.colors.textMuted,
                    fontWeight: 700,
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  Rises Above
                </button>
                <button
                  onClick={() => setAlertType('below')}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: theme.radius.md,
                    border: alertType === 'below' ? `1px solid ${theme.colors.loss}` : `1px solid ${theme.colors.border}`,
                    background: alertType === 'below' ? theme.colors.lossBg : 'transparent',
                    color: alertType === 'below' ? theme.colors.loss : theme.colors.textMuted,
                    fontWeight: 700,
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  Drops Below
                </button>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', color: theme.colors.textMuted, display: 'block', marginBottom: '6px' }}>Target Threshold Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                style={{
                  width: '100%',
                  background: theme.colors.bgDark,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: theme.radius.md,
                  padding: '10px 14px',
                  color: '#fff',
                  fontSize: '16px',
                  fontFamily: theme.fonts.mono,
                  outline: 'none'
                }}
              />
            </div>

            <button
              onClick={handleSave}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: theme.radius.md,
                background: theme.colors.accentPrimary,
                border: 'none',
                color: '#fff',
                fontWeight: 800,
                fontSize: '14px',
                cursor: 'pointer',
                marginTop: '8px'
              }}
            >
              Create Price Alert
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
