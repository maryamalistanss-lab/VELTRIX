/**
 * BrandMark Component
 * Reusable official VELTRIX brand mark:
 * - V-shaped geometric constellation mark (Violet to Cyan gradient)
 * - Central circular focal point
 * - Left/Right ECG / pulse wave line
 * - Fluid flowing lines
 */

export default function BrandMark({
  size = 40,
  className = '',
  showPulse = true,
  glow = true,
}) {
  const width = size * (showPulse ? 2.4 : 1);
  const height = size;

  return (
    <svg
      viewBox={showPulse ? "0 0 240 100" : "60 0 120 100"}
      width={width}
      height={height}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`veltrix-brand-mark ${className}`}
      aria-label="VELTRIX Brand Mark"
      role="img"
    >
      <defs>
        {/* Left Wing Gradient (Violet / Indigo) */}
        <linearGradient id="vMarkLeftGrad" x1="60" y1="20" x2="120" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="50%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>

        {/* Right Wing Gradient (Cyan / Mint) */}
        <linearGradient id="vMarkRightGrad" x1="120" y1="90" x2="180" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="50%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>

        {/* Central Head Dot Gradient */}
        <linearGradient id="vMarkDotGrad" x1="110" y1="30" x2="130" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>

        {/* Pulse Left Gradient */}
        <linearGradient id="pulseLeftGrad" x1="10" y1="50" x2="100" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.1" />
          <stop offset="60%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>

        {/* Pulse Right Gradient */}
        <linearGradient id="pulseRightGrad" x1="140" y1="50" x2="230" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#06B6D4" />
          <stop offset="40%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#10B981" stopOpacity="0.1" />
        </linearGradient>

        {/* Subtle Glow Filter */}
        {glow && (
          <filter id="markGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        )}
      </defs>

      {/* Pulse / ECG Line & Flowing filaments (Left Side) */}
      {showPulse && (
        <g className="brand-pulse-left" opacity="0.95">
          {/* Subtle flowing wave ribbons */}
          <path
            d="M 5 58 C 30 52, 50 68, 75 52 C 85 45, 95 50, 105 50"
            stroke="url(#pulseLeftGrad)"
            strokeWidth="1.2"
            strokeOpacity="0.4"
            fill="none"
          />
          <path
            d="M 10 50 C 35 62, 55 38, 78 50 C 88 56, 98 51, 105 50"
            stroke="url(#pulseLeftGrad)"
            strokeWidth="1.2"
            strokeOpacity="0.3"
            fill="none"
          />
          {/* Main ECG pulse waveform */}
          <path
            d="M 15 50 L 55 50 L 62 30 L 70 70 L 78 40 L 85 58 L 92 50 L 105 50"
            stroke="url(#pulseLeftGrad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </g>
      )}

      {/* Pulse / ECG Line & Flowing filaments (Right Side) */}
      {showPulse && (
        <g className="brand-pulse-right" opacity="0.95">
          {/* Subtle flowing wave ribbons */}
          <path
            d="M 135 50 C 145 50, 155 45, 165 52 C 190 68, 210 52, 235 58"
            stroke="url(#pulseRightGrad)"
            strokeWidth="1.2"
            strokeOpacity="0.4"
            fill="none"
          />
          <path
            d="M 135 50 C 142 51, 152 56, 162 50 C 185 38, 205 62, 230 50"
            stroke="url(#pulseRightGrad)"
            strokeWidth="1.2"
            strokeOpacity="0.3"
            fill="none"
          />
          {/* Main ECG pulse waveform */}
          <path
            d="M 135 50 L 148 50 L 155 58 L 162 40 L 170 70 L 178 30 L 185 50 L 225 50"
            stroke="url(#pulseRightGrad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </g>
      )}

      {/* Main Stylized V Symbol */}
      <g filter={glow ? "url(#markGlow)" : undefined}>
        {/* Left Wing of V */}
        <path
          d="M 72 16 C 90 28, 105 52, 116 78 C 118 82, 120 85, 120 85 C 120 85, 110 65, 100 45 C 92 30, 80 20, 72 16 Z"
          fill="url(#vMarkLeftGrad)"
        />
        {/* Right Wing of V */}
        <path
          d="M 168 16 C 150 28, 135 52, 124 78 C 122 82, 120 85, 120 85 C 120 85, 130 65, 140 45 C 148 30, 160 20, 168 16 Z"
          fill="url(#vMarkRightGrad)"
        />
        {/* Base Curvature join */}
        <path
          d="M 112 75 C 116 84, 120 88, 120 88 C 120 88, 124 84, 128 75 C 123 78, 117 78, 112 75 Z"
          fill="#3B82F6"
        />
        {/* Constellation Network Geometry inside V */}
        <g stroke="#ffffff" strokeWidth="0.75" strokeOpacity="0.7" fill="none">
          {/* Left Wing Facet Lines */}
          <line x1="75" y1="20" x2="88" y2="35" />
          <line x1="88" y1="35" x2="98" y2="28" />
          <line x1="88" y1="35" x2="102" y2="48" />
          <line x1="102" y1="48" x2="114" y2="42" />
          <line x1="102" y1="48" x2="113" y2="65" />
          <line x1="113" y1="65" x2="120" y2="82" />

          {/* Right Wing Facet Lines */}
          <line x1="165" y1="20" x2="152" y2="35" />
          <line x1="152" y1="35" x2="142" y2="28" />
          <line x1="152" y1="35" x2="138" y2="48" />
          <line x1="138" y1="48" x2="126" y2="42" />
          <line x1="138" y1="48" x2="127" y2="65" />
          <line x1="127" y1="65" x2="120" y2="82" />
        </g>

        {/* Constellation Glowing Nodes / Points */}
        <g fill="#ffffff">
          <circle cx="75" cy="20" r="1.5" />
          <circle cx="88" cy="35" r="1.8" />
          <circle cx="98" cy="28" r="1.5" />
          <circle cx="102" cy="48" r="2.0" />
          <circle cx="114" cy="42" r="1.6" />
          <circle cx="113" cy="65" r="2.0" />

          <circle cx="165" cy="20" r="1.5" />
          <circle cx="152" cy="35" r="1.8" />
          <circle cx="142" cy="28" r="1.5" />
          <circle cx="138" cy="48" r="2.0" />
          <circle cx="126" cy="42" r="1.6" />
          <circle cx="127" cy="65" r="2.0" />

          <circle cx="120" cy="83" r="2.2" />
        </g>

        {/* Central Circular Head Node */}
        <circle cx="120" cy="36" r="8" fill="url(#vMarkDotGrad)" />
        <circle cx="120" cy="36" r="5" fill="#ffffff" fillOpacity="0.25" />
      </g>
    </svg>
  );
}
