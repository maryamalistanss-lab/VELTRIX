/**
 * Card Component
 * Centralized card container conforming to VELTRIX design standards.
 * Light & dark responsive, restrained shadow, 14px-16px radius.
 */
export default function Card({
  title,
  subtitle,
  headerRight,
  children,
  footer,
  className = '',
  hoverable = false,
  onClick,
}) {
  return (
    <div
      className={`card ${hoverable ? 'card-hoverable' : ''} ${className}`}
      onClick={onClick}
    >
      {(title || headerRight) && (
        <div className="card-header">
          <div>
            {title && <h3 className="card-title">{title}</h3>}
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>
          {headerRight && <div className="card-header-right">{headerRight}</div>}
        </div>
      )}
      <div className="card-body">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
}
