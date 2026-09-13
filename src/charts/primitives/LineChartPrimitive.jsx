import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { theme } from '../../theme/designTokens';
import { formatCurrency, formatPercent } from '../../utils/formatters';

export function LineChartPrimitive({
  data = [],
  height = 350,
  showArea = true,
  color = theme.colors.gain,
  showSma = false,
  showBollinger = false,
  onHoverPoint = null,
  interactive = true
}) {
  const [hoverData, setHoverData] = useState(null);

  const minPrice = useMemo(() => {
    if (!data.length) return 0;
    const prices = data.map(d => d.price || d.close || 0);
    return Math.floor(Math.min(...prices) * 0.99);
  }, [data]);

  const maxPrice = useMemo(() => {
    if (!data.length) return 100;
    const prices = data.map(d => d.price || d.close || 0);
    return Math.ceil(Math.max(...prices) * 1.01);
  }, [data]);

  const handleMouseMove = (state) => {
    if (state && state.activePayload && state.activePayload.length) {
      const point = state.activePayload[0].payload;
      setHoverData(point);
      if (onHoverPoint) onHoverPoint(point);
    }
  };

  const handleMouseLeave = () => {
    setHoverData(null);
    if (onHoverPoint) onHoverPoint(null);
  };

  if (!data || data.length === 0) {
    return (
      <div style={{
        width: '100%',
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: theme.colors.bgCard,
        borderRadius: theme.radius.md,
        color: theme.colors.textMuted,
        fontFamily: theme.fonts.mono
      }}>
        No Chart Data Available
      </div>
    );
  }

  const gradientId = `lineChartGradient-${color.replace('#', '')}`;

  return (
    <div style={{ width: '100%', height, position: 'relative', userSelect: 'none' }}>
      {hoverData && (
        <div style={{
          position: 'absolute',
          top: 12,
          left: 15,
          zIndex: 10,
          background: 'rgba(15, 23, 42, 0.92)',
          backdropFilter: 'blur(10px)',
          padding: '6px 14px',
          borderRadius: theme.radius.md,
          border: `1px solid ${theme.colors.borderLight}`,
          display: 'flex',
          gap: '12px',
          fontSize: '12px',
          fontFamily: theme.fonts.mono,
          boxShadow: theme.shadows.card
        }}>
          <span style={{ color: theme.colors.textMuted }}>{hoverData.date}</span>
          <span style={{ color: theme.colors.textSecondary }}>
            Price: <b style={{ color: '#fff' }}>{formatCurrency(hoverData.price || hoverData.close)}</b>
          </span>
          {hoverData.changePercent !== undefined && (
            <span style={{ color: hoverData.changePercent >= 0 ? theme.colors.gain : theme.colors.loss }}>
              {formatPercent(hoverData.changePercent)}
            </span>
          )}
        </div>
      )}

      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={data}
          onMouseMove={interactive ? handleMouseMove : undefined}
          onMouseLeave={interactive ? handleMouseLeave : undefined}
          margin={{ top: 15, right: 20, left: 10, bottom: 5 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.35} />
              <stop offset="95%" stopColor={color} stopOpacity={0.0} />
            </linearGradient>
          </defs>

          <XAxis
            dataKey="date"
            stroke={theme.colors.textMuted}
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: theme.colors.border }}
            fontFamily={theme.fonts.mono}
          />

          <YAxis
            domain={[minPrice, maxPrice]}
            stroke={theme.colors.textMuted}
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: theme.colors.border }}
            tickFormatter={(val) => `$${val}`}
            orientation="right"
            fontFamily={theme.fonts.mono}
          />

          <Tooltip
            content={<></>}
            cursor={{ stroke: 'rgba(248, 250, 252, 0.5)', strokeWidth: 1, strokeDasharray: '4 4' }}
          />

          {showArea && (
            <Area
              type="monotone"
              dataKey={d => d.price || d.close}
              stroke={color}
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#${gradientId})`}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
