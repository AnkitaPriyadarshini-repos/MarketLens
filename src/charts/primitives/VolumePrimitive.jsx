import React, { useRef, useEffect } from 'react';
import { theme } from '../../theme/designTokens';
import { ChartScale } from '../core/ChartScales';

export function VolumePrimitive({
  data = [],
  height = 80,
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

    const marginTop = 5;
    const marginBottom = 15;
    const marginRight = 65;
    const marginLeft = 10;

    const chartWidth = width - marginLeft - marginRight;
    const chartHeight = height - marginTop - marginBottom;

    let maxVolume = 0;
    data.forEach(d => { if (d.volume > maxVolume) maxVolume = d.volume; });
    if (maxVolume === 0) maxVolume = 1;

    const stepX = chartWidth / data.length;
    const barWidth = Math.max(2, stepX * 0.7);

    // Draw Volume Bars
    data.forEach((d, i) => {
      const x = marginLeft + i * stepX + stepX / 2;
      const isBull = d.close >= d.open;
      const barH = (d.volume / maxVolume) * chartHeight;
      const y = marginTop + chartHeight - barH;

      ctx.fillStyle = isBull ? 'rgba(16, 185, 129, 0.45)' : 'rgba(239, 68, 68, 0.45)';
      ctx.fillRect(x - barWidth / 2, y, barWidth, barH);
    });

    // Synchronized Crosshair Line
    if (hoverIndex !== null && hoverIndex >= 0 && hoverIndex < data.length) {
      const x = marginLeft + hoverIndex * stepX + stepX / 2;

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
    const idx = Math.min(data.length - 1, Math.max(0, Math.floor(x / stepX)));
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
