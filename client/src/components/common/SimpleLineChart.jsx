import { useId } from 'react';

/**
 * SimpleLineChart Component
 * Sleek SVG line and area chart matching the exact aesthetic in Image 1 & 2:
 * - Smooth purple/indigo line with circular data points
 * - Subtle gradient area fill beneath the curve
 * - Clean axis labels
 */
export default function SimpleLineChart({
  data = [],
  xKey = 'day',
  yKey = 'pain',
  height = 160,
  strokeColor = '#6366F1',
  fillGradient = true,
  yMin = 0,
  yMax = 5,
  showDots = true,
  className = '',
}) {
  const chartId = useId();
  const gradId = `chartGrad_${chartId.replace(/[:]/g, '_')}`;

  if (!data || data.length === 0) return null;

  const width = 420;
  const paddingLeft = 32;
  const paddingRight = 24;
  const paddingTop = 20;
  const paddingBottom = 28;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const points = data.map((d, i) => {
    const x = paddingLeft + (i / (data.length - 1)) * chartWidth;
    const val = Number(d[yKey]) || 0;
    const normalizedY = (val - yMin) / (yMax - yMin || 1);
    const y = height - paddingBottom - normalizedY * chartHeight;
    return { x, y, val, label: d[xKey] };
  });

  // Build SVG path
  const pathD = points.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`;

  return (
    <div className={`simple-chart-container ${className}`} style={{ width: '100%', overflow: 'hidden' }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height: 'auto', display: 'block' }}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.25" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[0, 0.5, 1].map((pct, idx) => {
          const y = paddingTop + pct * chartHeight;
          return (
            <line
              key={idx}
              x1={paddingLeft}
              y1={y}
              x2={width - paddingRight}
              y2={y}
              stroke="var(--border-color)"
              strokeDasharray="3 3"
              strokeWidth="0.8"
            />
          );
        })}

        {/* Gradient fill beneath curve */}
        {fillGradient && <path d={areaD} fill={`url(#${gradId})`} />}

        {/* Main Line */}
        <path
          d={pathD}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {showDots &&
          points.map((pt, i) => (
            <g key={i}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r="4.5"
                fill="var(--color-surface)"
                stroke={strokeColor}
                strokeWidth="2.5"
              />
            </g>
          ))}

        {/* X Axis Labels */}
        {points.map((pt, i) => (
          <text
            key={i}
            x={pt.x}
            y={height - 8}
            textAnchor="middle"
            fill="var(--text-muted)"
            fontSize="10"
            fontFamily="var(--font-family)"
          >
            {pt.label}
          </text>
        ))}
      </svg>
    </div>
  );
}
