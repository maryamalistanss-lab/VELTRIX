import ThemeToggle from '../common/ThemeToggle';
import { useAuth } from '../../hooks/useAuth';

/**
 * TopBar Component
 * Desktop top bar with search, notification alert, ThemeToggle, and user profile pill.
 */
export default function TopBar({ onToggleMobileMenu }) {
  const { user } = useAuth();

  const isTherapist = user?.role === 'THERAPIST';
  const userName = user?.name || (isTherapist ? 'Dr. Priya Sharma' : 'Rahul Mehta');
  const roleLabel = isTherapist ? 'Clinical Therapist' : 'Patient';
  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2);

  return (
    <header className="veltrix-topbar">
      {/* Left: Mobile Toggle & Global Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {onToggleMobileMenu && (
          <button
            type="button"
            className="topbar-btn mobile-menu-toggle"
            onClick={onToggleMobileMenu}
            aria-label="Toggle navigation menu"
            style={{ display: 'none' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        )}

        <div className="topbar-search-wrapper">
          <span className="topbar-search-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search exercises, sessions..."
            className="topbar-search-input"
            aria-label="Search exercises and sessions"
          />
        </div>
      </div>

      {/* Right: Actions, Theme Toggle, User Profile */}
      <div className="topbar-right-actions">
        {/* Theme Toggle Button */}
        <ThemeToggle />

        {/* Notifications Icon */}
        <button
          type="button"
          className="topbar-btn"
          aria-label="Notifications"
          title="Notifications"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          <span
            style={{
              position: 'absolute',
              top: '9px',
              right: '9px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#10B981',
              boxShadow: '0 0 4px #10B981',
            }}
          />
        </button>

        {/* User Profile Pill */}
        <div className="topbar-user-badge">
          <div className="avatar avatar-sm">
            <span>{initials}</span>
          </div>
          <div className="topbar-user-meta">
            <span className="topbar-user-name">{userName}</span>
            <span className="topbar-user-role">{roleLabel}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
