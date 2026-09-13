import React, { useState, useMemo } from 'react';
import { theme } from '../../theme/designTokens';
import { formatCurrency, formatPercent } from '../../utils/formatters';

export function CalendarHeatmapPrimitive({
  metric = 'return', // 'return' | 'volume' | 'pnl'
  days = 90
}) {
  const [hoverDay, setHoverDay] = useState(null);

  // Generate 90 days of financial activity data deterministically
  const calendarData = useMemo(() => {
    const data = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
      
      let pctReturn = 0;
      let pnl = 0;
      let volume = 0;

      if (!isWeekend) {
        // Deterministic pseudo-random values based on date index
        const rand = (Math.sin(i * 1.5) + Math.cos(i * 0.7)) / 2;
        pctReturn = parseFloat((rand * 2.8).toFixed(2));
        pnl = Math.round(pctReturn * 450);
        volume = Math.round(Math.abs(rand) * 8500000 + 1500000);
      }

      data.push({
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        dayOfWeek: d.toLocaleDateString('en-US', { weekday: 'short' }),
        isWeekend,
        pctReturn,
        pnl,
        volume
      });
    }

    return data;
  }, [days]);

  // Color Intensity Interpolation function
  const getCellColor = (item) => {
    if (item.isWeekend) return 'rgba(30, 41, 59, 0.4)';

    if (metric === 'return' || metric === 'pnl') {
      const val = metric === 'return' ? item.pctReturn : item.pnl;
      if (val === 0) return '#1e293b';
      if (val > 2.0) return '#10b981'; // Strong Green
      if (val > 0.8) return '#059669';
      if (val > 0) return '#047857';
      if (val < -2.0) return '#ef4444'; // Strong Red
      if (val < -0.8) return '#dc2626';
      if (val < 0) return '#b91c1c';
    }

    if (metric === 'volume') {
      const vol = item.volume;
      if (vol > 7000000) return '#8b5cf6';
      if (vol > 4000000) return '#7c3aed';
      if (vol > 2000000) return '#6d28d9';
      return '#4c1d95';
    }

    return '#1e293b';
  };

  return (
    <div style={{ width: '100%', fontFamily: theme.fonts.main }}>
      {/* Calendar Header Stats */}
      <div style={{
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        marginBottom: '14px'
      }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: theme.colors.textSecondary }}>
            Last {days} Days Performance Heatmap
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: theme.colors.textMuted }}>
          <span>Loss</span>
          <span style={{ width: 10, height: 10, background: '#ef4444', borderRadius: 2 }}></span>
          <span style={{ width: 10, height: 10, background: '#b91c1c', borderRadius: 2 }}></span>
          <span style={{ width: 10, height: 10, background: '#1e293b', borderRadius: 2 }}></span>
          <span style={{ width: 10, height: 10, background: '#047857', borderRadius: 2 }}></span>
          <span style={{ width: 10, height: 10, background: '#10b981', borderRadius: 2 }}></span>
          <span>Gain</span>
        </div>
      </div>

      {/* Grid Canvas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(14px, 1fr))',
        gap: '4px',
        padding: '12px',
        background: theme.colors.bgCardElevated,
        borderRadius: theme.radius.lg,
        border: `1px solid ${theme.colors.border}`,
        position: 'relative'
      }}>
        {calendarData.map((item, idx) => (
          <div
            key={idx}
            onMouseEnter={() => setHoverDay(item)}
            onMouseLeave={() => setHoverDay(null)}
            style={{
              aspectRatio: '1',
              backgroundColor: getCellColor(item),
              borderRadius: '3px',
              cursor: item.isWeekend ? 'default' : 'pointer',
              transition: 'transform 0.15s ease, filter 0.15s ease',
              transform: hoverDay?.date === item.date ? 'scale(1.3)' : 'scale(1)',
              zIndex: hoverDay?.date === item.date ? 10 : 1
            }}
          />
        ))}
      </div>

      {/* Hover Information Banner */}
      {hoverDay && (
        <div style={{
          marginTop: '10px',
          padding: '8px 12px',
          background: 'rgba(15, 23, 42, 0.95)',
          border: `1px solid ${theme.colors.borderLight}`,
          borderRadius: theme.radius.md,
          fontSize: '12px',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          fontFamily: theme.fonts.mono
        }}>
          <span style={{ color: theme.colors.textSecondary }}>{hoverDay.date} ({hoverDay.dayOfWeek})</span>
          {hoverDay.isWeekend ? (
            <span style={{ color: theme.colors.textMuted }}>Market Closed</span>
          ) : (
            <div style={{ display: 'flex', gap: '16px' }}>
              <span>Return: <b style={{ color: hoverDay.pctReturn >= 0 ? theme.colors.gain : theme.colors.loss }}>{formatPercent(hoverDay.pctReturn)}</b></span>
              <span>P&L: <b style={{ color: hoverDay.pnl >= 0 ? theme.colors.gain : theme.colors.loss }}>{formatCurrency(hoverDay.pnl)}</b></span>
              <span style={{ color: theme.colors.textMuted }}>Vol: {hoverDay.volume.toLocaleString()}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
