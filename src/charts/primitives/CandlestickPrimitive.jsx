import React, { useRef, useEffect, useState, forwardRef } from 'react';
import { theme } from '../../theme/designTokens';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { ChartScale, calculateCandleGeometry } from '../core/ChartScales';
import { generateNiceTicks, formatAdaptivePrice } from '../core/AxisEngine';

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

    const marginTop = 20;
    const marginBottom = 26;
    const marginRight = 70;
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

    // Add 2.5% padding to price bounds to prevent candles touching plot edges
    const pricePadding = ((maxPrice - minPrice) || 1) * 0.025;
    minPrice = Math.max(0, minPrice - pricePadding);
    maxPrice += pricePadding;

    const priceScale = new ChartScale(minPrice, maxPrice, marginTop + chartHeight, marginTop);
    const stepX = chartWidth / visibleData.length;

    // Adaptive Nice Price Ticks Generation
    const niceTicks = generateNiceTicks(minPrice, maxPrice, 6);
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.35)';
    ctx.lineWidth = 0.5;
    ctx.fillStyle = theme.colors.textMuted;
    ctx.font = `11px ${theme.fonts.mono}`;
    ctx.textAlign = 'left';

    niceTicks.forEach(tickVal => {
      const yPos = priceScale.priceToY(tickVal);
      if (yPos >= marginTop && yPos <= marginTop + chartHeight) {
        ctx.beginPath();
        ctx.moveTo(marginLeft, yPos);
        ctx.lineTo(marginLeft + chartWidth, yPos);
        ctx.stroke();

        ctx.fillText(formatAdaptivePrice(tickVal), marginLeft + chartWidth + 6, yPos + 4);
      }
    });

    // Time Axis Ticks (Intelligent Spacing)
    const tickStep = Math.max(1, Math.floor(visibleData.length / Math.max(2, Math.floor(chartWidth / 90))));
    ctx.textAlign = 'center';
    visibleData.forEach((d, i) => {
      if (i % tickStep === 0) {
        const xPos = ChartScale.indexToX(i, stepX, marginLeft);
        ctx.fillText(d.date || `P-${i}`, xPos, height - 7);
      }
    });

    // Volume Bars (integrated bottom 20% of main pane)
    if (showVolume && maxVolume > 0) {
      const volumeMaxH = chartHeight * 0.20;
      visibleData.forEach((d, i) => {
        const x = ChartScale.indexToX(i, stepX, marginLeft);
        const isBull = d.close >= d.open;
        const volH = (d.volume / maxVolume) * volumeMaxH;
        const y = marginTop + chartHeight - volH;

        ctx.fillStyle = isBull ? 'rgba(16, 185, 129, 0.22)' : 'rgba(239, 68, 68, 0.22)';
        ctx.fillRect(x - (stepX * 0.75) / 2, y, stepX * 0.75, volH);
      });
    }

    // Bollinger Bands Translucent Fill & Envelope
    if (showBollinger) {
      // Area Fill
      ctx.fillStyle = 'rgba(139, 92, 246, 0.07)';
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

      // Envelope Lines
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

      // Wick (1.0px thin line)
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(geom.x, geom.yHigh);
      ctx.lineTo(geom.x, geom.yLow);
      ctx.stroke();

      // Body
      ctx.fillStyle = color;
      ctx.fillRect(geom.x - geom.candleWidth / 2, geom.bodyY, geom.candleWidth, geom.bodyHeight);
    });

    // Technical SMA 20 Overlay (Cyan line)
    if (showSma) {
      ctx.strokeStyle = theme.colors.accentCyan;
      ctx.lineWidth = 1.6;
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
      ctx.lineWidth = 1.6;
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
      ctx.lineWidth = 1.5;
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

      ctx.strokeStyle = 'rgba(248, 250, 252, 0.65)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);

      // Vertical crosshair guide
      ctx.beginPath();
      ctx.moveTo(x, marginTop);
      ctx.lineTo(x, marginTop + chartHeight);
      ctx.stroke();

      // Horizontal crosshair guide
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
      ctx.textAlign = 'left';
      ctx.fillText(formatAdaptivePrice(activeItem.close), marginLeft + chartWidth + 5, y + 4);

      // Date Badge on X-axis
      ctx.fillStyle = theme.colors.bgCardElevated;
      ctx.fillRect(x - 35, marginTop + chartHeight + 3, 70, 18);
      ctx.strokeStyle = theme.colors.borderLight;
      ctx.strokeRect(x - 35, marginTop + chartHeight + 3, 70, 18);
      ctx.fillStyle = theme.colors.textPrimary;
      ctx.font = `10px ${theme.fonts.mono}`;
      ctx.textAlign = 'center';
      ctx.fillText(activeItem.date || '', x, marginTop + chartHeight + 16);

      // Pulse Dot at intersection
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
    const chartWidth = rect.width - 80;
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
  const prevPoint = hoverIndex !== null && hoverIndex > 0 && data[hoverIndex - 1] ? data[hoverIndex - 1] : null;

  let changeVal = 0;
  let changePct = 0;
  if (activePoint) {
    const basePrice = prevPoint ? prevPoint.close : activePoint.open;
    changeVal = activePoint.close - basePrice;
    changePct = basePrice > 0 ? (changeVal / basePrice) * 100 : 0;
  }

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
          right: 80,
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

      {/* Terminal-style Floating Tooltip Pill */}
      {activePoint && (
        <div style={{
          position: 'absolute',
          top: 8,
          left: 15,
          zIndex: 10,
          background: 'rgba(15, 23, 42, 0.94)',
          backdropFilter: 'blur(10px)',
          padding: '6px 14px',
          borderRadius: theme.radius.md,
          border: `1px solid ${theme.colors.borderLight}`,
          display: 'flex',
          gap: '12px',
          fontSize: '12px',
          fontFamily: theme.fonts.mono,
          boxShadow: theme.shadows.card,
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <span style={{ color: theme.colors.textMuted }}>{activePoint.date}</span>
          <span style={{ color: theme.colors.textSecondary }}>O: <b style={{ color: '#fff' }}>{formatAdaptivePrice(activePoint.open)}</b></span>
          <span style={{ color: theme.colors.textSecondary }}>H: <b style={{ color: '#fff' }}>{formatAdaptivePrice(activePoint.high)}</b></span>
          <span style={{ color: theme.colors.textSecondary }}>L: <b style={{ color: '#fff' }}>{formatAdaptivePrice(activePoint.low)}</b></span>
          <span style={{ color: activePoint.close >= activePoint.open ? theme.colors.gain : theme.colors.loss }}>
            C: <b>{formatAdaptivePrice(activePoint.close)}</b>
          </span>
          <span style={{ color: changePct >= 0 ? theme.colors.gain : theme.colors.loss, fontWeight: 700 }}>
            {changePct >= 0 ? '+' : ''}{changePct.toFixed(2)}%
          </span>
          {activePoint.volume && (
            <span style={{ color: theme.colors.textMuted }}>Vol: {activePoint.volume.toLocaleString()}</span>
          )}
          {activePoint.sma20 && showSma && (
            <span style={{ color: theme.colors.accentCyan }}>SMA20: {formatAdaptivePrice(activePoint.sma20)}</span>
          )}
          {activePoint.ema12 && showEma && (
            <span style={{ color: theme.colors.accentGold }}>EMA12: {formatAdaptivePrice(activePoint.ema12)}</span>
          )}
        </div>
      )}

      <canvas ref={canvasRef} />
    </div>
  );
});
