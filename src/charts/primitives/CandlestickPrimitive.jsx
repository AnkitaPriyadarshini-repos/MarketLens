import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { theme } from '../../theme/designTokens';
import { formatCurrency } from '../../utils/formatters';

export const CandlestickPrimitive = forwardRef(function CandlestickPrimitive({
  data = [],
  height = 380,
  showVolume = true,
  showSma = true,
  showEma = false,
  showBollinger = false,
  showVwap = false,
  zoomLevel = 1.0,
  panOffset = 0,
  onHoverPoint = null,
  externalHoverIndex = null,
  demoDataLabel = true
}, ref) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [internalHoverIndex, setHoverIndex] = useState(null);

  const hoverIndex = externalHoverIndex !== null ? externalHoverIndex : internalHoverIndex;

  // Keyboard navigation listener (Left/Right arrow keys)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!data || data.length === 0) return;
      if (e.key === 'ArrowRight') {
        setHoverIndex(prev => {
          const nextIdx = prev === null ? 0 : Math.min(data.length - 1, prev + 1);
          if (onHoverPoint) onHoverPoint(data[nextIdx], nextIdx);
          return nextIdx;
        });
      } else if (e.key === 'ArrowLeft') {
        setHoverIndex(prev => {
          const nextIdx = prev === null ? data.length - 1 : Math.max(0, prev - 1);
          if (onHoverPoint) onHoverPoint(data[nextIdx], nextIdx);
          return nextIdx;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [data, onHoverPoint]);

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
    const marginTop = 24;
    const marginBottom = 28;
    const marginRight = 65; // Y-axis price badge column
    const marginLeft = 10;

    const chartWidth = width - marginLeft - marginRight;
    const chartHeight = height - marginTop - marginBottom;

    // Apply Zoom & Pan window slice
    const visibleCount = Math.max(10, Math.floor(data.length / zoomLevel));
    const startIdx = Math.max(0, Math.min(data.length - visibleCount, Math.floor(panOffset)));
    const visibleData = data.slice(startIdx, startIdx + visibleCount);

    if (!visibleData.length) return;

    // Calculate Min/Max Price and Volume
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let maxVolume = 0;

    visibleData.forEach(d => {
      if (d.low < minPrice) minPrice = d.low;
      if (d.high > maxPrice) maxPrice = d.high;
      if (d.volume > maxVolume) maxVolume = d.volume;
    });

    const priceRange = (maxPrice - minPrice) || 1;
    const candleWidth = Math.max(2, (chartWidth / visibleData.length) * 0.7);
    const stepX = chartWidth / visibleData.length;

    const getX = (i) => marginLeft + i * stepX + stepX / 2;
    const getY = (price) => marginTop + chartHeight - ((price - minPrice) / priceRange) * chartHeight;

    // Grid Lines & Price Labels
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

    // Volume Bars (bottom 25% of chart)
    if (showVolume && maxVolume > 0) {
      const volumeMaxH = chartHeight * 0.25;
      visibleData.forEach((d, i) => {
        const x = getX(i);
        const isBull = d.close >= d.open;
        const volH = (d.volume / maxVolume) * volumeMaxH;
        const y = marginTop + chartHeight - volH;

        ctx.fillStyle = isBull ? 'rgba(16, 185, 129, 0.22)' : 'rgba(239, 68, 68, 0.22)';
        ctx.fillRect(x - candleWidth / 2, y, candleWidth, volH);
      });
    }

    // Candlesticks (Wicks + Bodies)
    visibleData.forEach((d, i) => {
      const x = getX(i);
      const isBull = d.close >= d.open;
      const color = isBull ? theme.colors.gain : theme.colors.loss;

      const yHigh = getY(d.high);
      const yLow = getY(d.low);
      const yOpen = getY(d.open);
      const yClose = getY(d.close);

      // Wick
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x, yHigh);
      ctx.lineTo(x, yLow);
      ctx.stroke();

      // Body
      const bodyY = Math.min(yOpen, yClose);
      const bodyH = Math.max(1.5, Math.abs(yOpen - yClose));

      ctx.fillStyle = color;
      ctx.fillRect(x - candleWidth / 2, bodyY, candleWidth, bodyH);
    });

    // Technical SMA 20 Overlay
    if (showSma) {
      ctx.strokeStyle = theme.colors.accentCyan;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      let started = false;
      visibleData.forEach((d, i) => {
        if (d.sma20) {
          const x = getX(i);
          const y = getY(d.sma20);
          if (!started) { ctx.moveTo(x, y); started = true; }
          else { ctx.lineTo(x, y); }
        }
      });
      ctx.stroke();
    }

    // Technical Bollinger Bands Overlay
    if (showBollinger) {
      ctx.strokeStyle = theme.colors.accentPurple;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);

      ctx.beginPath();
      let started = false;
      visibleData.forEach((d, i) => {
        if (d.bollingerUpper) {
          const x = getX(i);
          const y = getY(d.bollingerUpper);
          if (!started) { ctx.moveTo(x, y); started = true; }
          else { ctx.lineTo(x, y); }
        }
      });
      ctx.stroke();

      ctx.beginPath();
      started = false;
      visibleData.forEach((d, i) => {
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

    // Synchronized Crosshair Cursor & Axis Badges
    const activeIdxInVisible = hoverIndex !== null ? hoverIndex - startIdx : null;
    if (activeIdxInVisible !== null && activeIdxInVisible >= 0 && activeIdxInVisible < visibleData.length) {
      const activeItem = visibleData[activeIdxInVisible];
      const x = getX(activeIdxInVisible);
      const y = getY(activeItem.close);

      ctx.strokeStyle = 'rgba(248, 250, 252, 0.6)';
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

      // Price Badge on Y-axis
      ctx.fillStyle = theme.colors.accentPrimary;
      ctx.fillRect(marginLeft + chartWidth, y - 10, marginRight - 5, 20);
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold 11px ${theme.fonts.mono}`;
      ctx.fillText(`$${activeItem.close.toFixed(2)}`, marginLeft + chartWidth + 5, y + 4);

      // Pulse Dot
      ctx.fillStyle = theme.colors.accentCyan;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [data, height, showVolume, showSma, showEma, showBollinger, showVwap, zoomLevel, panOffset, hoverIndex]);

  const handleMouseMove = (e) => {
    if (!containerRef.current || !data.length) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - 10;
    const chartWidth = rect.width - 75;
    const visibleCount = Math.max(10, Math.floor(data.length / zoomLevel));
    const startIdx = Math.max(0, Math.min(data.length - visibleCount, Math.floor(panOffset)));
    const stepX = chartWidth / visibleCount;
    const relIdx = Math.min(visibleCount - 1, Math.max(0, Math.floor(x / stepX)));
    const absIdx = startIdx + relIdx;

    setHoverIndex(absIdx);
    if (onHoverPoint) onHoverPoint(data[absIdx], absIdx);
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
    if (onHoverPoint) onHoverPoint(null, null);
  };

  const activePoint = hoverIndex !== null && data[hoverIndex] ? data[hoverIndex] : null;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ width: '100%', height, position: 'relative', cursor: 'crosshair', userSelect: 'none' }}
    >
      {/* Demo Data Notice Badge */}
      {demoDataLabel && (
        <div style={{
          position: 'absolute',
          top: 8,
          right: 75,
          zIndex: 10,
          background: 'rgba(30, 41, 59, 0.8)',
          color: theme.colors.textMuted,
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '10px',
          fontFamily: theme.fonts.mono,
          fontWeight: 700,
          letterSpacing: '0.05em'
        }}>
          SIMULATED DEMO DATA
        </div>
      )}

      {/* Hover OHLC Banner */}
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
          <span style={{ color: theme.colors.textSecondary }}>O: <b style={{ color: '#fff' }}>{formatCurrency(activePoint.open)}</b></span>
          <span style={{ color: theme.colors.textSecondary }}>H: <b style={{ color: '#fff' }}>{formatCurrency(activePoint.high)}</b></span>
          <span style={{ color: theme.colors.textSecondary }}>L: <b style={{ color: '#fff' }}>{formatCurrency(activePoint.low)}</b></span>
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
});
