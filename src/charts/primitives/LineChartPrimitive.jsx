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
    return Math.floor(Math.min(...prices) * 0.995);
  }, [data]);

  const maxPrice = useMemo(() => {
    if (!data.length) return 100;
    const prices = data.map(d => d.price || d.close || 0);
    return Math.ceil(Math.max(...prices) * 1.005);
  }, [data]);

  const gradientId = useMemo(() => `area-gradient-${Math.random().toString(36).substr(2, 9)}`, []);

  const isPositive = useMemo(() => {
    if (data.length < 2) return true;
    const first = data[0].price || data[0].close || 0;
    const last = data[data.length - 1].price || data[data.length - 1].close || 0;
    return last >= first;
  }, [data]);

  const strokeColor = isPositive ? theme.colors.gain : theme.colors.loss;

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
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.colors.textMuted }}>
        No chart data available
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height, position: 'relative', userSelect: 'none' }}>
      {/* Interactive Tooltip Banner */}
      {hoverData && (
        <div style={{
          position: 'absolute',
          top: 10,
          left: 15,
          zIndex: 10,
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(8px)',
          padding: '6px 12px',
          borderRadius: theme.radius.md,
          border: `1px solid ${theme.colors.borderLight}`,
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          fontFamily: theme.fonts.mono,
          fontSize: '13px'
        }}>
          <span style={{ color: theme.colors.textMuted }}>{hoverData.date}</span>
          <span style={{ color: theme.colors.textPrimary, fontWeight: 700 }}>
            {formatCurrency(hoverData.price || hoverData.close)}
          </span>
          {hoverData.sma20 && (
            <span style={{ color: theme.colors.accentCyan }}>SMA20: {formatCurrency(hoverData.sma20)}</span>
          )}
          {hoverData.rsi && (
            <span style={{ color: theme.colors.accentGold }}>RSI: {hoverData.rsi}</span>
          )}
        </div>
      )}

      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          margin={{ top: 15, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={strokeColor} stopOpacity={0.4} />
              <stop offset="95%" stopColor={strokeColor} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: theme.colors.textMuted, fontSize: 11, fontFamily: theme.fonts.main }} 
            dy={5}
          />
          <YAxis 
            domain={[minPrice, maxPrice]} 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: theme.colors.textMuted, fontSize: 11, fontFamily: theme.fonts.mono }} 
            orientation="right"
            tickFormatter={(val) => `$${val}`}
          />
          <Tooltip content={() => null} />
          
          {showArea && (
            <Area
              type="monotone"
              dataKey="price"
              stroke={strokeColor}
              strokeWidth={2.5}
              fillOpacity={1}
              fill={`url(#${gradientId})`}
              isAnimationActive={true}
              animationDuration={800}
            />
          )}

          {showSma && (
            <Area
              type="monotone"
              dataKey="sma20"
              stroke={theme.colors.accentCyan}
              strokeWidth={1.5}
              strokeDasharray="4 4"
              fill="none"
              isAnimationActive={false}
            />
          )}

          {showBollinger && (
            <>
              <Area
                type="monotone"
                dataKey="bollingerUpper"
                stroke={theme.colors.accentPurple}
                strokeWidth={1}
                strokeDasharray="3 3"
                fill="none"
              />
              <Area
                type="monotone"
                dataKey="bollingerLower"
                stroke={theme.colors.accentPurple}
                strokeWidth={1}
                strokeDasharray="3 3"
                fill="none"
              />
            </>
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
