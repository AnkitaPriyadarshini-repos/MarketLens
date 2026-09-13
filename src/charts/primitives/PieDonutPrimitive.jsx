import React, { useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { theme } from '../../theme/designTokens';
import { formatCurrency, formatPercent } from '../../utils/formatters';

export function PieDonutPrimitive({
  data = [],
  height = 300,
  isDonut = true,
  dataKey = 'value',
  nameKey = 'name',
  centerTitle = 'Total Value',
  centerValue = null,
  valueFormatter = (val) => formatCurrency(val)
}) {
  const [activeIndex, setActiveIndex] = useState(null);

  const colors = [
    '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4',
    '#ec4899', '#34d399', '#f43f5e', '#a855f7', '#64748b'
  ];

  const totalSum = data.reduce((acc, curr) => acc + (curr[dataKey] || 0), 0);

  return (
    <div style={{ width: '100%', height, position: 'relative' }}>
      {/* Center Donut Label */}
      {isDonut && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          pointerEvents: 'none',
          zIndex: 5
        }}>
          <div style={{ fontSize: '11px', color: theme.colors.textMuted, textTransform: 'uppercase', tracking: '0.05em' }}>
            {centerTitle}
          </div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: theme.colors.textPrimary, fontFamily: theme.fonts.mono, marginTop: '2px' }}>
            {centerValue !== null ? centerValue : valueFormatter(totalSum)}
          </div>
        </div>
      )}

      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                const val = item[dataKey];
                const pct = totalSum > 0 ? (val / totalSum) * 100 : 0;
                return (
                  <div style={{
                    background: '#0f172a',
                    border: `1px solid ${theme.colors.borderLight}`,
                    padding: '8px 12px',
                    borderRadius: theme.radius.md,
                    color: '#f8fafc',
                    fontFamily: theme.fonts.main,
                    fontSize: '12px',
                    boxShadow: theme.shadows.card
                  }}>
                    <div style={{ fontWeight: 600, color: theme.colors.textSecondary }}>{item[nameKey]}</div>
                    <div style={{ fontWeight: 700, fontSize: '14px', fontFamily: theme.fonts.mono, marginTop: '2px' }}>
                      {valueFormatter(val)} ({pct.toFixed(1)}%)
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />

          <Pie
            data={data}
            dataKey={dataKey}
            nameKey={nameKey}
            cx="50%"
            cy="50%"
            innerRadius={isDonut ? '60%' : '0%'}
            outerRadius="85%"
            paddingAngle={isDonut ? 4 : 2}
            onMouseEnter={(_, idx) => setActiveIndex(idx)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || colors[index % colors.length]}
                stroke={theme.colors.bgCard}
                strokeWidth={2}
                style={{
                  filter: activeIndex === index ? 'brightness(1.2)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
