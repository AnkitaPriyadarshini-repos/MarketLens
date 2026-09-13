import React, { useRef, useEffect, useState } from 'react';
import { theme } from '../../theme/designTokens';
import { formatCurrency } from '../../utils/formatters';

export function CandlestickPrimitive({
  data = [],
  height = 380,
  showVolume = true,
  showSma = true,
  showBollinger = false,
  showVwap = false,
  onHoverPoint = null
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [hoverIndex, setHoverIndex] = useState(null);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current || !data.length) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    // Margins
    const marginTop = 20;
    const marginBottom = 30;
    const marginRight = 55; // Y-axis price labels
    const marginLeft = 10;

    const chartWidth = width - marginLeft - marginRight;
    const chartHeight = height - marginTop - marginBottom;

    // Price Bounds
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let maxVolume = 0;

    data.forEach(d => {
      if (d.low < minPrice) minPrice = d.low;
      if (d.high > maxPrice) maxPrice = d.high;
      if (d.volume > maxVolume) maxVolume = d.volume;
    });

    const priceRange = (maxPrice - minPrice) || 1;

    const candleWidth = Math.max(2, (chartWidth / data.length) * 0.7);
    const stepX = chartWidth / data.length;

    // Helper functions for coordinate mapping
    const getX = (index) => marginLeft + index * stepX + stepX / 2;
    const getY = (price) => marginTop + chartHeight - ((price - minPrice) / priceRange) * chartHeight;

    // Draw Grid Lines & Y-Axis Labels
    ctx.strokeStyle = theme.colors.border;
    ctx.lineWidth = 0.5;
    ctx.fillStyle = theme.colors.textMuted;
    ctx.font = `11px ${theme.fonts.mono}`;
    ctx.textAlign = 'left';

    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
      const priceVal = minPrice + (priceRange * i) / gridLines;
      const yPos = getY(priceVal);
      
      ctx.beginPath();
      ctx.moveTo(marginLeft, yPos);
      ctx.lineTo(marginLeft + chartWidth, yPos);
      ctx.stroke();

      ctx.fillText(`$${priceVal.toFixed(2)}`, marginLeft + chartWidth + 6, yPos + 4);
    }

    // Draw Volume Bars if enabled (bottom 25% of chart)
    if (showVolume && maxVolume > 0) {
      const volumeHeightMax = chartHeight * 0.25;
      data.forEach((d, i) => {
        const x = getX(i);
        const isBullish = d.close >= d.open;
        const volHeight = (d.volume / maxVolume) * volumeHeightMax;
        const y = marginTop + chartHeight - volHeight;

        ctx.fillStyle = isBullish ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)';
        ctx.fillRect(x - candleWidth / 2, y, candleWidth, volHeight);
      });
    }

    // Draw Candlesticks (Wicks + Bodies)
    data.forEach((d, i) => {
      const x = getX(i);
      const isBullish = d.close >= d.open;
      const color = isBullish ? theme.colors.gain : theme.colors.loss;

      const yHigh = getY(d.high);
      const yLow = getY(d.low);
      const yOpen = getY(d.open);
      const yClose = getY(d.close);

      // Wick line
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x, yHigh);
      ctx.lineTo(x, yLow);
      ctx.stroke();

      // Body rect
      const bodyY = Math.min(yOpen, yClose);
      const bodyHeight = Math.max(1.5, Math.abs(yOpen - yClose));

      ctx.fillStyle = color;
      ctx.fillRect(x - candleWidth / 2, bodyY, candleWidth, bodyHeight);
    });

    // Draw SMA 20 Line Overlay
    if (showSma) {
      ctx.strokeStyle = theme.colors.accentCyan;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      let started = false;

      data.forEach((d, i) => {
        if (d.sma20) {
          const x = getX(i);
          const y = getY(d.sma20);
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      });
      ctx.stroke();
    }

    // Draw Bollinger Bands Overlay
    if (showBollinger) {
      ctx.strokeStyle = theme.colors.accentPurple;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);

      // Upper band
      ctx.beginPath();
      let started = false;
      data.forEach((d, i) => {
        if (d.bollingerUpper) {
          const x = getX(i);
          const y = getY(d.bollingerUpper);
          if (!started) { ctx.moveTo(x, y); started = true; }
          else { ctx.lineTo(x, y); }
        }
      });
      ctx.stroke();

      // Lower band
      ctx.beginPath();
      started = false;
      data.forEach((d, i) => {
        if (d.bollingerLower) {
          const x = getX(i);
          const y = getY(d.bollingerLower);
          if (!started) { ctx.moveTo(x, y); started = true; }
          else { ctx.lineTo(x, y); }
        }
      });
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw Crosshair on Hover
    if (hoverIndex !== null && hoverIndex >= 0 && hoverIndex < data.length) {
      const activeData = data[hoverIndex];
      const x = getX(hoverIndex);
      const y = getY(activeData.close);

      ctx.strokeStyle = 'rgba(248, 250, 252, 0.5)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);

      // Vertical line
      ctx.beginPath();
      ctx.moveTo(x, marginTop);
      ctx.lineTo(x, marginTop + chartHeight);
      ctx.stroke();

      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(marginLeft, y);
      ctx.lineTo(marginLeft + chartWidth, y);
      ctx.stroke();

      ctx.setLineDash([]);

      // Point pulse dot
      ctx.fillStyle = theme.colors.accentPrimary;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [data, height, showVolume, showSma, showBollinger, showVwap, hoverIndex]);

  const handleMouseMove = (e) => {
    if (!containerRef.current || !data.length) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - 10;
    const chartWidth = rect.width - 65;
    const stepX = chartWidth / data.length;
    const idx = Math.min(data.length - 1, Math.max(0, Math.floor(x / stepX)));
    setHoverIndex(idx);
    if (onHoverPoint) onHoverPoint(data[idx]);
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
    if (onHoverPoint) onHoverPoint(null);
  };

  const activePoint = hoverIndex !== null ? data[hoverIndex] : null;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ width: '100%', height, position: 'relative', cursor: 'crosshair', userSelect: 'none' }}
    >
      {/* Active Candle Hover Info Banner */}
      {activePoint && (
        <div style={{
          position: 'absolute',
          top: 10,
          left: 15,
          zIndex: 10,
          background: 'rgba(15, 23, 42, 0.9)',
          backdropFilter: 'blur(8px)',
          padding: '6px 14px',
          borderRadius: theme.radius.md,
          border: `1px solid ${theme.colors.borderLight}`,
          display: 'flex',
          gap: '12px',
          fontSize: '12px',
          fontFamily: theme.fonts.mono
        }}>
          <span style={{ color: theme.colors.textMuted }}>{activePoint.date}</span>
          <span style={{ color: theme.colors.textSecondary }}>O: <b style={{ color: '#f8fafc' }}>{formatCurrency(activePoint.open)}</b></span>
          <span style={{ color: theme.colors.textSecondary }}>H: <b style={{ color: '#f8fafc' }}>{formatCurrency(activePoint.high)}</b></span>
          <span style={{ color: theme.colors.textSecondary }}>L: <b style={{ color: '#f8fafc' }}>{formatCurrency(activePoint.low)}</b></span>
          <span style={{ color: activePoint.close >= activePoint.open ? theme.colors.gain : theme.colors.loss }}>
            C: <b>{formatCurrency(activePoint.close)}</b>
          </span>
          {activePoint.volume && (
            <span style={{ color: theme.colors.textMuted }}>Vol: {activePoint.volume.toLocaleString()}</span>
          )}
        </div>
      )}

      <canvas ref={canvasRef} />
    </div>
  );
}
