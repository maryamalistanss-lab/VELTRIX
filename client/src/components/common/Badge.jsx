/**
 * Badge Component
 * Status indicators, pills, tags conforming to VELTRIX colors.
 */
export default function Badge({
  children,
  variant = 'neutral', // primary | mint | success | warning | danger | info | neutral
  icon,
  className = '',
}) {
  return (
    <span className={`badge badge-${variant} ${className}`}>
      {icon && <span className="badge-icon">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
