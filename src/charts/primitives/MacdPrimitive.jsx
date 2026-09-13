import React, { useRef, useEffect, useState } from 'react';
import { theme } from '../../theme/designTokens';
import { ChartScale } from '../core/ChartScales';

export function MacdPrimitive({
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
    const marginRight = 70;
    const marginLeft = 10;

    const chartWidth = width - marginLeft - marginRight;
    const chartHeight = height - marginTop - marginBottom;

    // Determine MACD Min / Max bounds
    let minVal = Infinity;
    let maxVal = -Infinity;

    data.forEach(d => {
      if (d.macdLine !== null && d.macdLine !== undefined) {
        if (d.macdLine < minVal) minVal = d.macdLine;
        if (d.macdLine > maxVal) maxVal = d.macdLine;
      }
      if (d.macdSignal !== null && d.macdSignal !== undefined) {
        if (d.macdSignal < minVal) minVal = d.macdSignal;
        if (d.macdSignal > maxVal) maxVal = d.macdSignal;
      }
      if (d.macdHist !== null && d.macdHist !== undefined) {
        if (d.macdHist < minVal) minVal = d.macdHist;
        if (d.macdHist > maxVal) maxVal = d.macdHist;
      }
    });

    if (minVal === Infinity || maxVal === -Infinity) {
      minVal = -1;
      maxVal = 1;
    }

    const bound = Math.max(Math.abs(minVal), Math.abs(maxVal), 0.1) * 1.1;
    const macdScale = new ChartScale(-bound, bound, marginTop + chartHeight, marginTop);
    const stepX = chartWidth / data.length;
    const barWidth = Math.max(1.5, Math.min(32, stepX * 0.75));
    const zeroY = macdScale.priceToY(0);

    // Center Zero Baseline
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(marginLeft, zeroY);
    ctx.lineTo(marginLeft + chartWidth, zeroY);
    ctx.stroke();

    // Axis Labels
    ctx.fillStyle = theme.colors.textMuted;
    ctx.font = `10px ${theme.fonts.mono}`;
    ctx.textAlign = 'left';
    ctx.fillText(`+${bound.toFixed(2)}`, marginLeft + chartWidth + 6, marginTop + 8);
    ctx.fillText('0.00', marginLeft + chartWidth + 6, zeroY + 3);
    ctx.fillText(`-${bound.toFixed(2)}`, marginLeft + chartWidth + 6, marginTop + chartHeight - 2);

    // Render MACD Histogram Bars
    data.forEach((d, i) => {
      if (d.macdHist !== null && d.macdHist !== undefined) {
        const x = ChartScale.indexToX(i, stepX, marginLeft);
        const y = macdScale.priceToY(d.macdHist);
        const h = Math.abs(y - zeroY);
        const topY = d.macdHist >= 0 ? y : zeroY;

        ctx.fillStyle = d.macdHist >= 0 ? 'rgba(16, 185, 129, 0.55)' : 'rgba(239, 68, 68, 0.55)';
        ctx.fillRect(x - barWidth / 2, topY, barWidth, Math.max(1, h));
      }
    });

    // Render MACD Line (Vivid Blue)
    ctx.strokeStyle = theme.colors.accentPrimary;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    let startedLine = false;
    data.forEach((d, i) => {
      if (d.macdLine !== null && d.macdLine !== undefined) {
        const x = ChartScale.indexToX(i, stepX, marginLeft);
        const y = macdScale.priceToY(d.macdLine);
        if (!startedLine) { ctx.moveTo(x, y); startedLine = true; }
        else { ctx.lineTo(x, y); }
      }
    });
    ctx.stroke();

    // Render Signal Line (Amber Gold)
    ctx.strokeStyle = theme.colors.accentGold;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    let startedSig = false;
    data.forEach((d, i) => {
      if (d.macdSignal !== null && d.macdSignal !== undefined) {
        const x = ChartScale.indexToX(i, stepX, marginLeft);
        const y = macdScale.priceToY(d.macdSignal);
        if (!startedSig) { ctx.moveTo(x, y); startedSig = true; }
        else { ctx.lineTo(x, y); }
      }
    });
    ctx.stroke();

    // Crosshair & Active MACD Badges
    if (hoverIndex !== null && hoverIndex >= 0 && hoverIndex < data.length) {
      const activeItem = data[hoverIndex];
      const x = ChartScale.indexToX(hoverIndex, stepX, marginLeft);

      ctx.strokeStyle = 'rgba(248, 250, 252, 0.65)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);

      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
      ctx.setLineDash([]);

      if (activeItem.macdLine !== null && activeItem.macdLine !== undefined) {
        const y = macdScale.priceToY(activeItem.macdLine);

        // Pulse dot
        ctx.fillStyle = theme.colors.accentPrimary;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();

        // Badge on Y axis
        ctx.fillStyle = theme.colors.accentPrimary;
        ctx.fillRect(marginLeft + chartWidth, y - 8, marginRight - 5, 16);
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold 10px ${theme.fonts.mono}`;
        ctx.fillText(activeItem.macdLine.toFixed(2), marginLeft + chartWidth + 5, y + 4);
      }
    }
  }, [data, height, hoverIndex, containerWidth]);

  const handleMouseMove = (e) => {
    if (!containerRef.current || !data.length) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - 10;
    const chartWidth = rect.width - 80;
    const stepX = chartWidth / data.length;
    const idx = ChartScale.xToIndex(x, stepX, 0, data.length);
    if (onHoverIndex) onHoverIndex(idx);
  };

  const handleMouseLeave = () => {
    if (onHoverIndex) onHoverIndex(null);
  };

  const activeMacd = hoverIndex !== null && data[hoverIndex] ? data[hoverIndex] : null;

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
        gap: '12px'
      }}>
        <span>MACD (12, 26, 9)</span>
        {activeMacd && activeMacd.macdLine !== undefined && (
          <>
            <span style={{ color: theme.colors.accentPrimary }}>MACD: {activeMacd.macdLine?.toFixed(2)}</span>
            <span style={{ color: theme.colors.accentGold }}>Signal: {activeMacd.macdSignal?.toFixed(2)}</span>
            <span style={{ color: (activeMacd.macdHist || 0) >= 0 ? theme.colors.gain : theme.colors.loss }}>
              Hist: {activeMacd.macdHist?.toFixed(2)}
            </span>
          </>
        )}
      </div>

      <canvas ref={canvasRef} />
    </div>
  );
}
