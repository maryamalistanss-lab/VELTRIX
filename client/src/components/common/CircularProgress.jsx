/**
 * CircularProgress Component
 * SVG-based circular progress indicator matching VELTRIX design reference.
 * Supports mint/teal/indigo gradient and smooth transitions.
 */
export default function CircularProgress({
  value = 75,
  size = 64,
  strokeWidth = 6,
  color = '#10B981', // or #4F46E5
  trackColor = 'rgba(226, 232, 240, 0.4)',
  label,
  sublabel,
  showPercentage = true,
  className = '',
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;

  return (
    <div
      className={`circular-progress-wrap ${className}`}
      style={{ width: size, height: size, position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Animated fill stroke */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}
        />
      </svg>

      {/* Center Label */}
      <div
        className="circular-progress-inner"
        style={{
          position: 'absolute',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          pointerEvents: 'none',
        }}
      >
        {label !== undefined ? (
          <span style={{ fontSize: size * 0.26, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
            {label}
          </span>
        ) : showPercentage ? (
          <span style={{ fontSize: size * 0.24, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
            {value}%
          </span>
        ) : null}
        {sublabel && (
          <span style={{ fontSize: size * 0.14, color: 'var(--text-secondary)', marginTop: 2 }}>
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}
