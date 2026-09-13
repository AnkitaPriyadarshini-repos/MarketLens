import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { theme } from '../../theme/designTokens';
import { formatCurrency, formatPercent } from '../../utils/formatters';

export function BarChartPrimitive({
  data = [],
  height = 300,
  horizontal = false,
  dataKey = 'value',
  nameKey = 'name',
  colorKey = null,
  valueFormatter = (val) => val
}) {
  if (!data || data.length === 0) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.colors.textMuted }}>
        No bar chart data available
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout={horizontal ? 'vertical' : 'horizontal'}
          margin={{ top: 10, right: 20, left: horizontal ? 40 : -10, bottom: horizontal ? 0 : 25 }}
        >
          {horizontal ? (
            <>
              <XAxis type="number" hide />
              <YAxis 
                type="category" 
                dataKey={nameKey} 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: theme.colors.textSecondary, fontSize: 12, fontFamily: theme.fonts.main }}
                width={80}
              />
            </>
          ) : (
            <>
              <XAxis 
                dataKey={nameKey} 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: theme.colors.textSecondary, fontSize: 11, fontFamily: theme.fonts.main }}
                dy={5}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: theme.colors.textMuted, fontSize: 11, fontFamily: theme.fonts.mono }} 
                orientation="right"
                tickFormatter={valueFormatter}
              />
            </>
          )}

          <Tooltip
            cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                const val = item[dataKey];
                return (
                  <div style={{
                    background: '#0f172a',
                    border: `1px solid ${theme.colors.borderLight}`,
                    padding: '8px 12px',
                    borderRadius: theme.radius.md,
                    color: '#f8fafc',
                    fontFamily: theme.fonts.main,
                    fontSize: '12px'
                  }}>
                    <div style={{ fontWeight: 600, color: theme.colors.textSecondary }}>{item[nameKey]}</div>
                    <div style={{ fontWeight: 700, fontSize: '14px', fontFamily: theme.fonts.mono, marginTop: '2px' }}>
                      {valueFormatter(val)}
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />

          <Bar dataKey={dataKey} radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]}>
            {data.map((entry, index) => {
              let fill = theme.colors.accentPrimary;
              if (colorKey && entry[colorKey] !== undefined) {
                fill = entry[colorKey] >= 0 ? theme.colors.gain : theme.colors.loss;
              } else if (entry.color) {
                fill = entry.color;
              } else {
                fill = theme.colors.chartSeries[index % theme.colors.chartSeries.length];
              }
              return <Cell key={`cell-${index}`} fill={fill} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
