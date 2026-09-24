/**
 * Button Component
 * Standardized button system with 12px border radius, Inter font,
 * Indigo primary, Mint secondary/success, and restrained hover effects.
 */
export default function Button({
  children,
  variant = 'primary', // primary | secondary | outline | success | ghost | danger
  size = 'md', // sm | md | lg
  block = false,
  disabled = false,
  loading = false,
  icon,
  iconRight,
  type = 'button',
  onClick,
  className = '',
  ...props
}) {
  const variantClass = `btn-${variant}`;
  const sizeClass = size !== 'md' ? `btn-${size}` : '';
  const blockClass = block ? 'btn-block' : '';

  return (
    <button
      type={type}
      className={`btn ${variantClass} ${sizeClass} ${blockClass} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <span className="btn-spinner" aria-hidden="true">⏳</span>
      ) : icon ? (
        <span className="btn-icon-left">{icon}</span>
      ) : null}
      <span className="btn-text">{children}</span>
      {!loading && iconRight && (
        <span className="btn-icon-right">{iconRight}</span>
      )}
    </button>
  );
}
