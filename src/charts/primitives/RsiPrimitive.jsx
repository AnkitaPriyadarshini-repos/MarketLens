import React, { useRef, useEffect, useState } from 'react';
import { theme } from '../../theme/designTokens';
import { ChartScale } from '../core/ChartScales';

export function RsiPrimitive({
  data = [],
  height = 100,
  hoverIndex = null,
  onHoverIndex = null
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

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

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const marginTop = 12;
    const marginBottom = 15;
    const marginRight = 65;
    const marginLeft = 10;

    const chartWidth = width - marginLeft - marginRight;
    const chartHeight = height - marginTop - marginBottom;

    // Fixed RSI Scale 0 to 100
    const rsiScale = new ChartScale(0, 100, marginTop + chartHeight, marginTop);
    const stepX = chartWidth / data.length;

    const y70 = rsiScale.priceToY(70);
    const y50 = rsiScale.priceToY(50);
    const y30 = rsiScale.priceToY(30);

    // Overbought (70-100) Translucent Fill
    ctx.fillStyle = 'rgba(239, 68, 68, 0.08)';
    ctx.fillRect(marginLeft, marginTop, chartWidth, y70 - marginTop);

    // Oversold (0-30) Translucent Fill
    ctx.fillStyle = 'rgba(16, 185, 129, 0.08)';
    ctx.fillRect(marginLeft, y30, chartWidth, marginTop + chartHeight - y30);

    // Guideline 70 Overbought
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(marginLeft, y70);
    ctx.lineTo(marginLeft + chartWidth, y70);
    ctx.stroke();

    // Guideline 50 Midpoint
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
    ctx.beginPath();
    ctx.moveTo(marginLeft, y50);
    ctx.lineTo(marginLeft + chartWidth, y50);
    ctx.stroke();

    // Guideline 30 Oversold
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.5)';
    ctx.beginPath();
    ctx.moveTo(marginLeft, y30);
    ctx.lineTo(marginLeft + chartWidth, y30);
    ctx.stroke();
    ctx.setLineDash([]);

    // Y Axis Labels
    ctx.fillStyle = theme.colors.textMuted;
    ctx.font = `10px ${theme.fonts.mono}`;
    ctx.textAlign = 'left';
    ctx.fillText('70', marginLeft + chartWidth + 6, y70 + 3);
    ctx.fillText('50', marginLeft + chartWidth + 6, y50 + 3);
    ctx.fillText('30', marginLeft + chartWidth + 6, y30 + 3);

    // Render RSI Oscillator Polyline
    ctx.strokeStyle = theme.colors.accentCyan;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    let started = false;

    data.forEach((d, i) => {
      if (d.rsi !== null && d.rsi !== undefined && !isNaN(d.rsi)) {
        const x = ChartScale.indexToX(i, stepX, marginLeft);
        const y = rsiScale.priceToY(d.rsi);
        if (!started) { ctx.moveTo(x, y); started = true; }
        else { ctx.lineTo(x, y); }
      }
    });
    ctx.stroke();

    // Crosshair & Active RSI Value Badge
    if (hoverIndex !== null && hoverIndex >= 0 && hoverIndex < data.length) {
      const activeItem = data[hoverIndex];
      const x = ChartScale.indexToX(hoverIndex, stepX, marginLeft);

      ctx.strokeStyle = 'rgba(248, 250, 252, 0.6)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);

      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
      ctx.setLineDash([]);

      if (activeItem.rsi !== null && activeItem.rsi !== undefined) {
        const y = rsiScale.priceToY(activeItem.rsi);

        // Pulse dot
        ctx.fillStyle = theme.colors.accentCyan;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();

        // Badge on Y axis
        ctx.fillStyle = activeItem.rsi >= 70 ? theme.colors.loss : activeItem.rsi <= 30 ? theme.colors.gain : theme.colors.accentCyan;
        ctx.fillRect(marginLeft + chartWidth, y - 8, marginRight - 5, 16);
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold 10px ${theme.fonts.mono}`;
        ctx.fillText(activeItem.rsi.toFixed(1), marginLeft + chartWidth + 4, y + 4);
      }
    }
  }, [data, height, hoverIndex, containerWidth]);

  const handleMouseMove = (e) => {
    if (!containerRef.current || !data.length) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - 10;
    const chartWidth = rect.width - 75;
    const stepX = chartWidth / data.length;
    const idx = ChartScale.xToIndex(x, stepX, 0, data.length);
    if (onHoverIndex) onHoverIndex(idx);
  };

  const handleMouseLeave = () => {
    if (onHoverIndex) onHoverIndex(null);
  };

  const activeRsi = hoverIndex !== null && data[hoverIndex] ? data[hoverIndex].rsi : null;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ width: '100%', height, position: 'relative', cursor: 'crosshair', userSelect: 'none' }}
    >
      <div style={{
        position: 'absolute',
        top: 4,
        left: 15,
        zIndex: 5,
        fontSize: '11px',
        fontFamily: theme.fonts.mono,
        color: theme.colors.textMuted,
        display: 'flex',
        gap: '8px'
      }}>
        <span>RSI (14)</span>
        {activeRsi !== null && activeRsi !== undefined && (
          <span style={{
            color: activeRsi >= 70 ? theme.colors.loss : activeRsi <= 30 ? theme.colors.gain : theme.colors.accentCyan,
            fontWeight: 700
          }}>
            {activeRsi.toFixed(2)} {activeRsi >= 70 ? '(Overbought)' : activeRsi <= 30 ? '(Oversold)' : ''}
          </span>
        )}
      </div>

      <canvas ref={canvasRef} />
    </div>
  );
}
