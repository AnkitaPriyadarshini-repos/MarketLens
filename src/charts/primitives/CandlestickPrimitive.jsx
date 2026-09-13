import React, { useRef, useEffect, useState, forwardRef } from 'react';
import { theme } from '../../theme/designTokens';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { ChartScale, calculateCandleGeometry } from '../core/ChartScales';

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
  const [containerWidth, setContainerWidth] = useState(0);

  const hoverIndex = externalHoverIndex !== null ? externalHoverIndex : internalHoverIndex;

  // Responsive Container ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setContainerWidth(entry.contentRect.width);
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

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
    const width = rect.width || containerWidth || 800;
    if (width <= 0 || height <= 0) return;

    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // Reset transform to prevent scale multiplication across re-renders
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const marginTop = 24;
    const marginBottom = 28;
    const marginRight = 65;
    const marginLeft = 10;

    const chartWidth = width - marginLeft - marginRight;
    const chartHeight = height - marginTop - marginBottom;

    const visibleCount = Math.max(10, Math.floor(data.length / zoomLevel));
    const startIdx = Math.max(0, Math.min(data.length - visibleCount, Math.floor(panOffset)));
    const visibleData = data.slice(startIdx, startIdx + visibleCount);

    if (!visibleData.length) return;

    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let maxVolume = 0;

    visibleData.forEach(d => {
      if (d.low < minPrice) minPrice = d.low;
      if (d.high > maxPrice) maxPrice = d.high;
      if (d.volume > maxVolume) maxVolume = d.volume;
    });

    // Add 2% padding to price bounds to prevent clipping candles
    const pricePadding = ((maxPrice - minPrice) || 1) * 0.02;
    minPrice = Math.max(0, minPrice - pricePadding);
    maxPrice += pricePadding;
    const priceRange = maxPrice - minPrice;

    const priceScale = new ChartScale(minPrice, maxPrice, marginTop + chartHeight, marginTop);
    const stepX = chartWidth / visibleData.length;

    // Subtle Horizontal & Vertical Grid Lines
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.35)';
    ctx.lineWidth = 0.5;
    ctx.fillStyle = theme.colors.textMuted;
    ctx.font = `11px ${theme.fonts.mono}`;
    ctx.textAlign = 'left';

    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
      const priceVal = minPrice + (priceRange * i) / gridLines;
      const yPos = priceScale.priceToY(priceVal);
      
      ctx.beginPath();
      ctx.moveTo(marginLeft, yPos);
      ctx.lineTo(marginLeft + chartWidth, yPos);
      ctx.stroke();

      ctx.fillText(`$${priceVal.toFixed(2)}`, marginLeft + chartWidth + 6, yPos + 4);
    }

    // Time Axis Tick Labels at bottom
    const tickStep = Math.max(1, Math.floor(visibleData.length / 6));
    ctx.textAlign = 'center';
    visibleData.forEach((d, i) => {
      if (i % tickStep === 0) {
        const xPos = ChartScale.indexToX(i, stepX, marginLeft);
        ctx.fillText(d.date || `P-${i}`, xPos, height - 8);
      }
    });

    // Integrated Volume Bars (bottom 22% of chart)
    if (showVolume && maxVolume > 0) {
      const volumeMaxH = chartHeight * 0.22;
      visibleData.forEach((d, i) => {
        const x = ChartScale.indexToX(i, stepX, marginLeft);
        const isBull = d.close >= d.open;
        const volH = (d.volume / maxVolume) * volumeMaxH;
        const y = marginTop + chartHeight - volH;

        ctx.fillStyle = isBull ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)';
        ctx.fillRect(x - (stepX * 0.7) / 2, y, stepX * 0.7, volH);
      });
    }

    // Technical Bollinger Bands Envelope Area & Translucent Fill
    if (showBollinger) {
      // Translucent Band Fill
      ctx.fillStyle = 'rgba(139, 92, 246, 0.08)';
      ctx.beginPath();
      let startedUpper = false;
      visibleData.forEach((d, i) => {
        if (d.bollingerUpper !== null && d.bollingerUpper !== undefined) {
          const x = ChartScale.indexToX(i, stepX, marginLeft);
          const y = priceScale.priceToY(d.bollingerUpper);
          if (!startedUpper) { ctx.moveTo(x, y); startedUpper = true; }
          else { ctx.lineTo(x, y); }
        }
      });

      for (let i = visibleData.length - 1; i >= 0; i--) {
        const d = visibleData[i];
        if (d.bollingerLower !== null && d.bollingerLower !== undefined) {
          const x = ChartScale.indexToX(i, stepX, marginLeft);
          const y = priceScale.priceToY(d.bollingerLower);
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.fill();

      // Band Lines
      ctx.strokeStyle = theme.colors.accentPurple;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);

      ctx.beginPath();
      let started = false;
      visibleData.forEach((d, i) => {
        if (d.bollingerUpper) {
          const x = ChartScale.indexToX(i, stepX, marginLeft);
          const y = priceScale.priceToY(d.bollingerUpper);
          if (!started) { ctx.moveTo(x, y); started = true; }
          else { ctx.lineTo(x, y); }
        }
      });
      ctx.stroke();

      ctx.beginPath();
      started = false;
      visibleData.forEach((d, i) => {
        if (d.bollingerLower) {
          const x = ChartScale.indexToX(i, stepX, marginLeft);
          const y = priceScale.priceToY(d.bollingerLower);
          if (!started) { ctx.moveTo(x, y); started = true; }
          else { ctx.lineTo(x, y); }
        }
      });
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Candlesticks via CandleGeometry Engine
    visibleData.forEach((d, i) => {
      const geom = calculateCandleGeometry(d, i, stepX, marginLeft, priceScale);
      const color = geom.isBullish ? theme.colors.gain : theme.colors.loss;

      // Wick line
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(geom.x, geom.yHigh);
      ctx.lineTo(geom.x, geom.yLow);
      ctx.stroke();

      // Candle body
      ctx.fillStyle = color;
      ctx.fillRect(geom.x - geom.candleWidth / 2, geom.bodyY, geom.candleWidth, geom.bodyHeight);
    });

    // Technical SMA 20 Overlay (Cyan line)
    if (showSma) {
      ctx.strokeStyle = theme.colors.accentCyan;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      let started = false;
      visibleData.forEach((d, i) => {
        if (d.sma20) {
          const x = ChartScale.indexToX(i, stepX, marginLeft);
          const y = priceScale.priceToY(d.sma20);
          if (!started) { ctx.moveTo(x, y); started = true; }
          else { ctx.lineTo(x, y); }
        }
      });
      ctx.stroke();
    }

    // Technical EMA 12 Overlay (Gold line)
    if (showEma) {
      ctx.strokeStyle = theme.colors.accentGold;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      let started = false;
      visibleData.forEach((d, i) => {
        if (d.ema12) {
          const x = ChartScale.indexToX(i, stepX, marginLeft);
          const y = priceScale.priceToY(d.ema12);
          if (!started) { ctx.moveTo(x, y); started = true; }
          else { ctx.lineTo(x, y); }
        }
      });
      ctx.stroke();
    }

    // Technical VWAP Overlay (Indigo line)
    if (showVwap) {
      ctx.strokeStyle = theme.colors.accentIndigo;
      ctx.lineWidth = 1.6;
      ctx.setLineDash([4, 2]);
      ctx.beginPath();
      let started = false;
      visibleData.forEach((d, i) => {
        if (d.vwap) {
          const x = ChartScale.indexToX(i, stepX, marginLeft);
          const y = priceScale.priceToY(d.vwap);
          if (!started) { ctx.moveTo(x, y); started = true; }
          else { ctx.lineTo(x, y); }
        }
      });
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Synchronized Crosshair Cursor, Price Badge & Time Badge
    const activeIdxInVisible = hoverIndex !== null ? hoverIndex - startIdx : null;
    if (activeIdxInVisible !== null && activeIdxInVisible >= 0 && activeIdxInVisible < visibleData.length) {
      const activeItem = visibleData[activeIdxInVisible];
      const x = ChartScale.indexToX(activeIdxInVisible, stepX, marginLeft);
      const y = priceScale.priceToY(activeItem.close);

      ctx.strokeStyle = 'rgba(248, 250, 252, 0.6)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);

      // Vertical guide line
      ctx.beginPath();
      ctx.moveTo(x, marginTop);
      ctx.lineTo(x, marginTop + chartHeight);
      ctx.stroke();

      // Horizontal guide line
      ctx.beginPath();
      ctx.moveTo(marginLeft, y);
      ctx.lineTo(marginLeft + chartWidth, y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Price Badge on Y-axis margin
      ctx.fillStyle = theme.colors.accentPrimary;
      ctx.fillRect(marginLeft + chartWidth, y - 10, marginRight - 5, 20);
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold 11px ${theme.fonts.mono}`;
      ctx.textAlign = 'left';
      ctx.fillText(`$${activeItem.close.toFixed(2)}`, marginLeft + chartWidth + 5, y + 4);

      // Date Badge on X-axis margin
      ctx.fillStyle = theme.colors.bgCardElevated;
      ctx.fillRect(x - 35, marginTop + chartHeight + 4, 70, 18);
      ctx.strokeStyle = theme.colors.borderLight;
      ctx.strokeRect(x - 35, marginTop + chartHeight + 4, 70, 18);
      ctx.fillStyle = theme.colors.textPrimary;
      ctx.font = `10px ${theme.fonts.mono}`;
      ctx.textAlign = 'center';
      ctx.fillText(activeItem.date || '', x, marginTop + chartHeight + 17);

      // Pulse Dot at cursor intersection
      ctx.fillStyle = theme.colors.accentCyan;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [data, height, showVolume, showSma, showEma, showBollinger, showVwap, zoomLevel, panOffset, hoverIndex, containerWidth]);

  const handleMouseMove = (e) => {
    if (!containerRef.current || !data.length) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - 10;
    const chartWidth = rect.width - 75;
    const visibleCount = Math.max(10, Math.floor(data.length / zoomLevel));
    const startIdx = Math.max(0, Math.min(data.length - visibleCount, Math.floor(panOffset)));
    const stepX = chartWidth / visibleCount;
    const relIdx = ChartScale.xToIndex(x, stepX, 0, visibleCount);
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
      {demoDataLabel && (
        <div style={{
          position: 'absolute',
          top: 8,
          right: 75,
          zIndex: 10,
          background: 'rgba(30, 41, 59, 0.85)',
          color: theme.colors.textMuted,
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '10px',
          fontFamily: theme.fonts.mono,
          fontWeight: 700,
          letterSpacing: '0.05em',
          border: `1px solid ${theme.colors.border}`
        }}>
          SIMULATED DEMO DATA
        </div>
      )}

      {activePoint && (
        <div style={{
          position: 'absolute',
          top: 8,
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
          {activePoint.sma20 && (
            <span style={{ color: theme.colors.accentCyan }}>SMA20: ${activePoint.sma20.toFixed(2)}</span>
          )}
        </div>
      )}

      <canvas ref={canvasRef} />
    </div>
  );
});
