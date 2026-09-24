import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import VeltrixBrand from '../components/brand/VeltrixBrand';
import ThemeToggle from '../components/common/ThemeToggle';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../utils/constants';

/**
 * LoginPage Component
 * Replicates Screen 1 of Patient & Therapist App in Image 1 & 2.
 * Native VELTRIX branding with official lockup, Login/Register tabs,
 * and quick-testing credentials.
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, error, isLoading } = useAuth();

  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [portalMode, setPortalMode] = useState('patient'); // 'patient' | 'therapist'

  const handleLogin = async (e) => {
    e.preventDefault();

    const result = await login(email, password);

    if (result.success) {
      const returnUrl = location.state?.from?.pathname;
      if (returnUrl) {
        navigate(returnUrl);
        return;
      }

      if (result.user.role === 'PATIENT') {
        navigate(ROUTES.PATIENT.DASHBOARD);
      } else if (result.user.role === 'THERAPIST') {
        navigate(ROUTES.THERAPIST.DASHBOARD);
      }
    }
  };

  const fillTherapistDemo = () => {
    setEmail('therapist.test@veltrix.com');
    setPassword('TestTherapist123');
    setPortalMode('therapist');
  };

  const fillPatientDemo = () => {
    setEmail('patient.test@veltrix.com');
    setPassword('TestPatient123');
    setPortalMode('patient');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        background: 'var(--color-bg)',
        position: 'relative',
      }}
    >
      {/* Top right theme toggle */}
      <div style={{ position: 'absolute', top: 20, right: 20 }}>
        <ThemeToggle />
      </div>

      <div style={{ width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Full VELTRIX Official Logo Lockup */}
        <div style={{ marginBottom: 32 }}>
          <VeltrixBrand
            variant="full"
            size="lg"
            portalBadge={portalMode === 'therapist' ? 'Therapist Portal' : ''}
          />
        </div>

        {/* Card Container matching Screen 1 */}
        <div
          className="card"
          style={{
            width: '100%',
            padding: 32,
            boxShadow: 'var(--shadow-elevated)',
          }}
        >
          {/* Tab Switcher: [Login] [Register] */}
          <div
            style={{
              display: 'flex',
              background: 'var(--color-surface-elevated)',
              borderRadius: 'var(--radius-md)',
              padding: 4,
              marginBottom: 24,
              border: '1px solid var(--border-color)',
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab('login')}
              className={`btn btn-block btn-sm ${activeTab === 'login' ? 'btn-primary' : 'btn-ghost'}`}
              style={{
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
              }}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => navigate(ROUTES.REGISTER)}
              className={`btn btn-block btn-sm ${activeTab === 'register' ? 'btn-primary' : 'btn-ghost'}`}
              style={{
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
              }}
            >
              Register
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-error-bg)',
                border: '1px solid var(--color-error-border)',
                color: 'var(--color-error)',
                fontSize: 13,
                marginBottom: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
              role="alert"
            >
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin}>
            {/* Email Field */}
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                required
                autoComplete="email"
              />
            </div>

            {/* Password Field */}
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                required
                autoComplete="current-password"
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 24,
                fontSize: 13,
              }}
            >
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ accentColor: 'var(--primary-indigo)' }}
                />
                <span>Remember Me</span>
              </label>

              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ padding: 0, fontSize: 13, color: 'var(--primary-indigo)' }}
                onClick={() => alert('Password reset instructions will be sent to your verified email.')}
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary btn-block btn-lg"
            >
              {isLoading ? 'Signing In...' : 'Login'}
            </button>
          </form>

          {/* Bottom Switcher Links */}
          <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-secondary)' }}>
            <span>Don't have an account? </span>
            <Link
              to={ROUTES.REGISTER}
              style={{ fontWeight: 600, color: 'var(--primary-indigo)' }}
            >
              Register
            </Link>
          </div>

          {/* Quick Demo Testing Helpers */}
          <div
            style={{
              marginTop: 24,
              paddingTop: 18,
              borderTop: '1px solid var(--border-color)',
            }}
          >
            <span
              style={{
                display: 'block',
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--text-muted)',
                marginBottom: 10,
                textAlign: 'center',
              }}
            >
              Quick Demo Logins (Testing)
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button
                type="button"
                onClick={fillPatientDemo}
                className="btn btn-outline btn-sm"
                style={{ fontSize: 12 }}
              >
                Patient Demo
              </button>
              <button
                type="button"
                onClick={fillTherapistDemo}
                className="btn btn-outline btn-sm"
                style={{ fontSize: 12 }}
              >
                Therapist Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
