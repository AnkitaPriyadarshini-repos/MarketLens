import React, { useRef, useEffect, useState } from 'react';
import { theme } from '../../theme/designTokens';
import { generateNiceTicks } from '../core/AxisEngine';

export function BarChartPrimitive({
  data = [],
  height = 300,
  horizontal = false,
  dataKey = 'value',
  nameKey = 'name',
  colorKey = null,
  color = '#9672f8',
  activeColor = '#ff7e5f',
  valueFormatter = (val) => val
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [hoverIndex, setHoverIndex] = useState(data.length > 3 ? 3 : 0);
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
    const width = rect.width || containerWidth || 400;
    if (width <= 0 || height <= 0) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const marginTop = 35;
    const marginBottom = 30;
    const marginLeft = horizontal ? 60 : 45;
    const marginRight = 15;

    const chartWidth = width - marginLeft - marginRight;
    const chartHeight = height - marginTop - marginBottom;

    const values = data.map(d => Number(d[dataKey]) || 0);
    const maxVal = Math.max(...values, 10);
    const minVal = 0;

    if (!horizontal) {
      // VERTICAL BAR CHART MODE
      const ticks = generateNiceTicks(minVal, maxVal, 4);

      // Y-Axis Gridlines & Left Labels
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.25)';
      ctx.lineWidth = 0.5;
      ctx.fillStyle = theme.colors.textMuted;
      ctx.font = `11px ${theme.fonts.mono}`;
      ctx.textAlign = 'right';

      ticks.forEach(tVal => {
        const y = marginTop + chartHeight - ((tVal - minVal) / (maxVal - minVal)) * chartHeight;
        if (y >= marginTop - 5 && y <= marginTop + chartHeight + 5) {
          ctx.beginPath();
          ctx.moveTo(marginLeft, y);
          ctx.lineTo(marginLeft + chartWidth, y);
          ctx.stroke();

          ctx.fillText(String(Math.round(tVal)), marginLeft - 8, y + 4);
        }
      });

      // X-Axis Baseline & Labels
      const stepX = chartWidth / data.length;
      const barWidth = Math.max(8, Math.min(36, stepX * 0.55));

      ctx.textAlign = 'center';
      data.forEach((d, i) => {
        const x = marginLeft + i * stepX + stepX / 2;
        ctx.fillStyle = theme.colors.textSecondary;
        ctx.fillText(String(d[nameKey]), x, height - 8);
      });

      // Draw Bars
      data.forEach((d, i) => {
        const val = Number(d[dataKey]) || 0;
        const x = marginLeft + i * stepX + (stepX - barWidth) / 2;
        const barH = (val / maxVal) * chartHeight;
        const y = marginTop + chartHeight - barH;

        const isHovered = hoverIndex === i;
        const barColor = isHovered ? activeColor : (d.color || color);

        // Rounded Bar Top
        ctx.fillStyle = barColor;
        ctx.beginPath();
        const r = Math.min(6, barWidth / 2);
        ctx.moveTo(x, y + r);
        ctx.arcTo(x, y, x + r, y, r);
        ctx.arcTo(x + barWidth, y, x + barWidth, y + r, r);
        ctx.lineTo(x + barWidth, marginTop + chartHeight);
        ctx.lineTo(x, marginTop + chartHeight);
        ctx.closePath();
        ctx.fill();

        // Active Bar Floating Value Pill Badge (Matching Divyanshu Shekhar's cute-charts)
        if (isHovered) {
          const pillText = String(valueFormatter(val));
          ctx.font = `bold 11px ${theme.fonts.mono}`;
          const textMetrics = ctx.measureText(pillText);
          const pillW = textMetrics.width + 16;
          const pillH = 22;
          const pillX = x + barWidth / 2 - pillW / 2;
          const pillY = Math.max(6, y - pillH - 6);

          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.rect(pillX, pillY, pillW, pillH);
          ctx.fill();

          ctx.strokeStyle = activeColor;
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.fillText(pillText, x + barWidth / 2, pillY + 15);
        }
      });
    } else {
      // HORIZONTAL BAR CHART MODE
      const stepY = chartHeight / data.length;
      const barH = Math.max(8, Math.min(28, stepY * 0.55));

      ctx.fillStyle = theme.colors.textSecondary;
      ctx.font = `11px ${theme.fonts.main}`;
      ctx.textAlign = 'right';

      data.forEach((d, i) => {
        const val = Number(d[dataKey]) || 0;
        const y = marginTop + i * stepY + (stepY - barH) / 2;
        const barW = (val / maxVal) * chartWidth;
        const isHovered = hoverIndex === i;
        const barColor = isHovered ? activeColor : (d.color || color);

        ctx.fillText(String(d[nameKey]), marginLeft - 8, y + barH / 2 + 4);

        // Rounded Bar Right
        ctx.fillStyle = barColor;
        ctx.beginPath();
        const r = Math.min(6, barH / 2);
        ctx.moveTo(marginLeft, y);
        ctx.lineTo(marginLeft + barW - r, y);
        ctx.arcTo(marginLeft + barW, y, marginLeft + barW, y + r, r);
        ctx.arcTo(marginLeft + barW, y + barH, marginLeft + barW - r, y + barH, r);
        ctx.lineTo(marginLeft, y + barH);
        ctx.closePath();
        ctx.fill();

        if (isHovered) {
          const pillText = String(valueFormatter(val));
          ctx.font = `bold 11px ${theme.fonts.mono}`;
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'left';
          ctx.fillText(pillText, marginLeft + barW + 8, y + barH / 2 + 4);
        }
      });
    }
  }, [data, height, horizontal, dataKey, nameKey, colorKey, color, activeColor, hoverIndex, containerWidth]);

  const handleMouseMove = (e) => {
    if (!containerRef.current || !data.length) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - 45;
    const chartWidth = rect.width - 60;
    const stepX = chartWidth / data.length;
    const idx = Math.max(0, Math.min(data.length - 1, Math.floor(x / stepX)));
    setHoverIndex(idx);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      style={{
        width: '100%',
        height,
        position: 'relative',
        cursor: 'pointer',
        background: '#0d0e15',
        borderRadius: theme.radius.md,
        padding: '10px',
        border: `1px solid ${theme.colors.border}`
      }}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}

