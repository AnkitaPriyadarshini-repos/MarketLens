import React, { useRef, useEffect, useState } from 'react';
import { theme } from '../../theme/designTokens';
import { formatCurrency } from '../../utils/formatters';

export function PieDonutPrimitive({
  data = [],
  height = 300,
  isDonut = true,
  dataKey = 'value',
  nameKey = 'name',
  centerTitle = 'Total Value',
  centerValue = null,
  valueFormatter = (val) => formatCurrency(val)
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [hoverIndex, setHoverIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  const defaultColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#8b5cf6',
    '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#64748b'
  ];

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
    const width = rect.width || containerWidth || 350;
    if (width <= 0 || height <= 0) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;
    const outerR = Math.min(width, height) * 0.38;
    const innerR = isDonut ? outerR * 0.70 : 0;

    const total = data.reduce((acc, d) => acc + (Number(d[dataKey]) || 0), 0) || 1;

    let startAngle = -Math.PI / 2;

    data.forEach((d, i) => {
      const val = Number(d[dataKey]) || 0;
      const sliceAngle = (val / total) * Math.PI * 2;
      const endAngle = startAngle + sliceAngle;
      const midAngle = startAngle + sliceAngle / 2;

      const isHovered = hoverIndex === i;
      const offset = isHovered ? 8 : 0;

      const offsetX = Math.cos(midAngle) * offset;
      const offsetY = Math.sin(midAngle) * offset;

      const sliceColor = d.color || defaultColors[i % defaultColors.length];

      ctx.save();
      ctx.translate(offsetX, offsetY);

      ctx.beginPath();
      ctx.arc(centerX, centerY, outerR, startAngle, endAngle);
      if (isDonut) {
        ctx.arc(centerX, centerY, innerR, endAngle, startAngle, true);
      } else {
        ctx.lineTo(centerX, centerY);
      }
      ctx.closePath();

      ctx.fillStyle = sliceColor;
      ctx.fill();

      ctx.restore();

      // Floating Label Pill Badge for Hovered Slice (Matching Divyanshu Shekhar's input_file_3.png)
      if (isHovered) {
        const pct = ((val / total) * 100).toFixed(1);
        const name = String(d[nameKey] || 'Slice');
        const pillText = `${name}  ${val} (${pct}%)`;

        const badgeX = centerX + Math.cos(midAngle) * (outerR + 25);
        const badgeY = centerY + Math.sin(midAngle) * (outerR + 25);

        ctx.font = `bold 11px ${theme.fonts.mono}`;
        const metrics = ctx.measureText(pillText);
        const pw = metrics.width + 16;
        const ph = 26;
        const px = badgeX - pw / 2;
        const py = badgeY - ph / 2;

        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.rect(px, py, pw, ph);
        ctx.fill();

        ctx.strokeStyle = sliceColor;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(pillText, badgeX, py + 17);
      }

      startAngle = endAngle;
    });
  }, [data, height, isDonut, dataKey, nameKey, hoverIndex, containerWidth]);

  const handleMouseMove = (e) => {
    if (!containerRef.current || !data.length) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    let angle = Math.atan2(y, x) + Math.PI / 2;
    if (angle < 0) angle += Math.PI * 2;

    const total = data.reduce((acc, d) => acc + (Number(d[dataKey]) || 0), 0) || 1;
    let accAngle = 0;
    for (let i = 0; i < data.length; i++) {
      const sliceAngle = ((Number(data[i][dataKey]) || 0) / total) * Math.PI * 2;
      if (angle >= accAngle && angle <= accAngle + sliceAngle) {
        setHoverIndex(i);
        break;
      }
      accAngle += sliceAngle;
    }
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
        background: '#0d0d11',
        borderRadius: theme.radius.md,
        padding: '10px',
        border: `1px solid ${theme.colors.border}`,
        userSelect: 'none'
      }}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}

