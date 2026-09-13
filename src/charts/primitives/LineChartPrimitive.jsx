import React, { useRef, useEffect, useState } from 'react';
import { theme } from '../../theme/designTokens';
import { formatCurrency } from '../../utils/formatters';

export function LineChartPrimitive({
  data = [],
  height = 350,
  showArea = true,
  color = '#ff7e5f',
  onHoverPoint = null,
  interactive = true
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [hoverIndex, setHoverIndex] = useState(data.length > 2 ? Math.floor(data.length / 3) : 0);
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

    const marginTop = 30;
    const marginBottom = 30;
    const marginLeft = 20;
    const marginRight = 20;

    const chartWidth = width - marginLeft - marginRight;
    const chartHeight = height - marginTop - marginBottom;

    const prices = data.map(d => Number(d.price || d.close || d.value) || 0);
    let minP = Math.min(...prices);
    let maxP = Math.max(...prices);
    if (minP === maxP) { minP = 0; maxP += 10; }
    const pRange = (maxP - minP) || 1;

    const stepX = chartWidth / (data.length - 1 || 1);
    const points = data.map((d, i) => {
      const p = Number(d.price || d.close || d.value) || 0;
      const x = marginLeft + i * stepX;
      const y = marginTop + chartHeight - ((p - minP) / pRange) * chartHeight;
      return { x, y, p, raw: d };
    });

    // Smooth Bezier Path Rendering
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX = (p0.x + p1.x) / 2;
      ctx.bezierCurveTo(cpX, p0.y, cpX, p1.y, p1.x, p1.y);
    }

    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Gradient Area Fill
    if (showArea) {
      const fillPath = new Path2D();
      fillPath.moveTo(points[0].x, marginTop + chartHeight);
      fillPath.lineTo(points[0].x, points[0].y);

      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i];
        const p1 = points[i + 1];
        const cpX = (p0.x + p1.x) / 2;
        fillPath.bezierCurveTo(cpX, p0.y, cpX, p1.y, p1.x, p1.y);
      }

      fillPath.lineTo(points[points.length - 1].x, marginTop + chartHeight);
      fillPath.closePath();

      const grad = ctx.createLinearGradient(0, marginTop, 0, marginTop + chartHeight);
      grad.addColorStop(0, `${color}44`);
      grad.addColorStop(1, `${color}00`);
      ctx.fillStyle = grad;
      ctx.fill(fillPath);
    }

    // Active Point Target Ripple Ring (Matching Divyanshu Shekhar's screenshot input_file_2.png)
    if (hoverIndex !== null && points[hoverIndex]) {
      const activePt = points[hoverIndex];

      // Concentric Rings
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(activePt.x, activePt.y, 16, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(activePt.x, activePt.y, 10, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(activePt.x, activePt.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [data, height, showArea, color, hoverIndex, containerWidth]);

  const handleMouseMove = (e) => {
    if (!containerRef.current || !data.length || !interactive) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - 20;
    const chartWidth = rect.width - 40;
    const stepX = chartWidth / (data.length - 1 || 1);
    const idx = Math.max(0, Math.min(data.length - 1, Math.round(x / stepX)));
    setHoverIndex(idx);
    if (onHoverPoint && data[idx]) onHoverPoint(data[idx]);
  };

  const activePoint = hoverIndex !== null && data[hoverIndex] ? data[hoverIndex] : null;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      style={{
        width: '100%',
        height,
        position: 'relative',
        cursor: 'crosshair',
        background: '#0d0d11',
        borderRadius: theme.radius.md,
        padding: '10px',
        border: `1px solid ${theme.colors.border}`,
        userSelect: 'none'
      }}
    >
      {activePoint && (
        <div style={{
          position: 'absolute',
          top: 10,
          left: 15,
          zIndex: 10,
          background: '#0f172a',
          padding: '4px 12px',
          borderRadius: theme.radius.sm,
          border: `1px solid ${color}`,
          color: '#ffffff',
          fontFamily: theme.fonts.mono,
          fontSize: '12px',
          fontWeight: 700
        }}>
          {activePoint.date || 'Point'} : {formatCurrency(activePoint.price || activePoint.close || activePoint.value || 0)}
        </div>
      )}

      <canvas ref={canvasRef} />
    </div>
  );
}

