import BrandMark from './BrandMark';

/**
 * VeltrixBrand Component
 * Standard centralized branding component for VELTRIX
 * Supports:
 * - variant: "full" | "compact" | "sidebar" | "mark-only" | "official-image"
 * - portalBadge: optional string like "Patient Portal" | "Therapist Portal"
 * - size: "sm" | "md" | "lg" | "xl"
 */
export default function VeltrixBrand({
  variant = 'compact',
  size = 'md',
  portalBadge = '',
  className = '',
  showTagline = true,
  onClick,
}) {
  // Size metrics
  const markSizeMap = {
    sm: 28,
    md: 38,
    lg: 54,
    xl: 72,
  };

  const markSize = markSizeMap[size] || 38;

  const content = (
    <div className={`veltrix-brand-wrapper veltrix-brand-${variant} veltrix-brand-${size} ${className}`}>
      {variant === 'official-image' ? (
        <div className="brand-official-image-container">
          <img
            src="/branding/veltrix-logo-official.jpg"
            alt="VELTRIX — Therapy • Movement • Technology"
            className="brand-official-img"
          />
        </div>
      ) : variant === 'mark-only' ? (
        <BrandMark size={markSize} showPulse={false} />
      ) : variant === 'sidebar' ? (
        <div className="brand-sidebar-lockup">
          <BrandMark size={markSize} showPulse={false} />
          <div className="brand-sidebar-text-col">
            <div className="brand-wordmark-title">
              <span className="brand-text-main">VELTR</span>
              <span className="brand-text-i">I</span>
              <span className="brand-text-x">X</span>
            </div>
            {portalBadge ? (
              <span className="brand-sidebar-portal-tag">{portalBadge}</span>
            ) : (
              <span className="brand-sidebar-mini-tagline">REHAB TECH</span>
            )}
          </div>
        </div>
      ) : variant === 'full' ? (
        <div className="brand-full-lockup">
          {/* Top Mark with pulse ECG */}
          <div className="brand-mark-stage">
            <BrandMark size={markSize} showPulse={true} glow={true} />
          </div>

          {/* Wordmark */}
          <div className="brand-wordmark-large">
            <span className="brand-text-main">VELTR</span>
            <span className="brand-text-i">I</span>
            <span className="brand-text-x">X</span>
          </div>

          {/* Tagline */}
          {showTagline && (
            <div className="brand-tagline-row">
              <span className="tagline-word">THERAPY</span>
              <span className="tagline-dot">•</span>
              <span className="tagline-word">MOVEMENT</span>
              <span className="tagline-dot">•</span>
              <span className="tagline-word">TECHNOLOGY</span>
            </div>
          )}

          {portalBadge && (
            <div className="brand-portal-pill-badge">{portalBadge}</div>
          )}
        </div>
      ) : (
        /* Compact Default */
        <div className="brand-compact-lockup">
          <BrandMark size={markSize} showPulse={false} />
          <div className="brand-compact-text">
            <div className="brand-wordmark-compact">
              <span className="brand-text-main">VELTR</span>
              <span className="brand-text-i">I</span>
              <span className="brand-text-x">X</span>
            </div>
            {portalBadge && (
              <span className="brand-compact-portal">{portalBadge}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="veltrix-brand-root" onClick={onClick}>
      {content}
    </div>
  );
}
