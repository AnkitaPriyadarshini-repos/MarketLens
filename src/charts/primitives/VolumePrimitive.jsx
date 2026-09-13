import React, { useRef, useEffect, useState } from 'react';
import { theme } from '../../theme/designTokens';
import { ChartScale } from '../core/ChartScales';

export function VolumePrimitive({
  data = [],
  height = 90,
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

    let maxVolume = 0;
    data.forEach(d => { if (d.volume > maxVolume) maxVolume = d.volume; });
    if (maxVolume === 0) maxVolume = 1;

    const stepX = chartWidth / data.length;
    const barWidth = Math.max(2, stepX * 0.75);

    // Subtle horizontal grid line at max and 50% max volume
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.3)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(marginLeft, marginTop + chartHeight / 2);
    ctx.lineTo(marginLeft + chartWidth, marginTop + chartHeight / 2);
    ctx.stroke();

    // Volume Axis Label
    ctx.fillStyle = theme.colors.textMuted;
    ctx.font = `10px ${theme.fonts.mono}`;
    ctx.textAlign = 'left';
    ctx.fillText(`${(maxVolume / 1000000).toFixed(1)}M`, marginLeft + chartWidth + 6, marginTop + 10);
    ctx.fillText(`${(maxVolume / 2000000).toFixed(1)}M`, marginLeft + chartWidth + 6, marginTop + chartHeight / 2 + 3);

    // Render Volume Bars
    data.forEach((d, i) => {
      const x = ChartScale.indexToX(i, stepX, marginLeft);
      const isBull = d.close >= d.open;
      const barH = Math.max(1, (d.volume / maxVolume) * chartHeight);
      const y = marginTop + chartHeight - barH;

      ctx.fillStyle = isBull ? 'rgba(16, 185, 129, 0.55)' : 'rgba(239, 68, 68, 0.55)';
      ctx.fillRect(x - barWidth / 2, y, barWidth, barH);
    });

    // Crosshair & Active Volume Badge
    if (hoverIndex !== null && hoverIndex >= 0 && hoverIndex < data.length) {
      const x = ChartScale.indexToX(hoverIndex, stepX, marginLeft);
      const item = data[hoverIndex];
      const barH = (item.volume / maxVolume) * chartHeight;
      const y = marginTop + chartHeight - barH;

      ctx.strokeStyle = 'rgba(248, 250, 252, 0.6)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);

      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Badge on Y Axis
      ctx.fillStyle = theme.colors.bgCardElevated;
      ctx.fillRect(marginLeft + chartWidth, y - 8, marginRight - 5, 16);
      ctx.strokeStyle = theme.colors.borderLight;
      ctx.strokeRect(marginLeft + chartWidth, y - 8, marginRight - 5, 16);
      ctx.fillStyle = theme.colors.textPrimary;
      ctx.font = `bold 10px ${theme.fonts.mono}`;
      ctx.fillText(`${(item.volume / 1000000).toFixed(2)}M`, marginLeft + chartWidth + 4, y + 4);
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

  const activeVol = hoverIndex !== null && data[hoverIndex] ? data[hoverIndex].volume : null;

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
        <span>VOLUME</span>
        {activeVol !== null && (
          <span style={{ color: theme.colors.textPrimary, fontWeight: 700 }}>
            {activeVol.toLocaleString()}
          </span>
        )}
      </div>

      <canvas ref={canvasRef} />
    </div>
  );
}
