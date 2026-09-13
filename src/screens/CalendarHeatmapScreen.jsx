import React, { useState } from 'react';
import { Calendar, BarChart2, DollarSign, Activity } from 'lucide-react';
import { theme } from '../theme/designTokens';
import { CalendarHeatmapPrimitive } from '../charts/primitives/CalendarHeatmapPrimitive';

export function CalendarHeatmapScreen() {
  const [metric, setMetric] = useState('return'); // 'return' | 'pnl' | 'volume'
  const [days, setDays] = useState(90);

  return (
    <div style={{ width: '100%', fontFamily: theme.fonts.main, color: theme.colors.textPrimary }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justify: 'space-between',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '20px',
        background: theme.colors.bgCard,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radius.xl,
        padding: '20px'
      }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={20} color={theme.colors.accentPurple} /> Financial Activity Calendar Heatmap
          </h2>
          <span style={{ fontSize: '12px', color: theme.colors.textMuted }}>
            GitHub-Style Time-Series Matrix of Trading Activity & Daily Portfolio Returns
          </span>
        </div>

        {/* Metric Switcher */}
        <div style={{ display: 'flex', background: theme.colors.bgDark, padding: '3px', borderRadius: theme.radius.md }}>
          <button
            onClick={() => setMetric('return')}
            style={{
              padding: '6px 14px',
              borderRadius: theme.radius.sm,
              border: 'none',
              background: metric === 'return' ? theme.colors.accentPrimary : 'transparent',
              color: metric === 'return' ? '#fff' : theme.colors.textMuted,
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Daily Return %
          </button>
          <button
            onClick={() => setMetric('pnl')}
            style={{
              padding: '6px 14px',
              borderRadius: theme.radius.sm,
              border: 'none',
              background: metric === 'pnl' ? theme.colors.accentPrimary : 'transparent',
              color: metric === 'pnl' ? '#fff' : theme.colors.textMuted,
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            P&L ($)
          </button>
          <button
            onClick={() => setMetric('volume')}
            style={{
              padding: '6px 14px',
              borderRadius: theme.radius.sm,
              border: 'none',
              background: metric === 'volume' ? theme.colors.accentPrimary : 'transparent',
              color: metric === 'volume' ? '#fff' : theme.colors.textMuted,
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Volume Intensity
          </button>
        </div>
      </div>

      <div style={{
        background: theme.colors.bgCard,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radius.xl,
        padding: '24px'
      }}>
        <CalendarHeatmapPrimitive metric={metric} days={days} />
      </div>
    </div>
  );
}
