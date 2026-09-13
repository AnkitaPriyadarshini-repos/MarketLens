import React, { useState, useMemo } from 'react';
import { theme } from '../../theme/designTokens';
import { formatCurrency, formatPercent } from '../../utils/formatters';

export function CalendarHeatmapPrimitive({
  metric = 'return', // 'return' | 'volume' | 'pnl'
  days = 90
}) {
  const [hoverDay, setHoverDay] = useState(null);
  const [activeMetric, setActiveMetric] = useState(metric);

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
        // Deterministic values based on date index
        const pseudoSeed = (i * 37) % 100;
        pctReturn = ((pseudoSeed - 45) / 10); // -4.5% to +5.5%
        pnl = Math.round(pctReturn * 240);
        volume = Math.round(1500000 + pseudoSeed * 45000);
      }

      data.push({
        date: d.toISOString().split('T')[0],
        formattedDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        isWeekend,
        pctReturn,
        pnl,
        volume
      });
    }
    return data;
  }, [days]);

  // Cell Background Color Generator based on active metric
  const getCellBg = (day) => {
    if (day.isWeekend) return 'rgba(30, 41, 59, 0.3)';

    if (activeMetric === 'return') {
      const r = day.pctReturn;
      if (r > 3.0) return '#059669';
      if (r > 1.0) return '#10b981';
      if (r > 0.0) return 'rgba(16, 185, 129, 0.4)';
      if (r === 0) return '#1e293b';
      if (r > -1.5) return 'rgba(239, 68, 68, 0.4)';
      if (r > -3.0) return '#ef4444';
      return '#b91c1c';
    }

    if (activeMetric === 'volume') {
      const v = day.volume;
      if (v > 4000000) return '#3b82f6';
      if (v > 2500000) return 'rgba(59, 130, 246, 0.6)';
      return 'rgba(59, 130, 246, 0.25)';
    }

    // PnL mode
    const p = day.pnl;
    if (p > 500) return '#10b981';
    if (p > 0) return 'rgba(16, 185, 129, 0.4)';
    if (p < -500) return '#ef4444';
    return 'rgba(239, 68, 68, 0.4)';
  };

  return (
    <div style={{
      background: theme.colors.bgCard,
      borderRadius: theme.radius.lg,
      padding: '20px',
      border: `1px solid ${theme.colors.border}`,
      boxShadow: theme.shadows.card
    }}>
      {/* Header & Metric Selector Controls */}
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
            Trading Calendar Heatmap
          </h3>
          <p style={{ margin: '4px 0 0', color: theme.colors.textMuted, fontSize: '12px' }}>
            Daily financial performance, trading volume, and return intensity across trading sessions
          </p>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          {['return', 'volume', 'pnl'].map(m => (
            <button
              key={m}
              onClick={() => setActiveMetric(m)}
              style={{
                padding: '5px 12px',
                borderRadius: theme.radius.sm,
                fontSize: '12px',
                fontFamily: theme.fonts.mono,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: activeMetric === m ? theme.colors.accentPrimary : theme.colors.bgCardElevated,
                color: activeMetric === m ? '#ffffff' : theme.colors.textSecondary,
                textTransform: 'uppercase'
              }}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Container */}
      <div style={{ overflowX: 'auto', paddingBottom: '8px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(15, minmax(28px, 1fr))',
          gap: '6px',
          minWidth: '550px'
        }}>
          {calendarData.map((day, idx) => {
            const isHovered = hoverDay?.date === day.date;
            const bg = getCellBg(day);

            return (
              <div
                key={day.date}
                onMouseEnter={() => setHoverDay(day)}
                onMouseLeave={() => setHoverDay(null)}
                style={{
                  aspectRatio: '1',
                  background: bg,
                  borderRadius: theme.radius.sm,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontFamily: theme.fonts.mono,
                  color: day.isWeekend ? theme.colors.textDisabled : '#ffffff',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: isHovered ? `1px solid ${theme.colors.textPrimary}` : '1px solid transparent',
                  transform: isHovered ? 'scale(1.15)' : 'scale(1)',
                  transition: 'all 0.12s ease',
                  position: 'relative'
                }}
              >
                {idx + 1}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend & Hover Detail Footer */}
      <div style={{
        marginTop: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        fontSize: '12px',
        fontFamily: theme.fonts.mono
      }}>
        {hoverDay ? (
          <div style={{
            padding: '6px 12px',
            background: theme.colors.bgCardElevated,
            borderRadius: theme.radius.md,
            border: `1px solid ${theme.colors.borderLight}`,
            display: 'flex',
            gap: '14px',
            color: theme.colors.textPrimary
          }}>
            <span><b>{hoverDay.formattedDate}</b> ({hoverDay.dayName})</span>
            {hoverDay.isWeekend ? (
              <span style={{ color: theme.colors.textMuted }}>Market Closed</span>
            ) : (
              <>
                <span>Return: <b style={{ color: hoverDay.pctReturn >= 0 ? theme.colors.gain : theme.colors.loss }}>{formatPercent(hoverDay.pctReturn)}</b></span>
                <span>P&L: <b style={{ color: hoverDay.pnl >= 0 ? theme.colors.gain : theme.colors.loss }}>{formatCurrency(hoverDay.pnl)}</b></span>
                <span>Vol: <b>{hoverDay.volume.toLocaleString()}</b></span>
              </>
            )}
          </div>
        ) : (
          <span style={{ color: theme.colors.textMuted }}>Hover over any trading day to inspect session metrics</span>
        )}

        {/* Shading Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: theme.colors.textMuted }}>
          <span>Loss</span>
          <div style={{ width: '12px', height: '12px', background: '#b91c1c', borderRadius: '2px' }} />
          <div style={{ width: '12px', height: '12px', background: '#ef4444', borderRadius: '2px' }} />
          <div style={{ width: '12px', height: '12px', background: '#1e293b', borderRadius: '2px' }} />
          <div style={{ width: '12px', height: '12px', background: '#10b981', borderRadius: '2px' }} />
          <div style={{ width: '12px', height: '12px', background: '#059669', borderRadius: '2px' }} />
          <span>Gain</span>
        </div>
      </div>
    </div>
  );
}
