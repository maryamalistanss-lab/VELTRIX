/**
 * StatCard Component
 * Metric display with icon, value, delta trend, subtitle.
 */
export default function StatCard({
  label,
  value,
  delta,
  isPositive = true,
  icon,
  subtext,
  className = '',
  onClick,
}) {
  return (
    <div className={`kpi-card ${className}`} onClick={onClick}>
      <div className="kpi-header">
        <span className="kpi-label">{label}</span>
        {icon && <div className="kpi-icon-wrapper">{icon}</div>}
      </div>

      <div className="kpi-value-row">
        <span className="kpi-value">{value}</span>
        {delta && (
          <span
            className={`kpi-delta ${
              isPositive ? 'kpi-delta-positive' : 'kpi-delta-negative'
            }`}
          >
            {delta}
          </span>
        )}
      </div>

      {subtext && <p className="kpi-subtext">{subtext}</p>}
    </div>
  );
}
