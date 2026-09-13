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
    if (width <= 0 || height <= 0) return;

    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
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

    data.forEach((d, i) => {
      const x = ChartScale.indexToX(i, stepX, marginLeft);
      const isBull = d.close >= d.open;
      const barH = (d.volume / maxVolume) * chartHeight;
      const y = marginTop + chartHeight - barH;

      ctx.fillStyle = isBull ? 'rgba(16, 185, 129, 0.45)' : 'rgba(239, 68, 68, 0.45)';
      ctx.fillRect(x - barWidth / 2, y, barWidth, barH);
    });

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
