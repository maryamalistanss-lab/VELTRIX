import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import VeltrixBrand from '../components/brand/VeltrixBrand';
import ThemeToggle from '../components/common/ThemeToggle';
import Card from '../components/Card';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../utils/constants';

/**
 * RegisterPage Component
 * Self-registration for Patient Portal with unified VELTRIX brand styling.
 */
export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const { register, isAuthenticated, role, error: authError, clearError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      if (role === 'THERAPIST') {
        navigate(ROUTES.THERAPIST.DASHBOARD, { replace: true });
      } else if (role === 'PATIENT') {
        navigate(ROUTES.PATIENT.DASHBOARD, { replace: true });
      }
    }
  }, [isAuthenticated, role, navigate]);

  const validateForm = () => {
    if (!name.trim()) return 'Please enter your full name.';
    if (!email.trim()) return 'Please enter your email address.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) return 'Please enter a valid email address.';
    if (!password) return 'Please enter a password.';
    if (password.length < 8) return 'Password must be at least 8 characters.';
    if (password !== confirmPassword) return 'Passwords do not match.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);
    clearError();

    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setIsSubmitting(true);
    const result = await register(name, email, password, 'PATIENT');
    setIsSubmitting(false);

    if (result.success) {
      setSuccessMessage('Registration successful! Redirecting to sign in...');
      setTimeout(() => {
        navigate(ROUTES.LOGIN, {
          state: { registeredEmail: email.trim(), message: 'Account created! Please sign in.' },
        });
      }, 1500);
    } else {
      setFormError(result.error || 'Registration failed. Please try again.');
    }
  };

  const displayedError = formError || authError;

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
      <div style={{ position: 'absolute', top: 20, right: 20 }}>
        <ThemeToggle />
      </div>

      <div style={{ width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ marginBottom: 28 }}>
          <VeltrixBrand variant="full" size="lg" portalBadge="Patient Self-Registration" />
        </div>

        <Card style={{ width: '100%', padding: 32, boxShadow: 'var(--shadow-elevated)' }}>
          {/* Tab Switcher */}
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
              onClick={() => navigate(ROUTES.LOGIN)}
              className="btn btn-block btn-sm btn-ghost"
              style={{ borderRadius: 'var(--radius-sm)', fontWeight: 600 }}
            >
              Login
            </button>
            <button
              type="button"
              className="btn btn-block btn-sm btn-primary"
              style={{ borderRadius: 'var(--radius-sm)', fontWeight: 600 }}
            >
              Register
            </button>
          </div>

          {displayedError && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-error-bg)',
                border: '1px solid var(--color-error-border)',
                color: 'var(--color-error)',
                fontSize: 13,
                marginBottom: 20,
              }}
              role="alert"
            >
              ⚠️ {displayedError}
            </div>
          )}

          {successMessage && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-success-bg)',
                border: '1px solid var(--color-success-border)',
                color: 'var(--accent-mint)',
                fontSize: 13,
                marginBottom: 20,
              }}
              role="alert"
            >
              ✅ {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                placeholder="e.g. Jane Patient"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                placeholder="jane.patient@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password (min 8 chars)</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  required
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="btn btn-ghost btn-icon-only"
                  style={{ position: 'absolute', right: 4, top: 4, height: 32, width: 32 }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-input"
                required
                disabled={isSubmitting}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary btn-block btn-lg"
              style={{ marginTop: 12 }}
            >
              {isSubmitting ? 'Creating Account...' : 'Complete Registration'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-secondary)' }}>
            <span>Already have an account? </span>
            <Link to={ROUTES.LOGIN} style={{ fontWeight: 600, color: 'var(--primary-indigo)' }}>
              Sign in
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
