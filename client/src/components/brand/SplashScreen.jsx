import { useState, useEffect } from 'react';
import BrandMark from './BrandMark';

/**
 * VELTRIX Splash Screen
 * Implements the 7-step brand emergence sequence:
 * 1. Clean background
 * 2. Small glowing particles/pixels appear
 * 3. Particles converge in a controlled animation
 * 4. Particles form the V-shaped VELTRIX mark
 * 5. Heartbeat/ECG lines & fluid flow become visible
 * 6. VELTRIX wordmark appears
 * 7. "THERAPY • MOVEMENT • TECHNOLOGY" appears beneath
 *
 * Supports prefers-reduced-motion with instant/static fade.
 */
export default function SplashScreen({
  onComplete,
  duration = 2400,
  allowSkip = true,
}) {
  const [reducedMotion] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  const [stage, setStage] = useState(() => (reducedMotion ? 7 : 1));

  useEffect(() => {
    if (reducedMotion) {
      const timer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 1000);
      return () => clearTimeout(timer);
    }

    // Step progression schedule (fast & responsive: total ~2.2s)
    const timers = [
      setTimeout(() => setStage(2), 200),  // Particles appear
      setTimeout(() => setStage(3), 500),  // Convergence starts
      setTimeout(() => setStage(4), 900),  // V-mark forms
      setTimeout(() => setStage(5), 1300), // ECG pulse emerges
      setTimeout(() => setStage(6), 1600), // Wordmark fades in
      setTimeout(() => setStage(7), 1900), // Tagline resolves
      setTimeout(() => {
        if (onComplete) onComplete();
      }, duration),
    ];

    return () => timers.forEach(clearTimeout);
  }, [duration, onComplete, reducedMotion]);

  // Handle manual skip
  const handleSkip = () => {
    if (onComplete) onComplete();
  };

  return (
    <div
      className={`veltrix-splash-overlay ${stage >= 7 ? 'splash-resolved' : ''}`}
      role="dialog"
      aria-label="VELTRIX Introduction"
      aria-modal="true"
    >
      {allowSkip && (
        <button
          type="button"
          onClick={handleSkip}
          className="splash-skip-btn"
          aria-label="Skip introduction"
        >
          Skip &rarr;
        </button>
      )}

      <div className="splash-stage-canvas">
        {/* Step 2 & 3: Floating / Converging Particles */}
        {!reducedMotion && stage >= 2 && stage < 5 && (
          <div className={`splash-particles-field ${stage >= 3 ? 'particles-converging' : 'particles-floating'}`}>
            {Array.from({ length: 24 }).map((_, i) => (
              <span
                key={i}
                className={`splash-dot splash-dot-${i % 3}`}
                style={{
                  '--rand-x': `${(Math.sin(i * 1.3) * 120).toFixed(0)}px`,
                  '--rand-y': `${(Math.cos(i * 1.7) * 90).toFixed(0)}px`,
                  '--dest-x': `${((i % 2 === 0 ? -1 : 1) * (15 + (i * 3.5))).toFixed(0)}px`,
                  '--dest-y': `${(-30 + (i * 4)).toFixed(0)}px`,
                  '--delay': `${(i * 30)}ms`,
                }}
              />
            ))}
          </div>
        )}

        {/* Step 4 & 5: V-Mark & ECG Pulse */}
        <div className={`splash-mark-wrapper stage-${stage} ${reducedMotion ? 'stage-static' : ''}`}>
          <BrandMark
            size={reducedMotion ? 70 : 80}
            showPulse={stage >= 5 || reducedMotion}
            glow={true}
          />
        </div>

        {/* Step 6: VELTRIX Wordmark */}
        <div className={`splash-wordmark ${stage >= 6 || reducedMotion ? 'wordmark-visible' : ''}`}>
          <span className="brand-text-main">VELTR</span>
          <span className="brand-text-i">I</span>
          <span className="brand-text-x">X</span>
        </div>

        {/* Step 7: Tagline */}
        <div className={`splash-tagline ${stage >= 7 || reducedMotion ? 'tagline-visible' : ''}`}>
          <span className="tagline-word">THERAPY</span>
          <span className="tagline-dot">•</span>
          <span className="tagline-word">MOVEMENT</span>
          <span className="tagline-dot">•</span>
          <span className="tagline-word">TECHNOLOGY</span>
        </div>

        {/* Subtle loading pulse bar */}
        <div className="splash-progress-track">
          <div
            className="splash-progress-bar"
            style={{ width: `${Math.min(100, (stage / 7) * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
