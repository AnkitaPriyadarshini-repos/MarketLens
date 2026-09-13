import React, { useRef, useEffect } from 'react';
import { theme } from '../../theme/designTokens';
import { ChartScale } from '../core/ChartScales';

export function RsiPrimitive({
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
    if (width <= 0 || height <= 0) return;

    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const marginTop = 10;
    const marginBottom = 15;
    const marginRight = 65;
    const marginLeft = 10;

    const chartWidth = width - marginLeft - marginRight;
    const chartHeight = height - marginTop - marginBottom;

    const rsiScale = new ChartScale(0, 100, marginTop + chartHeight, marginTop);
    const stepX = chartWidth / data.length;

    ctx.strokeStyle = theme.colors.borderLight;
    ctx.lineWidth = 0.8;
    ctx.setLineDash([3, 3]);

    [70, 50, 30].forEach(level => {
      const y = rsiScale.priceToY(level);
      ctx.beginPath();
      ctx.moveTo(marginLeft, y);
      ctx.lineTo(marginLeft + chartWidth, y);
      ctx.stroke();

      ctx.fillStyle = theme.colors.textMuted;
      ctx.font = `10px ${theme.fonts.mono}`;
      ctx.fillText(`${level}`, marginLeft + chartWidth + 6, y + 3);
    });

    ctx.setLineDash([]);

    ctx.strokeStyle = theme.colors.accentGold;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    let started = false;

    data.forEach((d, i) => {
      if (d.rsi !== null && d.rsi !== undefined) {
        const x = ChartScale.indexToX(i, stepX, marginLeft);
        const y = rsiScale.priceToY(d.rsi);
        if (!started) { ctx.moveTo(x, y); started = true; }
        else { ctx.lineTo(x, y); }
      }
    });
    ctx.stroke();

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
