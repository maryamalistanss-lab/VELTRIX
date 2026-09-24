/**
 * PainScaleSelector Component
 * Post-exercise 1 to 5 visual pain scale with emoji feedback faces
 * matching VELTRIX Screen 5 (Pain & Difficulty).
 */
export default function PainScaleSelector({
  value = 3,
  onChange,
  disabled = false,
}) {
  const levels = [
    { score: 1, label: 'Very Mild', emoji: '😄', color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)' },
    { score: 2, label: 'Mild', emoji: '🙂', color: '#84CC16', bg: 'rgba(132, 204, 22, 0.15)' },
    { score: 3, label: 'Moderate', emoji: '😐', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)' },
    { score: 4, label: 'Severe', emoji: '🙁', color: '#F97316', bg: 'rgba(249, 115, 22, 0.15)' },
    { score: 5, label: 'Very Severe', emoji: '😣', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)' },
  ];

  return (
    <div className="pain-scale-container" role="radiogroup" aria-label="Pain rating scale">
      <div className="pain-scale-buttons-row">
        {levels.map((lvl) => {
          const isSelected = value === lvl.score;
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
        <strong style={{ color: levels.find((l) => l.score === value)?.color }}>
          {levels.find((l) => l.score === value)?.label} ({value}/5)
        </strong>
      </div>
    </div>
  );
}
