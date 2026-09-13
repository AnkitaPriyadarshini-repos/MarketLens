import React, { useRef, useEffect } from 'react';
import { theme } from '../../theme/designTokens';
import { ChartScale } from '../core/ChartScales';

export function MacdPrimitive({
  data = [],
  height = 90,
  hoverIndex = null,
  onHoverIndex = null
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

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

    const marginTop = 10;
    const marginBottom = 15;
    const marginRight = 65;
    const marginLeft = 10;

    const chartWidth = width - marginLeft - marginRight;
    const chartHeight = height - marginTop - marginBottom;

    let minMacd = Infinity;
    let maxMacd = -Infinity;

    data.forEach(d => {
      if (d.macdHist !== undefined && d.macdHist !== null) {
        if (d.macdHist < minMacd) minMacd = d.macdHist;
        if (d.macdHist > maxMacd) maxMacd = d.macdHist;
      }
    });

    const macdRange = (maxMacd - minMacd) || 1;
    const macdScale = new ChartScale(minMacd, maxMacd, marginTop + chartHeight, marginTop);
    const zeroY = macdScale.priceToY(0);

    const stepX = chartWidth / data.length;
    const barWidth = Math.max(2, stepX * 0.7);

    // Zero Line
    ctx.strokeStyle = theme.colors.borderLight;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(marginLeft, zeroY);
    ctx.lineTo(marginLeft + chartWidth, zeroY);
    ctx.stroke();

    // Draw MACD Histogram Bars
    data.forEach((d, i) => {
      if (d.macdHist !== undefined && d.macdHist !== null) {
        const x = ChartScale.indexToX(i, stepX, marginLeft);
        const y = macdScale.priceToY(d.macdHist);
        const isPos = d.macdHist >= 0;
        const barH = Math.max(1, Math.abs(y - zeroY));
        const barY = isPos ? y : zeroY;

        ctx.fillStyle = isPos ? theme.colors.gain : theme.colors.loss;
        ctx.fillRect(x - barWidth / 2, barY, barWidth, barH);
      }
    });

    // Synchronized Crosshair Line
    if (hoverIndex !== null && hoverIndex >= 0 && hoverIndex < data.length) {
      const x = ChartScale.indexToX(hoverIndex, stepX, marginLeft);

      ctx.strokeStyle = 'rgba(248, 250, 252, 0.5)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);

      ctx.beginPath();
      ctx.moveTo(x, marginTop);
      ctx.lineTo(x, marginTop + chartHeight);
      ctx.stroke();

      ctx.setLineDash([]);
    }
  }, [data, height, hoverIndex]);

  const handleMouseMove = (e) => {
    if (!containerRef.current || !data.length) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - 10;
    const chartWidth = rect.width - 75;
    const stepX = chartWidth / data.length;
    const idx = ChartScale.xToIndex(x, stepX, 10, data.length);
    if (onHoverIndex) onHoverIndex(idx);
  };

  const handleMouseLeave = () => {
    if (onHoverIndex) onHoverIndex(null);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ width: '100%', height, position: 'relative', cursor: 'crosshair', userSelect: 'none' }}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
