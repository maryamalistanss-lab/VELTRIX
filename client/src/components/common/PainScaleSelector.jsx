/**
 * PainScaleSelector Component
 * Standard 0 to 10 Visual Analog Scale (VAS) for rehabilitation pain tracking
 * compliant with VELTRIX API and Database Contracts.
 */
export default function PainScaleSelector({
  value = 0,
  onChange,
  disabled = false,
}) {
  const levels = [
    { score: 0, label: 'No Pain', emoji: '😄', color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)' },
    { score: 1, label: 'Very Mild', emoji: '🙂', color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)' },
    { score: 2, label: 'Mild', emoji: '🙂', color: '#84CC16', bg: 'rgba(132, 204, 22, 0.15)' },
    { score: 3, label: 'Tolerable', emoji: '🙂', color: '#84CC16', bg: 'rgba(132, 204, 22, 0.15)' },
    { score: 4, label: 'Moderate', emoji: '😐', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)' },
    { score: 5, label: 'Moderate', emoji: '😐', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)' },
    { score: 6, label: 'Uncomfortable', emoji: '🙁', color: '#F97316', bg: 'rgba(249, 115, 22, 0.15)' },
    { score: 7, label: 'Severe', emoji: '🙁', color: '#F97316', bg: 'rgba(249, 115, 22, 0.15)' },
    { score: 8, label: 'Very Severe', emoji: '😣', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)' },
    { score: 9, label: 'Extreme', emoji: '😣', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)' },
    { score: 10, label: 'Unbearable', emoji: '😫', color: '#DC2626', bg: 'rgba(220, 38, 38, 0.18)' },
  ];

  const currentLevel = levels.find((l) => l.score === Number(value)) || levels[0];

  return (
    <div className="pain-scale-container" role="radiogroup" aria-label="Pain rating scale (0-10)">
      <div className="pain-scale-buttons-row">
        {levels.map((lvl) => {
          const isSelected = Number(value) === lvl.score;
          return (
            <button
              type="button"
              key={lvl.score}
              role="radio"
              aria-checked={isSelected}
              disabled={disabled}
              onClick={() => onChange && onChange(lvl.score)}
              className={`pain-scale-item ${isSelected ? 'pain-scale-item-selected' : ''}`}
              style={{
                borderColor: isSelected ? lvl.color : 'transparent',
                backgroundColor: isSelected ? lvl.bg : 'var(--color-surface-elevated)',
              }}
            >
              <span className="pain-emoji" role="img" aria-label={lvl.label}>
                {lvl.emoji}
              </span>
              <span
                className="pain-number-badge"
                style={{
                  backgroundColor: isSelected ? lvl.color : 'var(--border-color)',
                  color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                }}
              >
                {lvl.score}
              </span>
            </button>
          );
        })}
      </div>
      <div className="pain-scale-current-label">
        Selected Pain Level:{' '}
        <strong style={{ color: currentLevel.color }}>
          {currentLevel.label} ({currentLevel.score}/10)
        </strong>
      </div>
    </div>
  );
}
