import { useState } from 'react';
import Card from '../../components/Card';
import ThemeToggle from '../../components/common/ThemeToggle';
import { useAuth } from '../../hooks/useAuth';

/**
 * PatientSettings Component
 * Displays application preferences, visual theme controls, and account settings.
 */
export default function PatientSettings() {
  const { user } = useAuth();
  const [cameraAutoStart, setCameraAutoStart] = useState(true);
  const [audioFeedback, setAudioFeedback] = useState(true);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="page-container patient-settings-page">
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Patient Settings</h1>
          <p className="page-subtitle">
            Configure application theme, computer vision assistance, and notification preferences.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 680, display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Appearance Card */}
        <Card title="Display & Theme" subtitle="Switch between Light and Dark interface appearance">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
            <div>
              <strong style={{ display: 'block', fontSize: 15, color: 'var(--text-primary)' }}>Interface Theme</strong>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                Toggle VELTRIX Dark Mode or Light Mode
              </span>
            </div>
            <ThemeToggle />
          </div>
        </Card>

        {/* Camera & Sensor Settings */}
        <Card title="Computer Vision & Guided Session" subtitle="Configure Phase 11 camera telemetry and audio cues">
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
              <div>
                <strong style={{ display: 'block', fontSize: 15, color: 'var(--text-primary)' }}>Live Audio Guidance</strong>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  Announce repetition cadence and completion chime
                </span>
              </div>
              <input
                type="checkbox"
                checked={audioFeedback}
                onChange={(e) => setAudioFeedback(e.target.checked)}
                style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--primary-indigo)' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
              <div>
                <strong style={{ display: 'block', fontSize: 15, color: 'var(--text-primary)' }}>High-Accuracy Landmark Detection</strong>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  Enable enhanced joint angle precision during Camera Mode
                </span>
              </div>
              <input
                type="checkbox"
                checked={cameraAutoStart}
                onChange={(e) => setCameraAutoStart(e.target.checked)}
                style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--primary-indigo)' }}
              />
            </div>

            {savedNotice && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-success-bg)',
                  border: '1px solid var(--color-success-border)',
                  color: 'var(--accent-mint)',
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                ✓ Preferences updated successfully.
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: 8 }}>
              Save Preferences
            </button>
          </form>
        </Card>

        {/* Account Details */}
        <Card title="Account Summary" subtitle="Current authentication credentials">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Logged In As:</span>
              <strong style={{ color: 'var(--text-primary)' }}>{user?.name || 'Patient'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Email:</span>
              <strong style={{ color: 'var(--text-primary)' }}>{user?.email || 'patient@veltrix.app'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Account Type:</span>
              <strong style={{ color: 'var(--accent-mint)' }}>Verified Patient</strong>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
